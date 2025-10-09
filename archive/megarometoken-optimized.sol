// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MegaRomeTokenFactory - Optimized Version
 * @dev Lightweight token factory for Rome Network
 */
contract MegaRomeTokenFactory {
    
    address public owner;
    uint256 public creationFee = 0.01 ether;
    address public feeRecipient;
    string public networkName = "Rome";
    
    address[] public createdTokens;
    mapping(address => bool) public isCreatedToken;
    mapping(address => address[]) public creatorTokens;
    
    struct TokenInfo {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 creationTime;
        string network;
        uint8 decimals;
    }
    
    mapping(address => TokenInfo) public tokenInfo;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 timestamp,
        string network
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals
    ) external payable returns (address tokenAddress) {
        require(msg.value >= creationFee, "Insufficient fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(decimals <= 18, "Decimals cannot exceed 18");
        
        // Create new token contract
        MegaRomeToken newToken = new MegaRomeToken(
            name,
            symbol,
            totalSupply,
            decimals,
            msg.sender,
            networkName
        );
        
        tokenAddress = address(newToken);
        
        // Store token info
        tokenInfo[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            totalSupply: totalSupply,
            creationTime: block.timestamp,
            network: networkName,
            decimals: decimals
        });
        
        // Update mappings and arrays
        createdTokens.push(tokenAddress);
        creatorTokens[msg.sender].push(tokenAddress);
        isCreatedToken[tokenAddress] = true;
        
        // Transfer fee to recipient
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit TokenCreated(
            tokenAddress,
            msg.sender,
            name,
            symbol,
            totalSupply,
            block.timestamp,
            networkName
        );
        
        return tokenAddress;
    }
    
    function getTotalTokens() external view returns (uint256) {
        return createdTokens.length;
    }
    
    function getAllTokens() external view returns (address[] memory) {
        return createdTokens;
    }
    
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }
    
    function getTokenInfo(address tokenAddress) external view returns (TokenInfo memory) {
        require(isCreatedToken[tokenAddress], "Token not found");
        return tokenInfo[tokenAddress];
    }
    
    function updateCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }
    
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    function updateNetworkName(string memory newNetwork) external onlyOwner {
        networkName = newNetwork;
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner).transfer(balance);
    }
}

/**
 * @title MegaRomeToken - Minimal ERC-20
 * @dev Lightweight ERC-20 token implementation
 */
contract MegaRomeToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    address private _owner;
    string private _network;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    modifier onlyOwner() {
        require(msg.sender == _owner, "Not the owner");
        _;
    }
    
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        uint8 decimals_,
        address owner_,
        string memory network_
    ) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _owner = owner_;
        _network = network_;
        _totalSupply = totalSupply_;
        _balances[owner_] = totalSupply_;
        emit Transfer(address(0), owner_, totalSupply_);
    }
    
    function name() public view returns (string memory) { return _name; }
    function symbol() public view returns (string memory) { return _symbol; }
    function decimals() public view returns (uint8) { return _decimals; }
    function totalSupply() public view returns (uint256) { return _totalSupply; }
    function balanceOf(address account) public view returns (uint256) { return _balances[account]; }
    function network() public view returns (string memory) { return _network; }
    function owner() public view returns (address) { return _owner; }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner_, address spender) public view returns (uint256) {
        return _allowances[owner_][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "transfer amount exceeds allowance");
        
        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);
        
        return true;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "mint to the zero address");
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function burn(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "burn amount exceeds balance");
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "transfer from the zero address");
        require(to != address(0), "transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "transfer amount exceeds balance");
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "approve from the zero address");
        require(spender != address(0), "approve to the zero address");
        
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }
}
