const sha256 = require('js-sha256').sha256;
const Tx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const ERC20 = require('../build/contracts/ERC20.json');
const GasStation = require('../build/contracts/GasStation.json');
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

module.exports = (config) => {
	const utility = {};

	utility.errorCodes = {
		'ACCOUNT_IS_CONTRACT': 1,
		'ACCOUNT_IS_NOT_EMPTY': 2,
		'ACCOUNT_IS_NOT_UNUSED': 3,
	};

	utility.privateToAddress = function(privateKey) {
		let pubKey = ethUtil.privateToAddress(Buffer.from(privateKey, 'hex'));
		return `0x${pubKey.toString('hex')}`;
	};

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

	utility.checkPrerequisites = function(address) {
		return new Promise((resolve, reject) => {
			const web3 = new Web3(config.currentProvider);
			Promise.all([
				web3.eth.getCode(address),
				web3.eth.getTransactionCount(address),
				web3.eth.getBalance(address),
			]).then(([code, txcount, balance]) => {
				// check : is not a contract
				if (code && ((typeof code) !== 'string' || code !== "0x")) {
					return reject({
						code: 1,
						message: 'account is a contract',
					});
				}
				// does it have a zero ETH balance ?			
				if ((typeof balance) !== 'string' || balance !== "0") {
					return reject({
						code: 2,
						message: 'account has a non-zero ETH balance'
					});
				}
				// did it never do transactions before ?
				if (typeof txcount !== 'number' || txcount !== 0) {
					return reject({
						code: 3,
						message: 'account nonce is not 0'
					});
				}
				return resolve();
			});
		})
	};

	utility.estimateGasRequirement = () => {
		const web3 = new Web3(config.currentProvider);
		return new Promise((resolve, reject) => {
			return Promise.all([web3.eth.getGasPrice()]).then(([gasprice]) => {
				resolve(parseInt(gasprice) * (200000 + 100000));
			});
		});
	};

	utility.makeGastankParameters = function(tokenaddress, gastankaddress, tokenAmount, gasAmount, valid_until, privatekey) {
		const condensed = utility.pack(
			[
				tokenaddress,
				gastankaddress,
				tokenAmount,
				gasAmount,
				valid_until,
			], [160, 160, 256, 256, 256]);
		return sha256(new Buffer(condensed, 'hex'));
	};

	utility.signGastankParameters = function(tokenaddress, gastankaddress, tokenAmount, gasAmount, valid_until, privatekey) {
		const hash = utility.makeGastankParameters(tokenaddress, gastankaddress, tokenAmount, gasAmount, valid_until, privatekey);
		return utility.simpleSign(hash, privatekey);
	};

	utility.getapprovaltx = function(from, from_pk, token_address, tokenamount, to) {
		return new Promise((resolve, reject) => {
			const web3 = new Web3(config.currentProvider);
			const tokenInstance = new web3.eth.Contract(ERC20.abi, token_address);

			Promise.all([
				web3.eth.getGasPrice(),
				web3.eth.getTransactionCount(from),
				web3.eth.net.getId(),
				tokenInstance.methods.approve(to, tokenamount).estimateGas(),
			]).then(([gasPrice, txCount, chainId, gasLimit]) => {
				gasPrice = parseInt(gasPrice);

				const data = tokenInstance.methods.approve(to, tokenamount).encodeABI();

				const txParams = {
					nonce: txCount,
					gasPrice: gasPrice,
					gasLimit: gasLimit,
					to: token_address,
					data: data,
					chainId: chainId,
				};

				const tx = new EthereumTx(txParams);

				// only sign if I have a Private Key
				if (from_pk) {
					const privateKey = Buffer.from(from_pk, 'hex');
					tx.sign(privateKey);
				}

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
		from_pk
	) {
		return new Promise((resolve, reject) => {
			const web3 = new Web3(config.currentProvider);
			console.log('gasStationAddress=', gasStationAddress);
			const gasStationInstance = new web3.eth.Contract(GasStation.abi, gasStationAddress);

			Promise.all([
				web3.eth.getGasPrice(),
				web3.eth.getTransactionCount(from),
				web3.eth.net.getId(),

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
