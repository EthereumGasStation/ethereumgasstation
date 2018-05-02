# ethereumgasstation

[![Build Status](https://travis-ci.org/EthereumGasStation/ethereumgasstation.svg?branch=master)](https://travis-ci.org/EthereumGasStation/ethereumgasstation)
[![Coverage Status](https://coveralls.io/repos/github/EthereumGasStation/ethereumgasstation/badge.svg)](https://coveralls.io/github/EthereumGasStation/ethereumgasstation)

Simpler Ethereum GasStation

## Deploy your own gasstation

### Setup

checkout the repo then run 

```
npm install
```

### Create a set of keypairs

```
truffle exec ./scripts/mkkp.js
```

This should output the following

```
written owner account to <path>/ethereumgasstation/gasstationowner.json
owner= 0xb985effab2481828ab5d15109b2835ba5e748bfa
written signer account to <path>/ethereumgasstation/gasstationsigner.json
signer= 0x1028e1276e16012f7afd0b863225e1351fa024d6

```

### Fund the owner key

Send around 0.1 ETH to the public key of the owner.

If you're on Ropsten you can use the faucet available here : http://faucet.ropsten.be/ 

### Deploy your gasstation

Deploy your gasstation ( to Ropsten in this case )

```
truffle --network ropsten migrate --reset
```



This will create 2 files called `accounts.json` in the project folder. *keep these files secure and back them up.*





