// const Web3 = require('web3');
require('dotenv').config();

// Replace these with your contract's details
const contractABI = require('./artifacts/contracts/Attendance.sol/Attendance.json').abi; // Path to ABI file
const contractAddress = '0x2e60C0099aCe54D5A66F7F6dB31a2793419Ea457';

// Initialize web3 with Linea Testnet RPC URL
const { Web3 } = require('web3');
const web3 = new Web3(process.env.LINEA_RPC_URL);

// Initialize the contract
const attendanceContract = new web3.eth.Contract(contractABI, contractAddress);

async function checkIn() {
    const account = web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`); // Get list of accounts
    web3.eth.accounts.wallet.add(account); // Add your account to web3 wallet

    try {
        console.log(`Calling checkin from account: ${account.address}`);

        // Estimate gas for the transaction
        const gasEstimate = await attendanceContract.methods.checkin().estimateGas({ from: account.address });

        // Call the checkin function
        const receipt = await attendanceContract.methods.checkin().send({
            from: account.address,
            gas: gasEstimate
        });

        console.log(`Transaction successful with receipt: ${receipt.transactionHash}`);
        console.log(`received: ${receipt.events.Checkin.returnValues[0]}`);
        console.log('User check-in successful');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the function
checkIn();
