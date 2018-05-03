pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract SampleToken is MintableToken {
  string public constant name = "Sample Token";
  string public constant symbol = "STOK";
  uint8 public constant decimals = 18;
  function massmint(address[] _recipients,uint256 _amount) public {
  	for (uint i = 0; i < _recipients.length; i++) {
  		totalSupply_ = totalSupply_.add(_amount);
    	balances[_recipients[i]] = balances[_recipients[i]].add(_amount);
    	Mint(_recipients[i], _amount);
    	Transfer(address(0), _recipients[i], _amount);
    }
  }
 }
