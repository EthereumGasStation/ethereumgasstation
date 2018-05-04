const cache = require('memory-cache');
const rp = require('request-promise');
module.exports = (config) => {
	const lib = {};

	lib.getPrice = function(token) {
		return new Promise((resolve, reject) => {
			let cacheKey = 'price-' + token;
			let cacheVal = cache.get(cacheKey);
			if (cacheVal) {
				return resolve(cacheVal);
			} else {
				let options = {
					uri: 'https://api.coinmarketcap.com/v1/ticker/' + token + '/?convert=ETH',
					json: true, // Automatically parses the JSON string in the response
					forever: false,
				};
				rp(options)
					.then(function(p) {
						cache.put(cacheKey, Object.assign({}, p[0], {
							cached_at: new Date(),
						}), 60 * 1000);
						return resolve(p[0]);
					});
			}
		});
	};
	return lib;
};
