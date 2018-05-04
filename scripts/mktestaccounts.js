const mkkeypairs = require('./mkkeypairs.js');
const fs = require('fs');
const path = require('path');
const testaccountsfilename = path.join(__dirname, '..', 'testaccounts.json');

module.exports = function(callback) {
	const testAccounts = 10;
	if (fs.existsSync(testaccountsfilename)) {
		console.log(testaccountsfilename, 'already exists. Refusing to overwrite');
	} else {
		console.log('creating', testAccounts, 'accounts...');
		fs.writeFileSync(testaccountsfilename, JSON.stringify(mkkeypairs(testAccounts), null, 2));
		console.log('Done. Written test accounts to', testaccountsfilename);
	}
	callback();
};
