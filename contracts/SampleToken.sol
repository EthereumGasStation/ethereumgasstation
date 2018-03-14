pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract SampleToken is MintableToken {
  string public constant name = "Sample Token";
  string public constant symbol = "STOK";
  uint8 public constant decimals = 18;
 }
