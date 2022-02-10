require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// Run this first to fork the testnet with Uniswap v3 contracts deployed
// npx hardhat node --fork https://polygon-mumbai.g.alchemy.com/v2/ALCHEMYAPIKEY

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    mumbai: {
      url: `https://matic-mumbai.chainstacklabs.com`,
      accounts: [process.env.PRIVATEKEY],
    },
    hardhat: {
      forking: {
        url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMYKEY}`,
      }
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.11" },
      { version: "0.7.6" },
      { version: "0.6.6" }
    ]
  },
};



