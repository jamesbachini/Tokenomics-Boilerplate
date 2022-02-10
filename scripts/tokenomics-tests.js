/* Tokenomics Tests */

const maxSupply = 100000000;
let supply = 1000000; // liquidty pool and staking pool
let staking = 0;
let liquidityPool = 0;
let tokenPrice = 0.000000001;

const addStaking = (amount) => {
  staking += amount;
}

const addLP = (amount) => {
  liquidityPool += amount;
}

const liquidityDrawDown = (factor) => {
  staking = staking - (staking * factor);
  liquidityPool = liquidityPool - (liquidityPool * factor);
}

const distAlgo = (amount) => {
  const remaining = maxSupply - supply;
  const multiplier = remaining * 100 / maxSupply;
  return amount * multiplier;
}

const buyBack = (amount) => {
  return amount * tokenPrice ;
}

const runSimulation = () => {
  const fees = Math.floor(Math.random() * 100);
  const rewards = distAlgo(fees);
  supply += rewards;
  const burn = buyBack(fees);
  supply -= burn;
  const investorNetPurchases = Math.floor(Math.random() * 200);
  if (Math.random() > 0.5 && staking < supply * 0.2) staking += investorNetPurchases;
  if (Math.random() > 0.8 && liquidityPool < supply * 0.1) liquidityPool += investorNetPurchases;
  const netSales = Math.floor(Math.random() * 200);
  if (investorNetPurchases + burn > netSales) tokenPrice *= 1.0001;
}

const endlessLoop = async () => {
  for (let i = 0; i < 1000; i++) {
    runSimulation();
  }
  const stakingPercentage = staking / supply * 100;
  const liquidityPoolPercentage = liquidityPool / supply * 100;
  console.log(`Supply: ${supply.toFixed()} Staking: ${stakingPercentage.toFixed()}% LiquidityPool: ${liquidityPoolPercentage.toFixed()}%`);
  await new Promise(r => setTimeout(r, 500)); // slow it down
  endlessLoop();
}

endlessLoop();