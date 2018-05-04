const mkkeypairs = require('./mkkeypairs.js');
const fs = require('fs');
const path = require('path');
const ownerfilename = path.join(__dirname, '..', 'gasstationowner.json');
const signerfilename = path.join(__dirname, '..', 'gasstationsigner.json');

module.exports = function(callback) {
	if (fs.existsSync(ownerfilename) || fs.existsSync(signerfilename)) {
		console.log(ownerfilename, 'or', signerfilename, 'already exists. Refusing to overwrite');
	} else {
		let accounts = {
			owner: mkkeypairs(1)[0],
			signer: mkkeypairs(1)[0],
		};
		fs.writeFileSync(ownerfilename, JSON.stringify(accounts.owner, null, 2));
		fs.writeFileSync(signerfilename, JSON.stringify(accounts.signer, null, 2));
		console.log('written owner account to', ownerfilename);
		console.log('owner=', accounts.owner.public);
		console.log('written signer account to', signerfilename);
		console.log('signer=', accounts.signer.public);
	}
	callback();
};
