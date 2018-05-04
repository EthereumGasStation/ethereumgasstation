const PrivateKeyProvider = require("truffle-privatekey-provider");
const fs = require('fs');
const path = require('path');
const ownerfilename = path.join(__dirname, 'gasstationowner.json');

function getNetworks() {
	var gasstationOwnerAccount = null;
	if (fs.existsSync(ownerfilename)) {
		gasstationOwnerAccount = require(ownerfilename);
	}
	return ({
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*" // Match any network id
		},
		ropsten: {
			provider: gasstationOwnerAccount ? new PrivateKeyProvider(gasstationOwnerAccount.private, "https://ropsten.infura.io/") : null,
			network_id: 3,
			gas: 1828127,
		},
		mainnet: {
			provider: gasstationOwnerAccount ? new PrivateKeyProvider(gasstationOwnerAccount.private, "https://ropsten.infura.io/") : null,
			network_id: 1,
			gas: 1828127,
		},
	});
}

module.exports = {
	networks: getNetworks(),
	solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	},
};
