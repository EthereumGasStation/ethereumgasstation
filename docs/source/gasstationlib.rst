
.. include:: include_announcement.rst

=============
gasstationlib
=============

The ``gasstationlib`` allows you to easily create the required data for posting gas-requests to a gasstation.


------------------------------------------------------------------------------

Including gasstation lib in your frontend
=========================================

-------------
using webpack
-------------

You can add the gasstation library to your frontend project by installing the module via NPM
``npm install ethereumgasstation``.

Add the gasstation to your webpack build 

In your ``webpack.js`` add the following:

.. code-block:: javascript

	import
		gasstationlib
	from 'ethereumgasstation/lib/gasstationlib.js';

	export { gasstationlib }

And create an instance of the library , providing the ``web3.currentProvider`` to read data from the blockchain ( nonces , balances etc. ). 

.. code-block:: javascript


        let gasstationlib = webpack.gasstationlib({
          currentProvider: web3.currentProvider
        });


------------------------------------------------------------------------------


signGastankParameters
=====================

Create and sign the gastank parameters


.. code-block:: javascript


	let clientSig = gasstationlib.signGastankParameters(
					tokenInfo.address,
					serverInstance.options.contractaddress,
					fillrequestResponse.tokens,
					fillrequestResponse.gas,
					fillrequestResponse.validuntil,
					gasstationCustomer.private);


getApprovalTx
=============

Create the approval transaction



.. code-block:: javascript

			gasstationlib.getApprovalTx(
				gasstationCustomer.public,
				gasstationCustomer.private,
				tokenInfo.address,
				fillrequestResponse.tokens,
				serverInstance.options.contractaddress
			).then((approvalTx) => {
				...
			});





