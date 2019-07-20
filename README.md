# U°OS Application Wallet Library

[![dependencies Status](https://david-dm.org/UOSnetwork/ucom.libs.wallet/status.svg)](https://david-dm.org/UOSnetwork/ucom.libs.wallet) 
[![devDependencies Status](https://david-dm.org/UOSnetwork/ucom.libs.wallet/dev-status.svg)](https://david-dm.org/UOSnetwork/ucom.libs.wallet?type=dev)

![Wallet interface](https://raw.githubusercontent.com/UOSnetwork/ucom.libs.wallet/master/documentation/img/wallet.png)

![Blockchain resources interface](https://raw.githubusercontent.com/UOSnetwork/ucom.libs.wallet/master/documentation/img/blockchain-resources.png)

## Main goals
* The library implements a blockchain wallet for U°OS (EOS-based) network.
* The library is a part of [UOSnetwork project](https://github.com/UOSnetwork)
* The library is used both on [backend UOS application](https://github.com/UOSnetwork/ucom.backend) and [frontend UOS application](https://github.com/UOSnetwork/ucom.frontend)

## Most interesting features
* A straightforward API to use - call the method and provide required arguments.
* The client application does not need to know anything about the concrete blockchain implementation.
* Send tokens, buy/sell all kinds of resources (CPU/Network/RAM), vote for the nodes.
* Fetch real-time users properties related to the blockchain.

## Most interesting solutions 
* Everything related to the blockchain is placed to this library. [backend UOS application](https://github.com/UOSnetwork/ucom.backend) is only a client.
* Typescript and custom interfaces.
* 100+ autotests and test-driven development.
* Blockchain-related dictionaries can be used outside the library scope.
* 10+ eslint/tslint rules to provide a high quality of implementation.

See also [CONTRIBUTING](../../../uos.docs/blob/master/CONTRIBUTING.md) for detailed project information.
