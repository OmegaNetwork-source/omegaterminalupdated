// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RomeUsernameRegistry
 * @dev Username/ENS system for Rome Network (.rome domains)
 * @author Omega Network
 */
contract RomeUsernameRegistry {
    address public owner;
    bool private locked;
    
    uint256 public registrationFee = 0.001 ether; // 0.001 RSOL
    uint256 public totalRegistrations;
    
    struct Username {
        address owner;
        string username;
        uint256 registrationTime;
        uint256 expirationTime;
        bool isActive;
    }
    
    // Mappings
    mapping(string => Username) public usernames;
    mapping(address => string[]) public usersByAddress;
    mapping(string => bool) public isRegistered;
    
    // Events
    event UsernameRegistered(
        address indexed owner,
        string username,
        uint256 registrationTime,
        uint256 expirationTime
    );
    event UsernameTransferred(
        address indexed from,
        address indexed to,
        string username
    );
    event UsernameRenewed(
        string username,
        uint256 newExpirationTime
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a new username
     */
    function registerUsername(string memory username) external payable nonReentrant returns (bool) {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 32, "Username too long");
        require(!isRegistered[username], "Username already taken");
        require(msg.value >= registrationFee, "Insufficient fee");
        require(isValidUsername(username), "Invalid username");
        
        uint256 expirationTime = block.timestamp + 365 days; // 1 year registration
        
        usernames[username] = Username({
            owner: msg.sender,
            username: username,
            registrationTime: block.timestamp,
            expirationTime: expirationTime,
            isActive: true
        });
        
        usersByAddress[msg.sender].push(username);
        isRegistered[username] = true;
        totalRegistrations++;
        
        emit UsernameRegistered(msg.sender, username, block.timestamp, expirationTime);
        
        return true;
    }
    
    /**
     * @dev Renew username registration
     */
    function renewUsername(string memory username) external payable nonReentrant {
        require(isRegistered[username], "Username not registered");
        Username storage user = usernames[username];
        require(user.owner == msg.sender, "Not username owner");
        require(msg.value >= registrationFee, "Insufficient fee");
        
        user.expirationTime = user.expirationTime + 365 days;
        
        emit UsernameRenewed(username, user.expirationTime);
    }
    
    /**
     * @dev Transfer username to another address
     */
    function transferUsername(string memory username, address to) external {
        require(isRegistered[username], "Username not registered");
        Username storage user = usernames[username];
        require(user.owner == msg.sender, "Not username owner");
        require(to != address(0), "Invalid recipient");
        require(block.timestamp < user.expirationTime, "Username expired");
        
        address from = msg.sender;
        user.owner = to;
        usersByAddress[to].push(username);
        
        emit UsernameTransferred(from, to, username);
    }
    
    /**
     * @dev Check if username is valid (alphanumeric, hyphens, underscores only)
     */
    function isValidUsername(string memory username) public pure returns (bool) {
        bytes memory b = bytes(username);
        
        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            
            if (!(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x61 && char <= 0x7A) || // a-z
                (char >= 0x41 && char <= 0x5A) || // A-Z
                char == 0x2D || // hyphen -
                char == 0x5F    // underscore _
            )) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Get username info
     */
    function getUsernameInfo(string memory username) external view returns (
        address usernameOwner,
        uint256 registrationTime,
        uint256 expirationTime,
        bool isActive
    ) {
        require(isRegistered[username], "Username not registered");
        Username memory user = usernames[username];
        return (user.owner, user.registrationTime, user.expirationTime, user.isActive);
    }
    
    /**
     * @dev Get all usernames by address
     */
    function getUsernamesByAddress(address addr) external view returns (string[] memory) {
        return usersByAddress[addr];
    }
    
    /**
     * @dev Check if username is available
     */
    function isUsernameAvailable(string memory username) external view returns (bool) {
        if (!isRegistered[username]) {
            return true;
        }
        
        Username memory user = usernames[username];
        return block.timestamp >= user.expirationTime;
    }
    
    /**
     * @dev Resolve username to address
     */
    function resolveUsername(string memory username) external view returns (address) {
        require(isRegistered[username], "Username not registered");
        Username memory user = usernames[username];
        require(block.timestamp < user.expirationTime, "Username expired");
        return user.owner;
    }
    
    /**
     * @dev Update registration fee
     */
    function updateRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }
    
    /**
     * @dev Withdraw collected fees
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        payable(owner).transfer(balance);
    }
    
    /**
     * @dev Get total registrations
     */
    function getTotalRegistrations() external view returns (uint256) {
        return totalRegistrations;
    }
}

