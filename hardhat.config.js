require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { LINEA_RPC_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  networks: {
    linea: {
      url: LINEA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};
