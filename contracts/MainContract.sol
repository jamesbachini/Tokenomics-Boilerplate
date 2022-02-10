//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.11;

import "hardhat/console.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

interface IERC20Token {
  function mint(address _to, uint256 _amount) external;
  function burn(uint256 _amount) external;
  function totalSupply() external returns (uint256);
}

contract MainContract {

  address public govToken;
  address public wEth; // Could also be wMatic or whatever native token
  uint256 public govTokenMaxSupply = 100000000 ether; // 100m Tokens
  address public uniRouter;

  constructor(address _govToken, address _uniRouter, address _wEth) {
    govToken = _govToken;
    wEth = _wEth;
    uniRouter = _uniRouter;
  }

  function doSomething() external payable {
    // Create usefull code to generate fees/commission here in ETH

    // For testing we will just use the value in ETH sent with the contract call
    uint256 commission = msg.value; // Amount of ETH + 18 decimals
    distributeRewards(commission);
    buyBackAndBurn(commission);
  }

  function distributeRewards(uint256 _commission) internal {
    uint256 govTokenSupply = IERC20Token(govToken).totalSupply();
    if (govTokenSupply < govTokenMaxSupply - 1 ether) {
      uint256 remaininggovTokens = govTokenMaxSupply - govTokenSupply;
      uint256 diminishingSupplyFactor =  remaininggovTokens * 100 / govTokenMaxSupply;
      uint256 govTokenDistro = _commission * diminishingSupplyFactor ;
      require(govTokenDistro >= 0, "govTokenDistro below zero");
      IERC20Token(govToken).mint( msg.sender, govTokenDistro);
    }
  }

  function buyBackAndBurn(uint256 _amountIn) internal {
    uint24 poolFee = 3000;
    ISwapRouter.ExactInputSingleParams memory params =
      ISwapRouter.ExactInputSingleParams({
        tokenIn: wEth,
        tokenOut: govToken,
        fee: poolFee,
        recipient: address(this),
        deadline: block.timestamp,
        amountIn: _amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      });
    uint256 amountOut = ISwapRouter(uniRouter).exactInputSingle{value: _amountIn}(params);
    IERC20Token(govToken).burn(amountOut);
  }

  receive () external payable {}

}
