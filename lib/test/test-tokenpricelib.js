const tokenpricelib = require('../tokenpricelib.js')();
const assert = require('chai').assert;

describe('TokenpriceLib', () => {
	let cachedPrice;
	it("should find a price for swarm-city ( not cached )", (done) => {
		tokenpricelib.getPrice('swarm-city').then((result) => {
			assert.isUndefined(result.cached_at);
			assert.isDefined(result.price_eth);
			cachedPrice = result.price_eth;
			done();
		});
	});

	it("should find a price for swarm-city ( from cache )", (done) => {
		tokenpricelib.getPrice('swarm-city').then((result) => {
			assert.isDefined(result.cached_at);
			assert.equal(result.price_eth, cachedPrice);
			done();
		});
	});
	after(function() {
		process.exit(); //global.asyncDump();
	});

});
