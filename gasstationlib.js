//const sha3 = require('web3-utils/src/soliditySha3.js');
const sha256 = require('js-sha256').sha256;
const Tx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const IgasStation = require('./build/contracts/GasStation.json');
const ERC20 = require('./build/contracts/ERC20.json');
const GasStation = require('./build/contracts/GasStation.json');
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

//const BigNumber = Web3.utils.BN; //require('bignumber.js');

module.exports = (config) => {
	const utility = {};

	utility.simpleSign = function(hash, privateKey) {
		const sig = ethUtil.ecsign(
			new Buffer(hash, 'hex'),
			new Buffer(privateKey, 'hex'));
		return ({
			r: `0x${sig.r.toString('hex')}`,
			s: `0x${sig.s.toString('hex')}`,
			v: sig.v,
		});
	}

	// // main -> side
	// utility.signMintRequest = function(txHash, tokenAddress, tokenOwner, tokenAmount, validatorPK) {
	// 	const condensed = utility.pack(
	// 		[
	// 			txHash,
	// 			tokenAddress,
	// 			tokenOwner,
	// 			tokenAmount
	// 		], [256, 160, 160, 256]);
	// 	const hash = sha256(new Buffer(condensed, 'hex'));
	// 	return utility.simpleSign(hash, validatorPK);
	// };

	// utility.createWithdrawRequestHash = function(tokenAddress, tokenOwner, tokenAmount, withdrawBlock) {
	// 	const condensed = utility.pack(
	// 		[
	// 			tokenAddress,
	// 			tokenOwner,
	// 			tokenAmount,
	// 			withdrawBlock
	// 		], [160, 160, 256, 256]);
	// 	return (sha256(new Buffer(condensed, 'hex')));
	// }

	// utility.signWithdrawRequest = function(tokenAddress, tokenOwner, tokenAmount, withdrawBlock, validatorPK) {
	// 	const hash = utility.createWithdrawRequestHash(tokenAddress, tokenOwner, tokenAmount, withdrawBlock);
	// 	return utility.simpleSign(hash, validatorPK);
	// };

	// utility.signReward = function(withdrawRequestHash,tokenAddress, tokenOwner, tokenAmount, withdrawBlock, tokenReward, tokenOwnerPK) {
	// 	condensed = utility.pack(
	// 		[
	//        withdrawRequestHash,
	// 			tokenAddress,
	// 			tokenOwner,
	// 			tokenAmount,
	// 			withdrawBlock,
	// 			tokenReward,
	// 		], [256,160, 160, 256, 256, 256]);
	// 	const hash = sha256(new Buffer(condensed, 'hex'));
	// 	return utility.simpleSign(hash, tokenOwnerPK);
	// };

	// utility.sign = function sign(address, msgToSignIn, privateKeyIn, callback) {
	// 	let msgToSign = msgToSignIn;
	// 	if (msgToSign.substring(0, 2) !== '0x') msgToSign = `0x${msgToSign}`;

	// 	function prefixMessage(msgIn) {
	// 		let msg = msgIn;
	// 		msg = new Buffer(msg.slice(2), 'hex');
	// 		msg = Buffer.concat([
	// 			new Buffer(`\x19Ethereum Signed Message:\n${msg.length.toString()}`),
	// 			msg
	// 		]);
	// 		//console.log('MSG TO BE HASHED 1', msg.toString('hex'));

	// 		msg = sha3(`0x${msg.toString('hex')}`, {
	// 			encoding: 'hex'
	// 		});
	// 		msg = new Buffer((msg.substring(0, 2) === '0x') ? msg.slice(2) : msg, 'hex');
	// 		return `0x${msg.toString('hex')}`;
	// 	}

	// 	function testSig(msg, sig) {
	// 		const recoveredAddress =
	// 			`0x${ethUtil.pubToAddress(ethUtil.ecrecover(msg, sig.v, sig.r, sig.s)).toString('hex')}`;
	// 		return recoveredAddress === address;
	// 	}
	// 	//if (privateKeyIn) {
	// 	let privateKey = privateKeyIn;
	// 	if (privateKey.substring(0, 2) === '0x') privateKey = privateKey.substring(2, privateKey.length);
	// 	msgToSign = prefixMessage(msgToSign);
	// 	try {
	// 		const sig = ethUtil.ecsign(
	// 			new Buffer(msgToSign.slice(2), 'hex'),
	// 			new Buffer(privateKey, 'hex'));
	// 		const r = `0x${sig.r.toString('hex')}`;
	// 		const s = `0x${sig.s.toString('hex')}`;
	// 		const v = sig.v;
	// 		const result = {
	// 			r,
	// 			s,
	// 			v
	// 		};
	// 		callback(undefined, result);
	// 	} catch (err) {
	// 		callback(err, undefined);
	// 	}

	// };

	// utility.verify = function verify(addressIn, // eslint-disable-line consistent-return
	// 	v, rIn, sIn, valueIn, callback) {
	// 	const address = addressIn.toLowerCase();
	// 	let r = rIn;
	// 	let s = sIn;
	// 	let value = valueIn;
	// 	if (r.substring(0, 2) === '0x') r = r.substring(2, r.length);
	// 	if (s.substring(0, 2) === '0x') s = s.substring(2, s.length);
	// 	if (value.substring(0, 2) === '0x') value = value.substring(2, value.length);
	// 	const pubKey = ethUtil.ecrecover(
	// 		new Buffer(value, 'hex'),
	// 		Number(v),
	// 		new Buffer(r, 'hex'),
	// 		new Buffer(s, 'hex'));
	// 	const result = address === `0x${ethUtil.pubToAddress(new Buffer(pubKey, 'hex')).toString('hex')}`;
	// 	if (callback) {
	// 		callback(undefined, result);
	// 	} else {
	// 		return result;
	// 	}
	// };

	utility.signGastankParameters = function(tokenaddress, gastankaddress, tokenAmount, gasAmount, valid_until, privatekey) {
		const condensed = utility.pack(
			[
				tokenaddress,
				gastankaddress,
				tokenAmount,
				gasAmount,
				valid_until,
			], [160, 160, 256, 256, 256]);
		const hash = sha256(new Buffer(condensed, 'hex'));
		return utility.simpleSign(hash, privatekey);
	};


	utility.getapprovaltx = function(from, from_pk, token_address, tokenamount, to, currentProvider) {
		return new Promise((resolve, reject) => {
			const web3 = new Web3(currentProvider);
			const tokenInstance = new web3.eth.Contract(ERC20.abi, token_address);

			Promise.all([
				web3.eth.getGasPrice(),
				web3.eth.getTransactionCount(from),
				web3.eth.net.getId(),
				tokenInstance.methods.approve(to, tokenamount).estimateGas(),
			]).then((res) => {
				const gasPrice = parseInt(res[0]);
				const gasLimit = res[3];

				const data = tokenInstance.methods.approve(to, tokenamount).encodeABI();

				const txParams = {
					nonce: res[1],
					gasPrice: gasPrice,
					gasLimit: gasLimit,
					to: token_address,
					data: data,
					chainId: res[2],
				};

				const tx = new EthereumTx(txParams);
				const privateKey = Buffer.from(from_pk, 'hex');

				tx.sign(privateKey);
				const serializedTx = '0x' + tx.serialize().toString('hex');

				resolve({
					tx: serializedTx,
					gasLimit: gasLimit,
					gasPrice: gasPrice,
					cost: gasLimit * gasPrice,
				});
			});
		});
	};

	utility.getPurchaseGastx = function(
		tokenAddress,
		gasstation_client,
		valid_until,
		_tokensGive,
		gasOffer,
		gasStationAddress,
		v,
		r,
		s,
		from,
		from_pk,
		currentProvider
	) {
		return new Promise((resolve, reject) => {
			const web3 = new Web3(currentProvider);
			console.log('gasStationAddress=', gasStationAddress);
			const gasStationInstance = new web3.eth.Contract(GasStation.abi, gasStationAddress);

			//const purchaseGasMethod = 

			Promise.all([
				web3.eth.getGasPrice(),
				web3.eth.getTransactionCount(from),
				web3.eth.net.getId(),
				// gasStationInstance.methods.purchaseGas(
				// 	tokenAddress,
				// 	gasstation_client,
				// 	valid_until,
				// 	_tokensGive,
				// 	gasOffer,
				// 	v,
				// 	r,
				// 	s).estimateGas(),
			]).then((res) => {
				const gasPrice = parseInt(res[0]);
				const gasLimit = 200000; //res[3];

				const data = gasStationInstance.methods.purchaseGas(tokenAddress, gasstation_client, valid_until, _tokensGive, gasOffer, v, r, s).encodeABI();

				const txParams = {
					nonce: res[1],
					gasPrice: gasPrice,
					gasLimit: gasLimit,
					to: gasStationAddress,
					data: data,
					chainId: res[2],
				};

				const tx = new EthereumTx(txParams);
				const privateKey = Buffer.from(from_pk, 'hex');

				tx.sign(privateKey);
				const serializedTx = '0x' + tx.serialize().toString('hex');

				resolve({
					tx: serializedTx,
					gasLimit: gasLimit,
					gasPrice: gasPrice,
					cost: gasLimit * gasPrice,
				});
			});
		});


		// web3.eth.estimateGas({
		// 	to: token_address,
		// 	data: txData,
		// 	from: from
		// }, function(err, res) {
		// 	if (err) {
		// 		return cb(err);
		// 	}
		// 	var gasRequired = res;

		// 	// get nonce
		// 	web3.eth.getTransactionCount(from, function(err, nonce) {

		// 		if (!nonce) {
		// 			nonce = 0;
		// 		}

		// 		var txParams = {
		// 			nonce: nonce++,
		// 			gasPrice: gasprice,
		// 			gasLimit: gasRequired,
		// 			to: token_address,
		// 			from: from,
		// 			data: txData,
		// 			chainId: 1
		// 		};

		// 		var tx = new Tx(txParams);
		// 		tx.sign(new Buffer(from_pk.slice(2), 'hex'));

		// 		//var serializedTx = tx.serialize();

		// 		return cb(null, {
		// 			signedtx: `0x${tx.serialize().toString('hex')}`,
		// 			cost: txParams.gasPrice * txParams.gasLimit
		// 		});


		// 	});

		// });

		// //    return txData;
	};

	utility.zeroPad = function zeroPad(num, places) {
		const zero = (places - num.toString().length) + 1;
		return Array(+(zero > 0 && zero)).join('0') + num;
	};

	utility.decToHex = function decToHex(dec, lengthIn) {
		let length = lengthIn;
		if (!length) length = 32;
		if (dec < 0) {
			// return convertBase((Math.pow(2, length) + decStr).toString(), 10, 16);
			return (new BigNumber(2)).pow(length).add(new BigNumber(dec)).toString(16);
		}
		let result = null;
		try {
			result = utility.convertBase(dec.toString(), 10, 16);
		} catch (err) {
			result = null;
		}
		if (result) {
			return result;
		}
		return (new BigNumber(dec)).toString(16);
	};

	utility.pack = function pack(dataIn, lengths) {
		let packed = '';
		const data = dataIn.map(x => x);
		for (let i = 0; i < lengths.length; i += 1) {
			if (typeof(data[i]) === 'string' && data[i].substring(0, 2) === '0x') {
				if (data[i].substring(0, 2) === '0x') data[i] = data[i].substring(2);
				packed += utility.zeroPad(data[i], lengths[i] / 4);
			} else if (typeof(data[i]) !== 'number' && /[a-f]/.test(data[i])) {
				if (data[i].substring(0, 2) === '0x') data[i] = data[i].substring(2);
				packed += utility.zeroPad(data[i], lengths[i] / 4);
			} else {
				// packed += zeroPad(new BigNumber(data[i]).toString(16), lengths[i]/4);
				packed += utility.zeroPad(utility.decToHex(data[i], lengths[i]), lengths[i] / 4);
			}
		}
		return packed;
	};

	utility.convertBase = function convertBase(str, fromBase, toBase) {
		const digits = utility.parseToDigitsArray(str, fromBase);
		if (digits === null) return null;
		let outArray = [];
		let power = [1];
		for (let i = 0; i < digits.length; i += 1) {
			if (digits[i]) {
				outArray = utility.add(outArray,
					utility.multiplyByNumber(digits[i], power, toBase), toBase);
			}
			power = utility.multiplyByNumber(fromBase, power, toBase);
		}
		let out = '';
		for (let i = outArray.length - 1; i >= 0; i -= 1) {
			out += outArray[i].toString(toBase);
		}
		if (out === '') out = 0;
		return out;
	};

	utility.parseToDigitsArray = function parseToDigitsArray(str, base) {
		const digits = str.split('');
		const ary = [];
		for (let i = digits.length - 1; i >= 0; i -= 1) {
			const n = parseInt(digits[i], base);
			if (isNaN(n)) return null;
			ary.push(n);
		}
		return ary;
	};

	utility.add = function add(x, y, base) {
		const z = [];
		const n = Math.max(x.length, y.length);
		let carry = 0;
		let i = 0;
		while (i < n || carry) {
			const xi = i < x.length ? x[i] : 0;
			const yi = i < y.length ? y[i] : 0;
			const zi = carry + xi + yi;
			z.push(zi % base);
			carry = Math.floor(zi / base);
			i += 1;
		}
		return z;
	};

	utility.multiplyByNumber = function multiplyByNumber(numIn, x, base) {
		let num = numIn;
		if (num < 0) return null;
		if (num === 0) return [];
		let result = [];
		let power = x;
		while (true) { // eslint-disable-line no-constant-condition
			if (num & 1) { // eslint-disable-line no-bitwise
				result = utility.add(result, power, base);
			}
			num = num >> 1; // eslint-disable-line operator-assignment, no-bitwise
			if (num === 0) break;
			power = utility.add(power, power, base);
		}
		return result;
	};

	return utility;
};
