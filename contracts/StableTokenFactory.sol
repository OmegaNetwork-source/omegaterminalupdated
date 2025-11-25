// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

/**
 * @title StableTokenFactory
 * @notice Factory contract for creating ERC20 tokens on Stable Network
 * @dev Deploy this contract once, then users can create unlimited tokens
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
contract StableToken is ERC20, Ownable {
    uint8 private _decimals;
    bool public immutable isMintable;
    bool public immutable isPausable;
    bool private _paused;

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
    ) ERC20(name_, symbol_) Ownable(owner_) {
        _decimals = decimals_;
        isMintable = mintable_;
        isPausable = pausable_;

        // Convert initial supply to token units (with decimals)
        uint256 supplyWithDecimals = initialSupply_ * (10 ** decimals_);

        // Mint initial supply to creator
        if (supplyWithDecimals > 0) {
            _mint(owner_, supplyWithDecimals);
        }
    }

    /**
     * @notice Returns the number of decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
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
        _mint(to, amountWithDecimals);
    }

    /**
     * @notice Pause token transfers (only if pausable)
     */
    function pause() external onlyOwner {
        require(isPausable, "Token is not pausable");
        require(!_paused, "Token is already paused");
        _paused = true;
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        require(_paused, "Token is not paused");
        _paused = false;
    }

    /**
     * @notice Check if token is paused
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @notice Override transfer to check pause status
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!_paused, "Token transfers are paused");
        super._update(from, to, amount);
    }
}


