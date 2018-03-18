pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract GasStation is Ownable {
	// track used fillup hashes
	mapping(bytes32=>bool) usedhashes;
	address public gasStationSigner;

	// constructor
	function GasStation(address _gasStationSigner) payable public {
		gasStationSigner = _gasStationSigner;
	}

	// default function
	function() payable public {}

	// swap tokens for gas
	function purchaseGas(address _tokenAddress, address _client, uint _validUntil, uint _tokenAmount, uint _gasAmount, uint8 _v, bytes32 _r, bytes32 _s) public {
		bytes32 hash = sha256(_tokenAddress, this, _tokenAmount, _gasAmount, _validUntil);
		require(
			(usedhashes[hash] != true)
			&& (msg.sender == gasStationSigner)
			&& (ecrecover(hash, _v, _r, _s) == _client)
			&& (block.number <= _validUntil) 
		);
		// invalidate this deal's hash
		usedhashes[hash] = true;
		// take tokens
		ERC20 token = ERC20(_tokenAddress);
		require(token.transferFrom(_client, owner, _tokenAmount));
		// send gas
		_client.transfer(_gasAmount);
	}

	function changeGasStationSigner(address _newgasStationSigner) onlyOwner public {
		gasStationSigner = _newgasStationSigner;
	}

	function withdrawETH() onlyOwner public {
		owner.transfer(this.balance);
	}
}
