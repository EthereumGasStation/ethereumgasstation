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
//		development: {
//			host: "127.0.0.1",
//			port: 8545,
//			network_id: "*" // Match any network id
//		},
		ropsten: {
			provider: gasstationOwnerAccount ? new PrivateKeyProvider(gasstationOwnerAccount.private, "https://ropsten.infura.io/") : null,
			network_id: 3
		},
		mainnet: {
			provider: gasstationOwnerAccount ? new PrivateKeyProvider(gasstationOwnerAccount.private, "https://ropsten.infura.io/") : null,
			network_id: 1
		},
	});
}

module.exports = {
	networks: getNetworks()
};
