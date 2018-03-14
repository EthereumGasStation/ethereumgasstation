pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract GasStation is Ownable {

	// track used fillup hashes
	mapping(bytes32=>bool) usedhashes;

	address public gasStationSigner;

	//event NewHash(bytes32 h,address token_address, address gastankaddress, uint take, uint give, uint valid, uint random);

	// constructor
	function GasStation(address _gasStationSigner) payable public {
		gasStationSigner = _gasStationSigner;
	}

	// default function
	function() payable public {}

	// // exchange by client ( hash signed by gasstation )
	// function pullFill(address _token_address, uint _valid_until, uint _random, uint _tokenAmount, uint _gasAmount, uint8 _v, bytes32 _r, bytes32 _s) public {

	//   bytes32 hash = sha256(_token_address, this, msg.sender, _tokenAmount,_gasAmount, _valid_until, _random);

	// 	NewHash(hash, _token_address, this, _tokenAmount, _gasAmount, _valid_until, _random);

	// 	require (
	// 		usedhashes[hash] != true
	// 		&& (ecrecover(hash, _v, _r, _s) == owner)
	// 		&& block.number <= _valid_until
	// 	);

	// 	// claim tokens
	// 	ERC20 token = ERC20(_token_address);

	// 	require(token.transferFrom(msg.sender,gasStationSigner,_gasAmount));

	// 	// send ETH (gas)
	// 	msg.sender.transfer(_tokenAmount);

	// 	// invalidate this deal's hash
	// 	usedhashes[hash] = true;

	// }

	// swap tokens for gas
	function purchaseGas(address _token_address, address _client, uint _valid_until, uint _tokenAmount, uint _gasAmount, uint8 _v, bytes32 _r, bytes32 _s) public {

		bytes32 hash = sha256(_token_address, this, _tokenAmount, _gasAmount, _valid_until);

		require(
			// hash should never be used before
			usedhashes[hash] != true
			&& (
			 	// the parameters are only accepted when signed by the other party
			 	(msg.sender == gasStationSigner && ecrecover(hash, _v, _r, _s) == _client)
			// 	|| (msg.sender == _client && ecrecover(hash, _v, _r, _s) == gasStationSigner)
			 )
			&& block.number <= _valid_until 
		);

		// invalidate this deal's hash
		usedhashes[hash] = true;

		// take tokens
		ERC20 token = ERC20(_token_address);
		require(token.transferFrom(_client, gasStationSigner, _tokenAmount));

		// send gas
		_client.transfer(_gasAmount);

	}

	function changeGasStationSigner(address _newgasStationSigner) onlyOwner public {
		gasStationSigner = _newgasStationSigner;
	}

	function withdrawETH() onlyOwner public {
		require(owner.send(this.balance));
	}

}
