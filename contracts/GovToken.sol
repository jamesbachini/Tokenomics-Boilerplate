// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovToken is ERC20, ERC20Permit, ERC20Votes, Ownable {

    constructor() ERC20("GovToken", "GOVTKN") ERC20Permit("GovToken") {
      _mint(msg.sender, 1000000 ether); // need to mint some tokens to seed liquidity pool
    }

    // Internals
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
      super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
      super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
      super._burn(account, amount);
    }

    /*
      Required for MainContract.sol to create new tokens & burn buybacks
      owner should be a contract not a developer/owner wallet
    */
    function mint(address _to, uint256 _amount) public onlyOwner {
      _mint(_to, _amount);
    }

    function burn(uint256 _amount) public onlyOwner {
      _burn(msg.sender, _amount);
    }

}
