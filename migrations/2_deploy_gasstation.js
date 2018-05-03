const GasStation = artifacts.require("./GasStation.sol");
const fs = require('fs');
const path = require('path');
const signerFileName = path.join(__dirname, '..', 'gasstationsigner.json');

module.exports = function(deployer, network, accounts) {
	var signerAccount = null;
	if (fs.existsSync(signerFileName)) {
		signerAccount = require(signerFileName);
	}
	if (!signerAccount) {
		console.log('please create a pubkey file', signerFileName, 'for the SIGNER address. see the README.md');
	} else {
		const signerAddress = signerAccount.public;
		const maxGas = 1e16;
		console.log('deploying gasstation. Parameters: ');
		console.log('owner address =', accounts[0]);
		console.log('signer address =', signerAddress);
		console.log('maxgas =', maxGas);
		deployer.deploy(GasStation, signerAddress, maxGas, {
			//gasprice: 1e6,
			gas: 4600000,
			from: accounts[0]
		});
	}
};
