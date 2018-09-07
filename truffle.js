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
	    coverage: {
	      host: "localhost",
	      network_id: "*",
	      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
	      gas: 0xfffffffffff, // <-- Use this high gas value
	      gasPrice: 0x01      // <-- Use this low gas price
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
