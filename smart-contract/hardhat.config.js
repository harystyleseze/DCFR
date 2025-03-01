require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BLOCKSCOUT_URL = process.env.BLOCKSCOUT_URL || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    autonomys: {
      url: RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 490000,
      timeout: 60000,
      gasPrice: "auto",
      verify: {
        etherscan: {
          apiUrl: BLOCKSCOUT_URL,
        },
      },
    },
  },
  etherscan: {
    apiKey: {
      autonomys: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "autonomys",
        chainId: 490000,
        urls: {
          apiURL: `${BLOCKSCOUT_URL}api`,
          browserURL: BLOCKSCOUT_URL,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
