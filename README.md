# Tokenomics Boilerplate

This code base was created as part of an solidity tutorial available here:

https://jamesbachini.com/tokenomics-boilerplate/

## Disclaimer
Note the code is provided for educational purposes, is unaudited and not fit for financial transactions.

## Setup Instructions
Edit the .env-example.txt file and save it as .env 
Add a private key, create one using this script if necessary:-
https://github.com/jamesbachini/Ethers-Vanity-Address

Build using the following commands:

```shell
git clone https://github.com/jamesbachini/Tokenomics-Boilerplate.git
cd Tokenomics-Boilerplate
npm install
```

Because we are using external contracts from Uniswap v3 we need to fork whatever network we want to deploy on. Here I am going to deploy a local version of the Polygon Mumbai Testnet

```shell
npx hardhat node --fork https://polygon-mumbai.g.alchemy.com/v2/ALCHEMYAPIKEYHERE
```

From there we can test and deploy

```shell
npx hardhat test
```

Note you'll need some testnet funds in your wallet to deploy the contract. You can get these from here: https://faucet.polygon.technology/

```shell
npx hardhat run --network mumbai .\scripts\deploy.js
```

More info and solidity tutorials on my blog at https://jamesbachini.com
