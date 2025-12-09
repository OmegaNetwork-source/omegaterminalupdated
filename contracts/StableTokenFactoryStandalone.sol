// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StableTokenFactory (Standalone - No Dependencies)
 * @notice Factory contract for creating ERC20 tokens on Stable Network
 * @dev Deploy this contract once on Remix, then users can create unlimited tokens
 * 
 * DEPLOYMENT INSTRUCTIONS FOR REMIX:
 * 1. Go to https://remix.ethereum.org/
 * 2. Create a new file: StableTokenFactory.sol
 * 3. Copy this entire contract
 * 4. Compile with Solidity 0.8.20 or higher
 * 5. Deploy to Stable Network testnet (Chain ID: 2201)
 * 6. RPC: https://rpc.testnet.stable.xyz
 * 7. Save the deployed factory address for terminal integration
 */
contract StableTokenFactory {
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint8 decimals,
        uint256 initialSupply,
        bool mintable,
        bool pausable
    );

    /**
     * @notice Creates a new ERC20 token
     * @param name_ Token name (e.g., "My Token")
     * @param symbol_ Token symbol (e.g., "MTK")
     * @param decimals_ Number of decimals (typically 18)
     * @param initialSupply_ Initial supply (in whole tokens, will be multiplied by 10^decimals)
     * @param mintable_ Whether the token can be minted after creation
     * @param pausable_ Whether the token can be paused
     * @return tokenAddress The address of the newly created token
     */
    function createToken(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        bool mintable_,
        bool pausable_
    ) external returns (address tokenAddress) {
        // Deploy new token contract
        StableToken token = new StableToken(
            name_,
            symbol_,
            decimals_,
            initialSupply_,
            mintable_,
            pausable_,
            msg.sender
        );

        tokenAddress = address(token);

        emit TokenCreated(
            tokenAddress,
            msg.sender,
            name_,
            symbol_,
            decimals_,
            initialSupply_,
            mintable_,
            pausable_
        );

        return tokenAddress;
    }
}

/**
 * @title StableToken
 * @notice ERC20 token created by StableTokenFactory
 * @dev Supports optional minting and pausing functionality
 */
contract StableToken {
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalSupply;
    bool public immutable isMintable;
    bool public immutable isPausable;
    bool private _paused;
    address public owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!_paused, "Token is paused");
        _;
    }

    /**
     * @notice Constructor for StableToken
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param decimals_ Number of decimals
     * @param initialSupply_ Initial supply (in whole tokens)
     * @param mintable_ Whether token can be minted
     * @param pausable_ Whether token can be paused
     * @param owner_ Owner address (token creator)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        bool mintable_,
        bool pausable_,
        address owner_
    ) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        isMintable = mintable_;
        isPausable = pausable_;
        owner = owner_;

        // Convert initial supply to token units (with decimals)
        uint256 supplyWithDecimals = initialSupply_ * (10 ** decimals_);
        _totalSupply = supplyWithDecimals;

        // Mint initial supply to creator
        if (supplyWithDecimals > 0) {
            _balances[owner_] = supplyWithDecimals;
            emit Transfer(address(0), owner_, supplyWithDecimals);
        }
    }

    /**
     * @notice Returns the name of the token
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @notice Returns the symbol of the token
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Returns the number of decimals
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Returns the total supply
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @notice Returns the balance of an account
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Returns the allowance
     */
    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }

    /**
     * @notice Transfer tokens
     */
    function transfer(address to, uint256 amount) public whenNotPaused returns (bool) {
        address owner_ = msg.sender;
        _transfer(owner_, to, amount);
        return true;
    }

    /**
     * @notice Approve spender
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner_ = msg.sender;
        _approve(owner_, spender, amount);
        return true;
    }

    /**
     * @notice Transfer from (for approvals)
     */
    function transferFrom(address from, address to, uint256 amount) public whenNotPaused returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Mint new tokens (only if mintable)
     * @param to Address to mint tokens to
     * @param amount Amount to mint (in whole tokens)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(isMintable, "Token is not mintable");
        require(!_paused, "Token is paused");
        
        uint256 amountWithDecimals = amount * (10 ** _decimals);
        _totalSupply += amountWithDecimals;
        _balances[to] += amountWithDecimals;
        emit Transfer(address(0), to, amountWithDecimals);
    }

    /**
     * @notice Burn tokens
     */
    function burn(uint256 amount) external {
        address account = msg.sender;
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "Burn amount exceeds balance");
        
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    /**
     * @notice Pause token transfers (only if pausable)
     */
    function pause() external onlyOwner {
        require(isPausable, "Token is not pausable");
        require(!_paused, "Token is already paused");
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        require(_paused, "Token is not paused");
        _paused = false;
        emit Unpaused(msg.sender);
    }

    /**
     * @notice Check if token is paused
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @notice Internal transfer function
     */
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "Transfer amount exceeds balance");
        
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

    /**
     * @notice Internal approve function
     */
    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");

        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }

    /**
     * @notice Internal spend allowance function
     */
    function _spendAllowance(address owner_, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner_, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            unchecked {
                _approve(owner_, spender, currentAllowance - amount);
            }
        }
    }
}


