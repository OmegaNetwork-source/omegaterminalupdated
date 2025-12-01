// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OmegaParlay
 * @notice Smart contract for managing prediction market parlays with leverage
 * @dev Supports individual parlays, community pools, and leveraged positions
 * 
 * Key Features:
 * - Create and manage parlay lineups with 2-10 legs
 * - Support leverage up to 5x on positions
 * - Community pools where users can contribute liquidity
 * - Automated settlement and payout distribution
 * - Early cashout functionality
 * - Oracle integration for market resolution
 */
contract OmegaParlay is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // =============================================================================
    // Types & Enums
    // =============================================================================

    enum ParlayStatus { Draft, Active, Won, Lost, Partial, Cancelled, CashedOut }
    enum LegStatus { Pending, Won, Lost, Void, Cancelled }
    enum PoolStatus { Open, Locked, Resolved, Cancelled }
    enum MarketVenue { Polymarket, Kalshi }
    enum MarketSide { Yes, No }

    struct ParlayLeg {
        bytes32 marketId;           // External market identifier (keccak256 hash)
        MarketVenue venue;          // Market platform
        MarketSide side;            // User's prediction
        uint256 entryOdds;          // Odds at entry (scaled by 1e6 for precision)
        uint256 currentOdds;        // Current odds (updated)
        LegStatus status;           // Resolution status
        uint256 resolvedAt;         // Resolution timestamp
    }

    struct Parlay {
        address creator;
        bytes32 id;
        string name;
        uint256 stake;              // Base stake amount
        uint8 leverage;             // 1-5x leverage
        uint256 totalOdds;          // Combined decimal odds (scaled 1e6)
        uint256 potentialPayout;    // stake * totalOdds * leverage
        uint256 currentValue;       // Real-time value
        ParlayStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 resolvedAt;
        uint256 cashoutValue;       // Value if cashed out
        uint8 legCount;
        uint8 wonCount;
        bool isPoolParlay;          // If part of community pool
        bytes32 poolId;             // Associated pool (if any)
    }

    struct CommunityPool {
        bytes32 id;
        address creator;
        string name;
        uint256 totalLiquidity;
        uint256 minEntry;
        uint256 maxEntry;
        uint256 maxParticipants;
        uint256 participantCount;
        uint256 totalOdds;          // Combined odds for pool's parlay
        PoolStatus status;
        uint256 createdAt;
        uint256 resolutionDate;
        bytes32 parlayId;           // Associated parlay
        
        // Tier multipliers (scaled by 1e4, e.g., 12500 = 1.25x)
        uint256 tier1Multiplier;    // Top tier
        uint256 tier2Multiplier;    // Mid tier
        uint256 tier3Multiplier;    // Base tier
        uint256 tier1Threshold;     // Min contribution for tier 1
        uint256 tier2Threshold;     // Min contribution for tier 2
    }

    struct PoolParticipant {
        address user;
        uint256 contribution;
        uint8 tier;
        uint256 joinedAt;
        bool claimed;
        uint256 claimableAmount;
    }

    // =============================================================================
    // State Variables
    // =============================================================================

    // Supported collateral token (USDC/USDT)
    IERC20 public immutable collateralToken;
    
    // Fee configuration
    uint256 public platformFee = 200;           // 2% fee (scaled by 10000)
    uint256 public cashoutFee = 500;            // 5% early cashout fee
    uint256 public leverageFee = 100;           // 1% per leverage level above 1x
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Treasury for collected fees
    address public treasury;
    
    // Oracle addresses for market resolution
    mapping(MarketVenue => address) public venueOracles;
    
    // Parlays storage
    mapping(bytes32 => Parlay) public parlays;
    mapping(bytes32 => ParlayLeg[]) public parlayLegs;
    mapping(address => bytes32[]) public userParlays;
    uint256 public totalParlays;
    
    // Community pools storage
    mapping(bytes32 => CommunityPool) public pools;
    mapping(bytes32 => PoolParticipant[]) public poolParticipants;
    mapping(bytes32 => mapping(address => uint256)) public poolUserIndex;
    mapping(bytes32 => mapping(address => bool)) public poolUserJoined;
    mapping(address => bytes32[]) public userPools;
    uint256 public totalPools;
    
    // Market resolution cache
    mapping(bytes32 => LegStatus) public marketResolutions;
    mapping(bytes32 => uint256) public marketResolutionTime;
    
    // Liquidity reserves for leverage positions
    uint256 public leverageReserve;
    uint256 public maxLeverageExposure;
    
    // =============================================================================
    // Events
    // =============================================================================

    event ParlayCreated(
        bytes32 indexed parlayId,
        address indexed creator,
        uint256 stake,
        uint8 leverage,
        uint8 legCount,
        uint256 potentialPayout
    );
    
    event ParlayUpdated(
        bytes32 indexed parlayId,
        ParlayStatus status,
        uint256 currentValue
    );
    
    event ParlayResolved(
        bytes32 indexed parlayId,
        ParlayStatus status,
        uint256 payout,
        uint8 wonLegs,
        uint8 totalLegs
    );
    
    event ParlayCashedOut(
        bytes32 indexed parlayId,
        address indexed user,
        uint256 cashoutValue,
        uint256 fee
    );
    
    event PoolCreated(
        bytes32 indexed poolId,
        address indexed creator,
        string name,
        uint256 minEntry,
        uint256 maxEntry,
        uint256 totalOdds
    );
    
    event PoolJoined(
        bytes32 indexed poolId,
        address indexed user,
        uint256 contribution,
        uint8 tier
    );
    
    event PoolResolved(
        bytes32 indexed poolId,
        PoolStatus status,
        uint256 totalPayout
    );
    
    event PoolClaimed(
        bytes32 indexed poolId,
        address indexed user,
        uint256 amount,
        uint8 tier
    );
    
    event MarketResolved(
        bytes32 indexed marketId,
        MarketVenue venue,
        LegStatus resolution
    );
    
    event LeverageReserveFunded(uint256 amount);
    event FeesCollected(uint256 amount, address indexed recipient);

    // =============================================================================
    // Constructor
    // =============================================================================

    constructor(
        address _collateralToken,
        address _treasury,
        uint256 _maxLeverageExposure
    ) Ownable(msg.sender) {
        require(_collateralToken != address(0), "Invalid collateral token");
        require(_treasury != address(0), "Invalid treasury");
        
        collateralToken = IERC20(_collateralToken);
        treasury = _treasury;
        maxLeverageExposure = _maxLeverageExposure;
    }

    // =============================================================================
    // Parlay Management
    // =============================================================================

    /**
     * @notice Create a new parlay
     * @param name Parlay name
     * @param stake Base stake amount
     * @param leverage Leverage level (1-5)
     * @param marketIds Array of market IDs
     * @param venues Array of market venues
     * @param sides Array of prediction sides
     * @param entryOdds Array of entry odds (scaled by 1e6)
     */
    function createParlay(
        string calldata name,
        uint256 stake,
        uint8 leverage,
        bytes32[] calldata marketIds,
        MarketVenue[] calldata venues,
        MarketSide[] calldata sides,
        uint256[] calldata entryOdds
    ) external nonReentrant whenNotPaused returns (bytes32 parlayId) {
        require(bytes(name).length > 0, "Name required");
        require(stake > 0, "Stake must be positive");
        require(leverage >= 1 && leverage <= 5, "Invalid leverage");
        require(marketIds.length >= 2 && marketIds.length <= 10, "2-10 legs required");
        require(
            marketIds.length == venues.length &&
            marketIds.length == sides.length &&
            marketIds.length == entryOdds.length,
            "Array length mismatch"
        );
        
        // Check for duplicate markets
        for (uint i = 0; i < marketIds.length; i++) {
            for (uint j = i + 1; j < marketIds.length; j++) {
                require(marketIds[i] != marketIds[j], "Duplicate markets");
            }
        }
        
        // Calculate total odds (multiply all leg odds)
        uint256 totalOdds = 1e6; // Start at 1.0
        for (uint i = 0; i < entryOdds.length; i++) {
            require(entryOdds[i] > 1e6, "Odds must be > 1.0");
            totalOdds = (totalOdds * entryOdds[i]) / 1e6;
        }
        
        // Calculate potential payout with leverage
        uint256 leveragedStake = stake * leverage;
        uint256 potentialPayout = (leveragedStake * totalOdds) / 1e6;
        
        // Check leverage reserve if using leverage
        if (leverage > 1) {
            uint256 leverageAmount = stake * (leverage - 1);
            require(
                leverageReserve >= leverageAmount,
                "Insufficient leverage reserve"
            );
            require(
                potentialPayout <= maxLeverageExposure,
                "Exceeds max leverage exposure"
            );
        }
        
        // Calculate fees
        uint256 platformFeeAmount = (stake * platformFee) / FEE_DENOMINATOR;
        uint256 leverageFeeAmount = leverage > 1 
            ? (stake * leverageFee * (leverage - 1)) / FEE_DENOMINATOR 
            : 0;
        uint256 totalRequired = stake + platformFeeAmount + leverageFeeAmount;
        
        // Transfer collateral from user
        collateralToken.safeTransferFrom(msg.sender, address(this), totalRequired);
        
        // Send fees to treasury
        if (platformFeeAmount + leverageFeeAmount > 0) {
            collateralToken.safeTransfer(treasury, platformFeeAmount + leverageFeeAmount);
            emit FeesCollected(platformFeeAmount + leverageFeeAmount, treasury);
        }
        
        // Reserve leverage amount
        if (leverage > 1) {
            leverageReserve -= stake * (leverage - 1);
        }
        
        // Generate parlay ID
        parlayId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            totalParlays,
            name
        ));
        
        // Create parlay
        parlays[parlayId] = Parlay({
            creator: msg.sender,
            id: parlayId,
            name: name,
            stake: stake,
            leverage: leverage,
            totalOdds: totalOdds,
            potentialPayout: potentialPayout,
            currentValue: stake,
            status: ParlayStatus.Active,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            resolvedAt: 0,
            cashoutValue: 0,
            legCount: uint8(marketIds.length),
            wonCount: 0,
            isPoolParlay: false,
            poolId: bytes32(0)
        });
        
        // Create legs
        for (uint i = 0; i < marketIds.length; i++) {
            parlayLegs[parlayId].push(ParlayLeg({
                marketId: marketIds[i],
                venue: venues[i],
                side: sides[i],
                entryOdds: entryOdds[i],
                currentOdds: entryOdds[i],
                status: LegStatus.Pending,
                resolvedAt: 0
            }));
        }
        
        userParlays[msg.sender].push(parlayId);
        totalParlays++;
        
        emit ParlayCreated(
            parlayId,
            msg.sender,
            stake,
            leverage,
            uint8(marketIds.length),
            potentialPayout
        );
        
        return parlayId;
    }

    /**
     * @notice Cash out a parlay early
     * @param parlayId The parlay to cash out
     */
    function cashout(bytes32 parlayId) external nonReentrant whenNotPaused {
        Parlay storage parlay = parlays[parlayId];
        
        require(parlay.creator == msg.sender, "Not parlay owner");
        require(parlay.status == ParlayStatus.Active, "Cannot cash out");
        require(!parlay.isPoolParlay, "Pool parlays cannot be cashed out individually");
        
        // Check no legs have lost
        ParlayLeg[] storage legs = parlayLegs[parlayId];
        for (uint i = 0; i < legs.length; i++) {
            require(legs[i].status != LegStatus.Lost, "Parlay has lost leg");
        }
        
        // Calculate cashout value based on current odds
        uint256 cashoutValue = _calculateCashoutValue(parlayId);
        require(cashoutValue > 0, "No cashout value");
        
        // Apply cashout fee
        uint256 feeAmount = (cashoutValue * cashoutFee) / FEE_DENOMINATOR;
        uint256 netCashout = cashoutValue - feeAmount;
        
        // Update parlay status
        parlay.status = ParlayStatus.CashedOut;
        parlay.cashoutValue = netCashout;
        parlay.resolvedAt = block.timestamp;
        parlay.updatedAt = block.timestamp;
        
        // Return leverage reserve if applicable
        if (parlay.leverage > 1) {
            leverageReserve += parlay.stake * (parlay.leverage - 1);
        }
        
        // Transfer cashout to user
        collateralToken.safeTransfer(msg.sender, netCashout);
        
        // Transfer fee to treasury
        if (feeAmount > 0) {
            collateralToken.safeTransfer(treasury, feeAmount);
            emit FeesCollected(feeAmount, treasury);
        }
        
        emit ParlayCashedOut(parlayId, msg.sender, netCashout, feeAmount);
    }

    /**
     * @notice Calculate current cashout value for a parlay
     * @param parlayId The parlay ID
     */
    function _calculateCashoutValue(bytes32 parlayId) internal view returns (uint256) {
        Parlay storage parlay = parlays[parlayId];
        ParlayLeg[] storage legs = parlayLegs[parlayId];
        
        uint256 valueFactor = 1e6;
        uint256 pendingOdds = 1e6;
        
        for (uint i = 0; i < legs.length; i++) {
            ParlayLeg storage leg = legs[i];
            
            if (leg.status == LegStatus.Won) {
                // Won leg: full odds realized
                valueFactor = (valueFactor * leg.entryOdds) / 1e6;
            } else if (leg.status == LegStatus.Pending) {
                // Pending leg: value based on current odds
                // If current odds better, value increases
                uint256 oddsRatio = (leg.currentOdds * 1e6) / leg.entryOdds;
                pendingOdds = (pendingOdds * oddsRatio) / 1e6;
            }
            // Lost or void legs: handled by requiring no lost legs
        }
        
        // Apply pending odds improvement/degradation
        valueFactor = (valueFactor * pendingOdds) / 1e6;
        
        // Calculate value with leverage
        uint256 leveragedStake = parlay.stake * parlay.leverage;
        return (leveragedStake * valueFactor) / 1e6;
    }

    // =============================================================================
    // Community Pools
    // =============================================================================

    /**
     * @notice Create a community pool
     * @param name Pool name
     * @param minEntry Minimum entry amount
     * @param maxEntry Maximum entry amount
     * @param maxParticipants Maximum number of participants
     * @param resolutionDate Expected resolution date
     * @param initialLiquidity Creator's initial contribution
     * @param tier1Threshold Tier 1 contribution threshold
     * @param tier2Threshold Tier 2 contribution threshold
     * @param marketIds Market IDs for the pool's parlay
     * @param venues Market venues
     * @param sides Prediction sides
     * @param entryOdds Entry odds
     */
    function createPool(
        string calldata name,
        uint256 minEntry,
        uint256 maxEntry,
        uint256 maxParticipants,
        uint256 resolutionDate,
        uint256 initialLiquidity,
        uint256 tier1Threshold,
        uint256 tier2Threshold,
        bytes32[] calldata marketIds,
        MarketVenue[] calldata venues,
        MarketSide[] calldata sides,
        uint256[] calldata entryOdds
    ) external nonReentrant whenNotPaused returns (bytes32 poolId) {
        require(bytes(name).length > 0, "Name required");
        require(minEntry > 0 && maxEntry >= minEntry, "Invalid entry range");
        require(maxParticipants >= 2, "Min 2 participants");
        require(resolutionDate > block.timestamp, "Invalid resolution date");
        require(initialLiquidity >= minEntry, "Initial must meet min entry");
        require(tier1Threshold > tier2Threshold, "Invalid tier thresholds");
        require(tier2Threshold >= minEntry, "Tier 2 must be >= min entry");
        
        // Calculate total odds
        uint256 totalOdds = 1e6;
        for (uint i = 0; i < entryOdds.length; i++) {
            totalOdds = (totalOdds * entryOdds[i]) / 1e6;
        }
        
        // Generate pool ID
        poolId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            totalPools,
            name
        ));
        
        // Create underlying parlay for pool
        bytes32 parlayId = keccak256(abi.encodePacked(poolId, "parlay"));
        
        parlays[parlayId] = Parlay({
            creator: address(this), // Contract owns pool parlay
            id: parlayId,
            name: string(abi.encodePacked("Pool: ", name)),
            stake: initialLiquidity,
            leverage: 1, // Pools don't use leverage
            totalOdds: totalOdds,
            potentialPayout: (initialLiquidity * totalOdds) / 1e6,
            currentValue: initialLiquidity,
            status: ParlayStatus.Active,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            resolvedAt: 0,
            cashoutValue: 0,
            legCount: uint8(marketIds.length),
            wonCount: 0,
            isPoolParlay: true,
            poolId: poolId
        });
        
        // Create legs
        for (uint i = 0; i < marketIds.length; i++) {
            parlayLegs[parlayId].push(ParlayLeg({
                marketId: marketIds[i],
                venue: venues[i],
                side: sides[i],
                entryOdds: entryOdds[i],
                currentOdds: entryOdds[i],
                status: LegStatus.Pending,
                resolvedAt: 0
            }));
        }
        
        // Create pool
        pools[poolId] = CommunityPool({
            id: poolId,
            creator: msg.sender,
            name: name,
            totalLiquidity: initialLiquidity,
            minEntry: minEntry,
            maxEntry: maxEntry,
            maxParticipants: maxParticipants,
            participantCount: 1,
            totalOdds: totalOdds,
            status: PoolStatus.Open,
            createdAt: block.timestamp,
            resolutionDate: resolutionDate,
            parlayId: parlayId,
            tier1Multiplier: 12500, // 1.25x
            tier2Multiplier: 11000, // 1.1x
            tier3Multiplier: 10000, // 1.0x
            tier1Threshold: tier1Threshold,
            tier2Threshold: tier2Threshold
        });
        
        // Add creator as first participant
        uint8 creatorTier = _calculateTier(poolId, initialLiquidity);
        poolParticipants[poolId].push(PoolParticipant({
            user: msg.sender,
            contribution: initialLiquidity,
            tier: creatorTier,
            joinedAt: block.timestamp,
            claimed: false,
            claimableAmount: 0
        }));
        poolUserJoined[poolId][msg.sender] = true;
        poolUserIndex[poolId][msg.sender] = 0;
        userPools[msg.sender].push(poolId);
        
        // Transfer initial liquidity
        collateralToken.safeTransferFrom(msg.sender, address(this), initialLiquidity);
        
        totalPools++;
        
        emit PoolCreated(poolId, msg.sender, name, minEntry, maxEntry, totalOdds);
        emit PoolJoined(poolId, msg.sender, initialLiquidity, creatorTier);
        
        return poolId;
    }

    /**
     * @notice Join a community pool
     * @param poolId Pool to join
     * @param contribution Contribution amount
     */
    function joinPool(bytes32 poolId, uint256 contribution) external nonReentrant whenNotPaused {
        CommunityPool storage pool = pools[poolId];
        
        require(pool.status == PoolStatus.Open, "Pool not open");
        require(!poolUserJoined[poolId][msg.sender], "Already joined");
        require(pool.participantCount < pool.maxParticipants, "Pool full");
        require(contribution >= pool.minEntry, "Below min entry");
        require(contribution <= pool.maxEntry, "Above max entry");
        
        // Calculate tier
        uint8 tier = _calculateTier(poolId, contribution);
        
        // Add participant
        poolParticipants[poolId].push(PoolParticipant({
            user: msg.sender,
            contribution: contribution,
            tier: tier,
            joinedAt: block.timestamp,
            claimed: false,
            claimableAmount: 0
        }));
        
        poolUserJoined[poolId][msg.sender] = true;
        poolUserIndex[poolId][msg.sender] = pool.participantCount;
        userPools[msg.sender].push(poolId);
        
        pool.totalLiquidity += contribution;
        pool.participantCount++;
        
        // Update underlying parlay
        Parlay storage parlay = parlays[pool.parlayId];
        parlay.stake = pool.totalLiquidity;
        parlay.potentialPayout = (pool.totalLiquidity * pool.totalOdds) / 1e6;
        parlay.currentValue = pool.totalLiquidity;
        parlay.updatedAt = block.timestamp;
        
        // Transfer contribution
        collateralToken.safeTransferFrom(msg.sender, address(this), contribution);
        
        emit PoolJoined(poolId, msg.sender, contribution, tier);
    }

    /**
     * @notice Calculate contribution tier
     */
    function _calculateTier(bytes32 poolId, uint256 contribution) internal view returns (uint8) {
        CommunityPool storage pool = pools[poolId];
        
        if (contribution >= pool.tier1Threshold) return 1;
        if (contribution >= pool.tier2Threshold) return 2;
        return 3;
    }

    /**
     * @notice Claim winnings from a resolved pool
     * @param poolId Pool to claim from
     */
    function claimPoolWinnings(bytes32 poolId) external nonReentrant {
        CommunityPool storage pool = pools[poolId];
        require(pool.status == PoolStatus.Resolved, "Pool not resolved");
        require(poolUserJoined[poolId][msg.sender], "Not a participant");
        
        uint256 index = poolUserIndex[poolId][msg.sender];
        PoolParticipant storage participant = poolParticipants[poolId][index];
        
        require(!participant.claimed, "Already claimed");
        require(participant.claimableAmount > 0, "Nothing to claim");
        
        participant.claimed = true;
        uint256 amount = participant.claimableAmount;
        
        collateralToken.safeTransfer(msg.sender, amount);
        
        emit PoolClaimed(poolId, msg.sender, amount, participant.tier);
    }

    // =============================================================================
    // Oracle & Resolution
    // =============================================================================

    /**
     * @notice Set venue oracle address
     * @param venue Market venue
     * @param oracle Oracle contract address
     */
    function setVenueOracle(MarketVenue venue, address oracle) external onlyOwner {
        require(oracle != address(0), "Invalid oracle");
        venueOracles[venue] = oracle;
    }

    /**
     * @notice Resolve a market (called by oracle)
     * @param marketId Market to resolve
     * @param venue Market venue
     * @param resolution Resolution status
     */
    function resolveMarket(
        bytes32 marketId,
        MarketVenue venue,
        LegStatus resolution
    ) external {
        require(
            msg.sender == venueOracles[venue] || msg.sender == owner(),
            "Not authorized"
        );
        require(
            resolution == LegStatus.Won || 
            resolution == LegStatus.Lost || 
            resolution == LegStatus.Void,
            "Invalid resolution"
        );
        
        marketResolutions[marketId] = resolution;
        marketResolutionTime[marketId] = block.timestamp;
        
        emit MarketResolved(marketId, venue, resolution);
    }

    /**
     * @notice Resolve a parlay based on market resolutions
     * @param parlayId Parlay to resolve
     */
    function resolveParlay(bytes32 parlayId) external nonReentrant {
        Parlay storage parlay = parlays[parlayId];
        require(parlay.status == ParlayStatus.Active, "Not active");
        
        ParlayLeg[] storage legs = parlayLegs[parlayId];
        bool allResolved = true;
        bool anyLost = false;
        uint8 wonCount = 0;
        
        for (uint i = 0; i < legs.length; i++) {
            ParlayLeg storage leg = legs[i];
            
            if (leg.status == LegStatus.Pending) {
                LegStatus resolution = marketResolutions[leg.marketId];
                
                if (resolution == LegStatus.Pending) {
                    allResolved = false;
                } else {
                    leg.status = resolution;
                    leg.resolvedAt = marketResolutionTime[leg.marketId];
                    
                    if (resolution == LegStatus.Won) {
                        wonCount++;
                    } else if (resolution == LegStatus.Lost) {
                        anyLost = true;
                    }
                }
            } else if (leg.status == LegStatus.Won) {
                wonCount++;
            } else if (leg.status == LegStatus.Lost) {
                anyLost = true;
            }
        }
        
        parlay.wonCount = wonCount;
        parlay.updatedAt = block.timestamp;
        
        // Determine final status
        if (anyLost) {
            parlay.status = ParlayStatus.Lost;
            parlay.resolvedAt = block.timestamp;
            parlay.currentValue = 0;
            
            // Return leverage reserve
            if (parlay.leverage > 1) {
                leverageReserve += parlay.stake * (parlay.leverage - 1);
            }
            
            emit ParlayResolved(parlayId, ParlayStatus.Lost, 0, wonCount, parlay.legCount);
        } else if (allResolved && wonCount == parlay.legCount) {
            parlay.status = ParlayStatus.Won;
            parlay.resolvedAt = block.timestamp;
            parlay.currentValue = parlay.potentialPayout;
            
            // Handle payout
            if (!parlay.isPoolParlay) {
                // Direct payout to creator
                collateralToken.safeTransfer(parlay.creator, parlay.potentialPayout);
            }
            
            emit ParlayResolved(parlayId, ParlayStatus.Won, parlay.potentialPayout, wonCount, parlay.legCount);
        } else if (allResolved) {
            // Partial - some legs voided
            parlay.status = ParlayStatus.Partial;
            parlay.resolvedAt = block.timestamp;
            
            // Calculate partial payout based on won legs
            uint256 partialOdds = 1e6;
            for (uint i = 0; i < legs.length; i++) {
                if (legs[i].status == LegStatus.Won) {
                    partialOdds = (partialOdds * legs[i].entryOdds) / 1e6;
                }
            }
            
            uint256 partialPayout = (parlay.stake * parlay.leverage * partialOdds) / 1e6;
            parlay.currentValue = partialPayout;
            
            if (!parlay.isPoolParlay) {
                collateralToken.safeTransfer(parlay.creator, partialPayout);
            }
            
            emit ParlayResolved(parlayId, ParlayStatus.Partial, partialPayout, wonCount, parlay.legCount);
        }
        
        // Handle pool resolution
        if (parlay.isPoolParlay && parlay.status != ParlayStatus.Active) {
            _resolvePool(parlay.poolId);
        }
    }

    /**
     * @notice Internal pool resolution
     */
    function _resolvePool(bytes32 poolId) internal {
        CommunityPool storage pool = pools[poolId];
        Parlay storage parlay = parlays[pool.parlayId];
        
        pool.status = PoolStatus.Resolved;
        
        if (parlay.status == ParlayStatus.Won || parlay.status == ParlayStatus.Partial) {
            uint256 totalPayout = parlay.currentValue;
            uint256 feeAmount = (totalPayout * platformFee) / FEE_DENOMINATOR;
            uint256 distributableAmount = totalPayout - feeAmount;
            
            // Calculate weighted payouts with tier multipliers
            uint256 totalWeightedContribution = 0;
            PoolParticipant[] storage participants = poolParticipants[poolId];
            
            for (uint i = 0; i < participants.length; i++) {
                PoolParticipant storage p = participants[i];
                uint256 multiplier = p.tier == 1 ? pool.tier1Multiplier :
                                    p.tier == 2 ? pool.tier2Multiplier :
                                    pool.tier3Multiplier;
                totalWeightedContribution += (p.contribution * multiplier) / 10000;
            }
            
            // Calculate individual payouts
            for (uint i = 0; i < participants.length; i++) {
                PoolParticipant storage p = participants[i];
                uint256 multiplier = p.tier == 1 ? pool.tier1Multiplier :
                                    p.tier == 2 ? pool.tier2Multiplier :
                                    pool.tier3Multiplier;
                uint256 weightedContribution = (p.contribution * multiplier) / 10000;
                p.claimableAmount = (distributableAmount * weightedContribution) / totalWeightedContribution;
            }
            
            // Send fee to treasury
            if (feeAmount > 0) {
                collateralToken.safeTransfer(treasury, feeAmount);
                emit FeesCollected(feeAmount, treasury);
            }
            
            emit PoolResolved(poolId, PoolStatus.Resolved, distributableAmount);
        } else {
            // Pool lost - nothing to distribute
            emit PoolResolved(poolId, PoolStatus.Resolved, 0);
        }
    }

    // =============================================================================
    // Leverage Reserve Management
    // =============================================================================

    /**
     * @notice Fund the leverage reserve
     * @param amount Amount to fund
     */
    function fundLeverageReserve(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        leverageReserve += amount;
        emit LeverageReserveFunded(amount);
    }

    /**
     * @notice Set maximum leverage exposure
     * @param _maxExposure New maximum exposure
     */
    function setMaxLeverageExposure(uint256 _maxExposure) external onlyOwner {
        maxLeverageExposure = _maxExposure;
    }

    // =============================================================================
    // Admin Functions
    // =============================================================================

    /**
     * @notice Update platform fee
     * @param _fee New fee (in basis points)
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    /**
     * @notice Update cashout fee
     * @param _fee New fee (in basis points)
     */
    function setCashoutFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1500, "Fee too high"); // Max 15%
        cashoutFee = _fee;
    }

    /**
     * @notice Update treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw (only owner)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(IERC20 token, uint256 amount) external onlyOwner {
        token.safeTransfer(owner(), amount);
    }

    // =============================================================================
    // View Functions
    // =============================================================================

    /**
     * @notice Get parlay details
     */
    function getParlay(bytes32 parlayId) external view returns (
        Parlay memory parlay,
        ParlayLeg[] memory legs
    ) {
        return (parlays[parlayId], parlayLegs[parlayId]);
    }

    /**
     * @notice Get user's parlays
     */
    function getUserParlays(address user) external view returns (bytes32[] memory) {
        return userParlays[user];
    }

    /**
     * @notice Get pool details
     */
    function getPool(bytes32 poolId) external view returns (
        CommunityPool memory pool,
        PoolParticipant[] memory participants
    ) {
        return (pools[poolId], poolParticipants[poolId]);
    }

    /**
     * @notice Get user's pools
     */
    function getUserPools(address user) external view returns (bytes32[] memory) {
        return userPools[user];
    }

    /**
     * @notice Get cashout value for a parlay
     */
    function getCashoutValue(bytes32 parlayId) external view returns (uint256) {
        Parlay storage parlay = parlays[parlayId];
        if (parlay.status != ParlayStatus.Active) return 0;
        
        // Check no legs have lost
        ParlayLeg[] storage legs = parlayLegs[parlayId];
        for (uint i = 0; i < legs.length; i++) {
            if (legs[i].status == LegStatus.Lost) return 0;
        }
        
        uint256 cashoutValue = _calculateCashoutValue(parlayId);
        uint256 feeAmount = (cashoutValue * cashoutFee) / FEE_DENOMINATOR;
        return cashoutValue - feeAmount;
    }
}

