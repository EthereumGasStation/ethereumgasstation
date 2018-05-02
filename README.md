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

This script create 2 files called `gasstationowner.json` and `gasstationsigner.json` in the project folder. *keep these files secure and back them up.*


### Fund the owner key

Send around 0.1 ETH to the public key of the owner.

If you're on Ropsten you can use the faucet available here : http://faucet.ropsten.be/ 

### Deploy your gasstation

Deploy your gasstation ( to Ropsten in this case )

```
truffle --network ropsten migrate --reset
```

outputs

```
...
  Replacing GasStation...
  ... 0xdcd2791b8708fe5af993a715dc18a888dc04c1958ce86ae2dc897b0ab28181c4
  GasStation: 0x8393249596b812af26fa128d15202e4818276403
Saving artifacts...
```

Now the deployed gasstation address is shown (`0x8393249596b812af26fa128d15202e4818276403` in this example) - write this down too.

## Put some ETH on your accounts

* Put some ETH on the gasstation contract (this will be the gas that is sold to your clients).
* Put some ETH on the signer address (this account will send the upfront gas & execute the transactions on behalf of the client)

( again if you're on Ropsten - use the faucet )

## Ready to go !

Your gasstation contract and accounts are now ready to go.







