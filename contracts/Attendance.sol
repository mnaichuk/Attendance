// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {
    struct UserCheckin {
        uint lastCallTime;
        uint streakCount;
    }

    mapping(address => UserCheckin) private userCheckins;
    uint private nonce = 0;
    uint private lastRandomHash;

    // Event declaration
    event Checkin(address indexed user, uint randomNumber);

    // Constants for cooldown and streak logic
    uint private constant COOLDOWN = 1 days;
    uint private constant STREAK_RESET_TIME = 2 days; // Time after which the streak is reset
    uint private constant STREAK_BONUS_DAY = 7;

    function checkin() public returns (uint) {
        require(userCheckins[msg.sender].lastCallTime + COOLDOWN <= block.timestamp, "Cooldown period not over");

        // Check if the call is within the next day for streak continuity
        if (userCheckins[msg.sender].lastCallTime + STREAK_RESET_TIME > block.timestamp) {
            userCheckins[msg.sender].streakCount++;
        } else {
            userCheckins[msg.sender].streakCount = 1; // Reset streak if more than 2 days have passed
        }

        userCheckins[msg.sender].lastCallTime = block.timestamp; // Update the last call time to current

        uint randomNumber;
        if (userCheckins[msg.sender].streakCount >= STREAK_BONUS_DAY) {
            // Generate a random number with an even distribution for the weekly bonus
            randomNumber = generateRandom(10, 100);
            userCheckins[msg.sender].streakCount = 0; // Reset streak after applying bonus
        } else {
            // Generate a daily random number with a skewed distribution
            randomNumber = generateRandom(1, 9);
        }

        // Emit the Checkin event with the generated random number
        emit Checkin(msg.sender, randomNumber);

        return randomNumber;
    }

    // Internal function to generate a random number
    // with either a skewed or even distribution based on input range
    function generateRandom(uint min, uint max) internal returns (uint) {
        nonce++;
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce, lastRandomHash, tx.gasprice)));
        lastRandomHash = randomHash; // Save the current hash for the next call

        uint range = max - min + 1;
        uint random = randomHash % range + min;

        return random;
    }

    // Public function to get user check-in data
    function getUserCheckinData(address userAddress) public view returns (uint, uint) {
        UserCheckin memory userCheckinData = userCheckins[userAddress]; // Use a distinct name
        return (userCheckinData.lastCallTime, userCheckinData.streakCount);
    }
}
