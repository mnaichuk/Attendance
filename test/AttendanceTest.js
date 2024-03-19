const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Attendance Contract", function () {
  let Attendance;
  let attendance;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Deploy the Attendance contract before each test
    Attendance = await ethers.getContractFactory("Attendance");
    [owner, addr1] = await ethers.getSigners();
    attendance = await Attendance.deploy();
  });

  describe("Checkin Functionality", function () {
    it("Should allow a user to check in and update lastCallTime and streakCount", async function () {
      // addr1 checks in for the first time
      await attendance.connect(addr1).checkin();

      // Fetch updated user data using the getUserCheckinData function
      const [lastCallTime, streakCount] = await attendance.getUserCheckinData(addr1.address);

      // Assert the streak count is incremented
      expect(streakCount).to.equal(1);

      // You may also want to verify that the lastCallTime is updated correctly
      // This is a bit tricky due to the block timestamp, but you can check if it's reasonably close to the current time
    });

    it("Should reset the streak if checking in after STREAK_RESET_TIME", async function () {
      // First check-in
      await attendance.connect(addr1).checkin();

      // Simulate waiting for more than STREAK_RESET_TIME by increasing the blockchain timestamp
      await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60 + 1]); // 2 days + 1 second
      await ethers.provider.send("evm_mine"); // Mine a new block to ensure the timestamp change takes effect

      // Second check-in after STREAK_RESET_TIME
      await attendance.connect(addr1).checkin();

      // Fetch updated user data
      const [lastCallTimeAfter, streakCountAfter] = await attendance.getUserCheckinData(addr1.address);

      // Assert the streak count is reset to 1
      expect(streakCountAfter).to.equal(1);
    });

    it("Should generate numbers within the expected range for daily check-ins and a bonus on the 7th day", async function () {
        for (let day = 1; day <= 7; day++) {
            const txResponse = await attendance.connect(addr1).checkin();
            const txReceipt = await txResponse.wait();

            let checkinEventFound = false;
            let randomNumberValue;

            for (const log of txReceipt.logs) {
                try {
                    const event = attendance.interface.parseLog(log);
                    if (event.name === "Checkin") {
                        checkinEventFound = true;
                        // Extract randomNumber assuming it's the second argument
                        randomNumberValue = event.args[1]; // Directly use the indexed position
                        break;
                    }
                } catch (error) {
                    // Log wasn't relevant
                }
            }

            expect(checkinEventFound, "Checkin event not found").to.be.true;

            // Handle randomNumber as BigInt
            const randomNumber = Number(randomNumberValue); // Convert BigInt to Number for comparison

            // Assert randomNumber is within the expected range
            if (day < 7) {
                console.log(`Day ${day} randomNumber: ${randomNumber}`);
                expect(randomNumber, `Day ${day} randomNumber`).to.be.within(1, 9);
            } else {
                console.log(`Day 7 randomNumber: ${randomNumber}`);
                expect(randomNumber, "Day 7 randomNumber").to.be.within(10, 100);
            }

            // Advance time by 1 day for the next check-in
            await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
        }
    });
  });
});
