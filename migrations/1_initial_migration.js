var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(Migrations, {
		gas: 2000000,
		from: accounts[0]
	});
};
