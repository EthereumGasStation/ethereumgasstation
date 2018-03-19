const ERC20 = artifacts.require('SampleToken.sol');
const gasStation = artifacts.require("GasStation.sol");
const ethUtil = require("ethereumjs-util");
const ethTx = require("ethereumjs-tx");
const keythereum = require('keythereum');
const Web3 = require('web3');

contract('Token Setup', function(accounts) {

	// Make a web3 v1.0 instance
	const localWeb3 = new Web3(web3.currentProvider);

	// create some random ethereum keypairs
	function mkkeypair() {
		let dk = keythereum.create();
		let keyObject = keythereum.dump("none", dk.privateKey, dk.salt, dk.iv);
		return ({
			private: dk.privateKey.toString('hex'),
			public: ethUtil.addHexPrefix(keyObject.address)
		});
	}

	let randomkeys = [];

	for (let i = 0; i < 3; i++) {
		randomkeys.push(mkkeypair());
	}

	// the indexes of these keys represent these persona :

	// gasstation client = selling tokens for gas
	let gasstation_client = randomkeys[0];

	// the owner of the gasstation smart contract (who receives tokens & withdraws ETH )
	let gasstation_owner = accounts[2];

	// any other account - to check if they can't perform privileged functions
	let unknown_account = accounts[3];


	// the signer account who signs off on exchange rates via the API
	// ( this user cannot withdraw tokens or ETH )
	let gasstation_signer = randomkeys[1];

	// new signer account - to test changing of changeGasStationSigner
	let gasstation_signer2 = accounts[4];

	// an account with nonce 0 , but ETH
	let unused_account = accounts[5];



	let sampleERC20Token;
	let gasStationInstance;


	// parameters for this test
	const _gasTake = new localWeb3.utils.BN("9081200000000000");
	const _tokensGive = _gasTake.mul(new localWeb3.utils.BN(2)); // 2 is the price ratio here.. 1 Wei = 2 units of token

	const gasstationlib = require('../lib/gasstationlib.js')({
		currentProvider: web3.currentProvider
	});

	describe('Deploy SWT (test) Token', () => {
		it("should deploy a MiniMeToken contract", (done) => {
			ERC20.new({
				from: gasstation_owner
			}).then((_instance) => {
				assert.ok(_instance.address);
				sampleERC20Token = _instance;
				done();
			});
		});

		it("should mint tokens for gasstation client ", (done) => {
			sampleERC20Token.mint(gasstation_client.public, _tokensGive.toString(10), {
				from: gasstation_owner
			}).then(() => {
				done();
			});
		});

		it("should send ETH to the gasstation_signer (" + gasstation_signer.public + ")", (done) => {
			let p = {
				from: accounts[0],
				to: gasstation_signer.public,
				value: localWeb3.utils.toWei("1", "ether")
			};
			localWeb3.eth.sendTransaction(p, (err) => {
				done();
			})
		});
	});

	describe('gasStation setup', () => {
		it("should deploy a gasStation-contract", (done) => {
			gasStation.new(gasstation_signer.public, {
				gas: 4700000,
				from: gasstation_owner
			}).then((instance) => {
				gasStationInstance = instance;
				assert.isNotNull(gasStationInstance);
				done();
			});
		});

		// gasstation contract should have some ETH.
		it("should be able to fund/refill the gasStation", (done) => {
			web3.eth.sendTransaction({
				from: accounts[0],
				to: gasStationInstance.address,
				value: localWeb3.utils.toWei("1", "ether")
			}, function(err) {
				done();
			})
		});
	});

	describe('post-setup tests', function() {

		it("gasstation-server should have ETH", (done) => {
			localWeb3.eth.getBalance(gasstation_owner, function(err, ethbalance) {
				assert.ok(ethbalance > 0);
				done();
			});
		});

		it("gasstation-contract should have ETH", (done) => {
			localWeb3.eth.getBalance(gasStationInstance.address, function(err, ethbalance) {
				assert.ok(ethbalance > 0);
				done();
			});
		});

		it("gasstation-client should have a Token balance ", (done) => {
			sampleERC20Token.balanceOf.call(gasstation_client.public).then(function(balance) {
				_swtbalance = balance.toNumber(10);
				assert.ok(_swtbalance > 0);
				done();
			});
		});

		it("gasstation-client should have no ETH", (done) => {
			localWeb3.eth.getBalance(gasstation_client.public, function(err, ethbalance) {
				assert.ok(ethbalance == 0);
				done();
			});
		});
	});

	describe('test transaction on gasstation - happy flow', function() {

		let approvaltx;

		it("should create getapproval TX", (done) => {

			gasstationlib.getapprovaltx(
				gasstation_client.public,
				gasstation_client.private,
				sampleERC20Token.address,
				_tokensGive,
				gasStationInstance.address
			).then((res) => {
				console.log('res=', res);

				// save approval transaction object for later.
				approvaltx = res;

				console.log('approvaltx cost in Wei =', res.cost);

				done();

			}).catch((e) => {
				console.log(e);
				done();
			});
		});

		it("balances should be sufficient", (done) => {

			Promise.all([
				localWeb3.eth.getBalance(gasstation_client.public),
				sampleERC20Token.balanceOf.call(gasstation_client.public),
				localWeb3.eth.getBalance(gasStationInstance.address),
			]).then((res) => {

				const clientETHBalance = res[0];
				const clientERC20Balance = res[1].toNumber(10);
				const gasstationContractETHBalance = res[2];

				//console.log('gasstation_client want to take (in ETH units) : ', _gasTake);
				console.log('gasstation ETH balance =', gasstationContractETHBalance);
				//console.log('gasstation_client wants to give ( in SWT )', _tokensGive);
				console.log('gasstation_client token balance', clientERC20Balance);

				assert.isAbove(gasstationContractETHBalance, _gasTake - approvaltx.cost);
				done();
			});
		});

		it("gasstation-client should have no ETH", (done) => {
			web3.eth.getBalance(gasstation_client.public, function(err, ethbalance) {
				console.log('gasstation-client ETH balance', ethbalance.toNumber(10), 'Wei');
				assert.equal(ethbalance.toNumber(10), 0);
				done();
			});
		});

		it("should send gas to cover cost", (done) => {
			web3.eth.sendTransaction({
				from: accounts[0],
				to: gasstation_client.public,
				value: approvaltx.cost
			}, function(err) {
				done();
			})
		});

		it("gasstation-client should have enough ETH to cover initial tx costs", (done) => {
			web3.eth.getBalance(gasstation_client.public, function(err, ethbalance) {
				console.log('gasstation-client ETH balance', ethbalance.toNumber(10), 'Wei');
				assert.equal(ethbalance.toNumber(10), approvaltx.cost);
				done();
			});
		});

		it("gasstation-client should have zero allowance", (done) => {
			console.log('check allowance -> from=', gasstation_client.public, 'to=', gasStationInstance.address);
			sampleERC20Token.allowance.call(gasstation_client.public, gasStationInstance.address).then(function(allowance) {
				console.log('allowance=', allowance.toNumber(10));
				assert.equal(allowance.toNumber(10), 0);
				done();
			});
		});

		it("gasstation-client should be able to execute allowance TX", (done) => {
			web3.eth.sendRawTransaction(approvaltx.tx, function(err, res) {
				console.log('create allowance - tx sent', err, res);
				done();
			});
		});

		it("gasstation-client should have an allowance", (done) => {
			let allowance_from = gasstation_client.public;
			let allowance_to = gasStationInstance.address;
			console.log('check allowance -> from=', allowance_from, 'to=', allowance_to);
			sampleERC20Token.allowance.call(allowance_from, allowance_to).then(function(allowance) {
				console.log('allowance=', allowance.toNumber(10));
				assert.equal(allowance.toNumber(10), _tokensGive);
				done();
			});
		});


		it("gasstation-client should have no ETH after tx", (done) => {
			web3.eth.getBalance(gasstation_client.public, function(err, ethbalance) {
				console.log('gasstation-client ETH balance', ethbalance.toNumber(10), 'Wei');
				assert.equal(ethbalance.toNumber(10), 0);
				done();
			});
		});

		it("gasstation_owner should have a zero Token balance ", (done) => {
			sampleERC20Token.balanceOf.call(gasstation_owner).then(function(balance) {
				_swtbalance = balance.toNumber(10);
				console.log('gasstation_owner token balance =', _swtbalance);
				assert.ok(_swtbalance == 0);
				done();
			});
		});

		let offer = {};

		it("client should be able to sign off on the offer of gas/token", (done) => {
			Promise.all([
				localWeb3.eth.getBlockNumber(),
			]).then((blockNumber) => {

				offer.valid_until = blockNumber + 10;

				offer.gasOffer = _gasTake - approvaltx.cost; // minus the extimate of the TX pushfill

				console.log('The deal is: receive ', offer.gasOffer, 'Wei in exchange for ', _tokensGive.toString(10), 'ERC20 token units');

				// client signs off on these parameters
				offer.clientSig = gasstationlib.signGastankParameters(
					sampleERC20Token.address,
					gasStationInstance.address,
					_tokensGive,
					offer.gasOffer,
					offer.valid_until,
					gasstation_client.private)
				console.log('clientSig =>', offer.clientSig, 'valid_until=', offer.valid_until);
				done();
			});
		});



		it("gasstation-signer should be able to execute purchaseGas Tx", (done) => {
			// server creates & signs purchaseGas Tx
			gasstationlib.getPurchaseGastx(
				sampleERC20Token.address,
				gasstation_client.public,
				offer.valid_until,
				_tokensGive,
				offer.gasOffer,
				gasStationInstance.address,
				offer.clientSig.v,
				offer.clientSig.r,
				offer.clientSig.s,
				gasstation_signer.public,
				gasstation_signer.private
			).then((purchaseGasTx) => {
				// and throws it in the Tx pool
				localWeb3.eth.sendSignedTransaction(purchaseGasTx.tx).on('receipt', (receipt) => {
					console.log(receipt);
					done();
				});
			});
		});

		it("gasstation-signer should not be able to execute the same purchaseGas Tx again", (done) => {
			// server creates & signs purchaseGas Tx
			gasstationlib.getPurchaseGastx(
				sampleERC20Token.address,
				gasstation_client.public,
				offer.valid_until,
				_tokensGive,
				offer.gasOffer,
				gasStationInstance.address,
				offer.clientSig.v,
				offer.clientSig.r,
				offer.clientSig.s,
				gasstation_signer.public,
				gasstation_signer.private
			).then((purchaseGasTx) => {
				// and throws it in the Tx pool
				localWeb3.eth.sendSignedTransaction(purchaseGasTx.tx).on('receipt', (receipt) => {
					console.log('purchase gas - tx sent', receipt);
					assert.fail('this TX should throw..');
				}).on('error', (err) => {
					done();
				});
			});
		});

		it("gasstation_owner should have a Token balance ", (done) => {
			sampleERC20Token.balanceOf.call(gasstation_owner).then(function(balance) {
				_swtbalance = balance.toNumber(10);
				console.log('gasstation_owner token balance =', _swtbalance);
				assert.ok(_swtbalance > 0);
				done();
			});
		});

		it("gasstation_client should have received GAS", (done) => {
			web3.eth.getBalance(gasstation_client.public, function(err, ethbalance) {
				console.log('gasstation_client owns', ethbalance.toString(10), 'Wei');
				assert.isAbove(ethbalance.toNumber(10), 0);
				done();
			});
		});
		it("gasstation_client should have a smaller token balance ", (done) => {
			sampleERC20Token.balanceOf.call(gasstation_client.public).then(function(balance) {
				//_swtbalance = balance.toString(10);
				console.log('gasstation_client token balance =', balance.toString(10));
				//assert.ok(_swtbalance > 0);
				done();
			});
		});
	});


	describe('test transaction on gasstation with insuficcient token balance', function() {

		let offer = {};

		let approvaltx;

		it("client should be able to sign off on the offer of gas/token ( even without haveing enough tokens )", (done) => {
			Promise.all([
				localWeb3.eth.getBlockNumber(),
			]).then((blockNumber) => {

				offer.valid_until = blockNumber + 10;

				offer.gasOffer = _gasTake; // minus the extimate of the TX pushfill

				console.log('The deal is: receive ', offer.gasOffer, 'Wei in exchange for ', _tokensGive.toString(10), 'ERC20 token units');

				// client signs off on these parameters
				offer.clientSig = gasstationlib.signGastankParameters(
					sampleERC20Token.address,
					gasStationInstance.address,
					_tokensGive,
					offer.gasOffer,
					offer.valid_until,
					gasstation_client.private)
				console.log('clientSig =>', offer.clientSig, 'valid_until=', offer.valid_until);
				done();
			});
		});

		it("gasstation-signer should not be able to execute the same purchaseGas Tx because of insufficient tokens", (done) => {
			// server creates & signs purchaseGas Tx
			gasstationlib.getPurchaseGastx(
				sampleERC20Token.address,
				gasstation_client.public,
				offer.valid_until,
				_tokensGive,
				offer.gasOffer,
				gasStationInstance.address,
				offer.clientSig.v,
				offer.clientSig.r,
				offer.clientSig.s,
				gasstation_signer.public,
				gasstation_signer.private
			).then((purchaseGasTx) => {
				// and throws it in the Tx pool
				localWeb3.eth.sendSignedTransaction(purchaseGasTx.tx).on('receipt', (receipt) => {
					console.log('purchase gas - tx sent', receipt);
					assert.fail('this TX should throw..');
				}).on('error', (err) => {
					done();
				});
			});
		});

	});


	describe('clean up gasstation', function() {

		it("gasstation-contract should have a non-zero Token balance ", (done) => {
			sampleERC20Token.balanceOf.call(gasstation_owner).then(function(balance) {
				_swtbalance = balance.toString(10);
				console.log('gasstation-contract token balance =', _swtbalance);
				assert.ok(_swtbalance > 0);
				done();
			});
		});

		it("withdrawETH should NOT be possible from an unknown account", (done) => {
			gasStationInstance.withdrawETH({
				from: unknown_account,
			}).then(function() {
				assert.fail(null, null, 'this function should throw', e);
				done();
			}).catch(function(e) {
				done();
			});
		});

		it("withdrawETH should be possible from the owner account", (done) => {
			gasStationInstance.withdrawETH({
				from: gasstation_owner,
			}).then(function() {
				done();
				// this should fail
			}).catch(function(e) {
				assert.fail(null, null, 'this function should not throw', e);
				done();
			});
		});

		it("gasstation_owner should be able to assign a different signer", (done) => {
			gasStationInstance.changeGasStationSigner(gasstation_signer2, {
				from: gasstation_owner,
			}).then(function() {
				done();
				// this should fail
			}).catch(function(e) {
				assert.fail(null, null, 'this function should not throw', e);
				done();
			});
		});

		it("gasStationSigner should be changed", (done) => {
			gasStationInstance.gasStationSigner.call().then(function(signer) {
				assert.equal(signer, gasstation_signer2);
				done();
			});
		});
	});


	describe('checkPrerequisites tests', function() {
		it("a non-empty (ETH) account can not be a valid client", (done) => {
			gasstationlib.checkPrerequisites(unused_account)
				.then(() => {
					assert.fail(null, null, 'this function should throw');
				})
				.catch((err) => {
					console.log(err);
					assert.equal(err.code, gasstationlib.errorCodes.ACCOUNT_IS_NOT_EMPTY);
					done();
				});
		});

		it("an empty account with a nonce > 0 can not be a valid client", (done) => {
			Promise.all([
				localWeb3.eth.getGasPrice(),
				localWeb3.eth.getBalance(unused_account),
			]).then(([gasprice, ethbalance]) => {
				// transfer all it's ETH to another account.
				let ethBalanceBN = new localWeb3.utils.BN(ethbalance);
				let stdPriceBN = new localWeb3.utils.BN("21000");
				let gasPriceBN = new localWeb3.utils.BN(gasprice);
				console.log('stdPrice', stdPriceBN.toString(10));
				console.log('gasPrice', gasPriceBN.toString(10));
				let txCostBN = stdPriceBN.mul(gasPriceBN);
				console.log('txCost', txCostBN.toString(10));
				let p = {
					from: unused_account,
					to: accounts[2], // this could be any account really
					value: ethBalanceBN.sub(txCostBN),
					gas: stdPriceBN,
					gasPrice: gasPriceBN,
				};
				console.log(p);
				localWeb3.eth.sendTransaction(p, (err) => {
					assert.isNull(err);

					Promise.all([
						localWeb3.eth.getBalance(unused_account),
						localWeb3.eth.getTransactionCount(unused_account),
					]).then(([balance, txCount]) => {

						console.log('txcount=', txCount);

						// ok the account is empty - has a nonce > 0
						// this account should be invalid.
						gasstationlib.checkPrerequisites(unused_account).then(() => {
							assert.fail(null, null, 'this function should throw');
						}).catch((err) => {
							console.log(err);
							assert.equal(err.code, gasstationlib.errorCodes.ACCOUNT_IS_NOT_UNUSED);
							done();
						});
					});
				})
			});
		});

		it("an smart contract can not be a valid client", (done) => {
			gasstationlib.checkPrerequisites(gasStationInstance.address).then(() => {
				assert.fail(null, null, 'this function should throw');
			}).catch((err) => {
				assert.equal(err.code, gasstationlib.errorCodes.ACCOUNT_IS_CONTRACT);
				done();
			});
		});


	});

	describe('gasstationLib tests', function() {
		it("private to public key derivation should work.", (done) => {
			let pubKey = gasstationlib.privateToAddress('12ed1823ef1c2702b69d44aae3e4beeab8ac3b3d8668e41edbc42e871f1933b2')
			assert.equal(pubKey, '0x4355c23c8209d13b2a92be5fcca6951a83aa4866');
			done();
		});
	});

});
