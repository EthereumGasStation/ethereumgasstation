const keythereum = require('keythereum');
const ethUtil = require('ethereumjs-util');

// create random ethereum keypairs
module.exports = (amount) => {
	amount = amount || 1;
	let keys = [];
	for (let i = 0; i < amount; i++) {
		let dk = keythereum.create();
		let keyObject = keythereum.dump("none", dk.privateKey, dk.salt, dk.iv);
		keys.push({
			private: dk.privateKey.toString('hex'),
			public: ethUtil.addHexPrefix(keyObject.address)
		});
	}
	return (keys);
}
