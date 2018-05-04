const SampleToken = artifacts.require("./SampleToken.sol");
const fs = require('fs');
const path = require('path');

module.exports = function(deployer, network, accounts) {
	if (network !== 1) {
		const testAccounts = require(path.join(__dirname, '..', 'testaccounts.json'));
		deployer.then(() => {
			return SampleToken.new({
				gas: 2000000,
				from: accounts[0]
			});
		}).then((instance) => {
			console.log('created new token at', instance.address);
			let targetAccounts = testAccounts.map((item) => {
				return item.public
			})
			instance.massMint(targetAccounts, 100e18, {
				gas: 2000000,
				from: accounts[0]
			}).then(() => {
				console.log('Minted tokens for testaccounts');
			});
		});
	}
};
