// const ERC20 = artifacts.require('SampleToken.sol');
// const ethUtil = require("ethereumjs-util");
// const EthereumTx = require("ethereumjs-tx");
// const keythereum = require('keythereum');
// const Web3 = require('web3');


contract('Token Setup', function(accounts) {

	// // Make a web3 v1.0 instance
	// const localWeb3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"));

	// // create some random ethereum keypairs
	// function mkkeypair() {
	// 	let dk = keythereum.create();
	// 	let keyObject = keythereum.dump("none", dk.privateKey, dk.salt, dk.iv);
	// 	return ({
	// 		private: dk.privateKey.toString('hex'),
	// 		public: ethUtil.addHexPrefix(keyObject.address)
	// 	});
	// }

	// describe('fund random account', () => {
	// 	it("should create account and mint tokens ", (done) => {

	// 		const tokenAddress = '0x7932236cc4e5dbd840d9a52b009fed3582d4bf4f';

	// 		const erc20Instance = new localWeb3.eth.Contract(ERC20.abi, tokenAddress);

	// 		const from = '0x702029796b00f50BcFCE9b0Bb0C402bc453595D8';
	// 		const from_pk = 'ed222bcf9048ab7233e633553e41789da371a311dfb7317b477a1db8a44f04ea';

	// 		const target = mkkeypair();

	// 		Promise.all([
	// 			localWeb3.eth.getGasPrice(),
	// 			localWeb3.eth.getTransactionCount(from),
	// 			localWeb3.eth.net.getId(),
	// 		]).then(([gasPrice, nonce, chainId]) => {

	// 			const data = erc20Instance.methods.mint(target.public, 100e18).encodeABI();


	// 			const txParams = {
	// 				nonce: ethUtil.addHexPrefix((new ethUtil.BN(nonce)).toString('hex')),
	// 				gasPrice: ethUtil.addHexPrefix((new ethUtil.BN(gasPrice)).toString('hex')),
	// 				gasLimit: ethUtil.addHexPrefix((new ethUtil.BN(100000)).toString('hex')),
	// 				to: tokenAddress,
	// 				data: data,
	// 				chainId: ethUtil.addHexPrefix((new ethUtil.BN(chainId)).toString('hex')),
	// 			};

	// 			const tx = new EthereumTx(txParams);
	// 			const privateKey = Buffer.from(from_pk, 'hex');

	// 			tx.sign(privateKey);
	// 			const serializedTx = ethUtil.addHexPrefix(tx.serialize().toString('hex'));

	// 			localWeb3.eth.sendSignedTransaction(ethUtil.addHexPrefix(serializedTx))
	// 				.on('confirmation', (confirmationNumber, receipt) => {
	// 					console.log('tx mined', receipt);
	// 					//console.log(serializedTx);
	// 					console.log('100e18 tokens minted for this account');
	// 					console.log(target);
	// 					done();
	// 				})
	// 				.on('transactionHash', (hash) => {
	// 					console.log('txhash=', hash);
	// 				})
	// 				.on('error', (e, receipt) => {
	// 					console.log(e);
	// 					done();
	// 				});
	// 		});
	// 	});
	// });
});
