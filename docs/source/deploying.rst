
.. include:: include_announcement.rst

=========================
Deploying your gasstation
=========================

Here are instructions on how to deploy and run your own gasstation.

------------------------------------------------------------------------------


Setup
=====

checkout the repo then run 

``npm install``

Create a set of keypairs
========================


``truffle exec ./scripts/mkkp.js``

Output

.. code-block:: javascript

 written owner account to /<path>/ethereumgasstation/gasstationowner.json
 owner= 0xb985effab2481828ab5d15109b2835ba5e748bfa
 written signer account to /<path>/ethereumgasstation/gasstationsigner.json
 signer= 0x1028e1276e16012f7afd0b863225e1351fa024d6


This script create two files called ``gasstationowner.json`` and ``gasstationsigner.json`` in the project folder. *keep these files secure and back them up.*


Fund the owner key
==================

Send around 0.1 ETH to the public key of the owner.

If you're on Ropsten you can use the faucet available here : http://faucet.ropsten.be/ 

Deploy your gasstation
======================

Deploy your gasstation ( to Ropsten in this case )

``truffle --network ropsten migrate --reset``

Output

.. code-block:: javascript

  Replacing GasStation...
  ... 0xdcd2791b8708fe5af993a715dc18a888dc04c1958ce86ae2dc897b0ab28181c4
  GasStation: 0x8393249596b812af26fa128d15202e4818276403
 Saving artifacts


Now the deployed gasstation address is shown (``0x8393249596b812af26fa128d15202e4818276403`` in this example) - write this down too.

Put some ETH on your accounts
=============================

* Put some ETH on the gasstation contract (ex. 1 ETH - this will be the gas that is sold to your clients).
* Put some ETH on the signer address (ex. 0.5 ETH - this account will send the upfront gas & execute the transactions on behalf of the client)

( again if you're on Ropsten - use the faucet )

Ready to go !
=============

Your gasstation contract and accounts are now ready to go.

The blockchain part is done.

Now lease proceed to the https://github.com/EthereumGasStation/ethereumgasstationserver to set up your gasstation server.

