const { expect } = require("chai");
const { ethers } = require("hardhat");
const uniswapSdk = require("@uniswap/v3-sdk");
const INonfungiblePositionManager = require("../abis/nfpm.json");

const routerAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // all nets
const nonFungPosMngAddy = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'; // all nets
const wMaticAddress = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'; // testnet
// const wMaticAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'; // mainnet

const ethAmount = ethers.utils.parseEther('10'); // initial liquidity pool seed amount ETH
const govTokenAmount = ethers.utils.parseEther('500000'); // initial liquidity pool amount govToken
const stakingAmount = ethers.utils.parseEther('500000'); // initial distribution to staking contract
const stakingTimeFrameBlocks = ethers.BigNumber.from('2102400'); // Roughly one year @ 15sec blocks

const mineBlocks = async (n) => {
  for (let index = 0; index < n; index++) {
    await ethers.provider.send('evm_mine');
  }
}

describe("Initial tests for Tokenomics Boilerplate",  () => {
  let owner,mainContract,govToken,staking;

  before(async () => {
    [owner,user1,user2,user3] = await ethers.getSigners();
    console.log(`Owner: ${owner.address}`);
    await hre.run("compile");

    // Deploy GovToken ERC20
    const govTokenContract = await hre.ethers.getContractFactory('GovToken');
    govToken = await govTokenContract.deploy();
    await govToken.deployed();
    console.log(`GovToken deployed to: ${govToken.address}`);

    // Deploy Main Contract
    const mainContractCode = await hre.ethers.getContractFactory('MainContract');
    mainContract = await mainContractCode.deploy(govToken.address,routerAddress,wMaticAddress);
    await mainContract.deployed();
    console.log(`Gov contract deployed to: ${mainContract.address}`);

    // Deploy Staking Contract
    const stakingContract = await hre.ethers.getContractFactory('Staking');
    const amtPerBlock = stakingAmount.div(stakingTimeFrameBlocks);
    const startBlock = await ethers.provider.getBlockNumber();
    const endBlock = stakingTimeFrameBlocks.add(startBlock);
    staking = await stakingContract.deploy(govToken.address,amtPerBlock,startBlock,endBlock);
    await staking.deployed();
    console.log(`Staking contract deployed to: ${staking.address}`);
    await govToken.connect(owner).transfer(staking.address,stakingAmount);
    console.log(`Transferred funds to staking contract`);
    await staking.add(1,govToken.address,true);
    console.log(`Created staking pool for governance token`);

    // Setup liquidity pool on Uni V3
    const positionManager = new ethers.Contract(nonFungPosMngAddy, INonfungiblePositionManager, ethers.provider);
    const sqrtPrice = uniswapSdk.encodeSqrtRatioX96(govTokenAmount,ethAmount);
    // order of tokens may need flipping around if it fails here
    await positionManager.connect(owner).createAndInitializePoolIfNecessary(wMaticAddress, govToken.address, 3000, sqrtPrice.toString(), { gasLimit: 5000000 });
    await govToken.connect(owner).approve(nonFungPosMngAddy, govTokenAmount);
    const mintParam = {
      token0: wMaticAddress,
      token1: govToken.address,
      fee: 3000,
      tickLower: -887220,
      tickUpper: 887220,
      amount0Desired: ethAmount,
      amount1Desired: govTokenAmount,
      amount0Min: 1,
      amount1Min: 1,
      recipient: owner.address,
      deadline: Math.floor(Date.now() / 1000) + 600
    }
    const tx = await positionManager.connect(owner).mint(mintParam,{ value: ethAmount, gasLimit: 5000000 });
    await tx.wait();

    // Transfer ownership of TreeToken to Tree Contract
    await govToken.transferOwnership(mainContract.address);
    console.log(`govToken Ownership transferred to: ${mainContract.address}`);
  });

  it("Send some funds to the contract to buy some gov tokens", async () => {
    const balance1 = await ethers.provider.getBalance(user1.address);
    await mainContract.connect(user1).doSomething({ value: 10000000000 });
    const balance2 = await ethers.provider.getBalance(user1.address);
    expect(balance2).to.be.lt(balance1);
  });

  it("Check governance token is being distributed", async () => {
    const balance1 = await govToken.balanceOf(user1.address);
    expect(balance1).to.be.gt(0);
  });

  it("Try staking governance token", async () => {
    const balance1 = await govToken.balanceOf(user1.address);
    await govToken.connect(user1).approve(staking.address,balance1);
    await staking.connect(user1).deposit(0,balance1);
    await mineBlocks(10);
    await staking.connect(user1).withdraw(0,balance1);
    const balance2 = await govToken.balanceOf(user1.address);
    expect(balance2).to.gt(balance1);
  });


});

