/* Tokenomics Tests */

const maxSupply = 1000000;
for (let supply = 0; supply < maxSupply;  supply += 100000) {
 const remaining = maxSupply - supply;
 const multiplier = remaining * 100 / maxSupply;
  console.log(multiplier);
}