---
title: How to create an upgradable smart contract using OpenZeppelin SDK'
excerpt: "Smart Contract are immutable, verifiable, and autonomous pieces of code that are stored on a blockchain that are automatically executed when predetermined terms and conditions are met. Due to the immutability nature of blockchain, no change is possible on a deployed smart contract or a verified transaction. Due to the immutability nature of blockchain, no change is possible on a deployed smart contract or a verified transaction."
coverImage: '/assets/blog/smart-contract-upgradable/openzeppelin_truffle.png'
date: '2022-09-19T12:35:07.322Z'
author:
  name: Téo CRICELLI
  picture: '/assets/blog/authors/teo.png'
ogImage:
  url: '/assets/blog/smart-contract-upgradable/openzeppelin_truffle.png'
---

## <mark>Wanna Update</mark>(trop familier) your smart contract ?

At Fractif, <mark>In</mark>(la maj) order to build an <mark>awesome asset tokenization app</mark>(t'es sûr que tu veux le sortir maintenant ?), we were interested in how to update our smart contracts on the [Ethereum Blockchain](https://ethereum.org/).

[Smart contracts](https://www.ibm.com/topics/smart-contracts) are immutable, verifiable, and autonomous pieces of code that are stored on a blockchain <mark>that are</mark>(répétition 'that are') automatically executed when predetermined terms and conditions are met. Due to the immutability nature of blockchain, no change is possible on a deployed smart contract or a verified transaction. <mark>Due to the immutability nature of blockchain, no change is possible on a deployed smart contract or a verified transaction.</mark>(répétition)

<mark>Due to the immutability nature of blockchain, no change is possible on a deployed smart contract or a verified transaction.</mark> (toi t'as trop utilisé Copilot fatigué) Unfortunately your smart contract might need a patch, a fix, or new features.

But thanks with Openzeppelin you will be able to upgrade your smart contract with an <mark>ingenious process</mark>(ça se dit pas vraiment je crois, plutôt smooth process, smoothly, et ses synonymes).

----------------------
## How does it works ?

### The proxy pattern


<mark>Thins</mark>(this ?) <mark>ingenious process is simple to understand the proxy upgrade pattern</mark> (je vois pas vraiment le sens de la phrase ? p-e 'makes it easy to create an upgrade pattern ?). The proxy upgrade pattern involves deploying a proxy contract that delegates function calls to your logic and storage contracts. 

The proxy will store adresses of the logic contracts and this adress can be changed allowing us to deploy a new version of our contract and point the proxy to that new version.

Warning - However, there are many things to be careful of when using this process. Especially <mark>to</mark>(we want to...) make sure that our old contracts are not used for bad purposes.

More information on proxy patterns, take a look on [OpenZeppelin’s proxy pattern guide](https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades).

![Proxy pattern](/assets/blog/smart-contract-upgradable/proxy-contract.png "Proxy pattern")
Illustration from [Ethereum StackExchange](https://ethereum.stackexchange.com/)

----------------------
## Environement setup

A future post will explain you how to setup your <mark>solidity</mark>(maj) environment. This post will show you which environnement between [Truffle](https://trufflesuite.com/) and [Hardhat](https://hardhat.org/) you need to use for your needs.

Subscribe to the newsletter to get informed once the post will be available<mark> !</mark>(en anglais pas d'espace avant la ponctuation)

But let's use Truffle for this example.

<mark>Creating</mark>(Create) a new npm project:
```shell
mkdir smartcontract-upgradable

cd smartcontract-upgradable
```

Install and init truffle:
```shell
npm i --save-dev truffle

npx truffle init
```

Truffle Upgrades plugin :
```shell
npm i --save-dev @openzeppelin/truffle-upgrades
```

Testing plugin :
```shell
npm i --save-dev chai
```

----------------------
## So the question is how to create an upgradable smart contract ?

Let's take the example of the [Openzeppelin](https://docs.openzeppelin.com/) documentation.

<mark>Let's</mark>(répétition) init a simple smart contract.

**Car.sol**

```solidity
// contracts/Car.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Car {
    string private _value;

    // Emitted when the stored value changes
    event ValueChanged(string value);

    // Stores a new value in the contract
    function store(string memory value) public {
        _value = value;
    }

    // Reads the last stored value
    function retrieve() public view returns (string memory) {
        return _value;
    }
}
```
----------------------
## Testing localy our smart contract

<mark>We will</mark>(first of all p-e ?) create unit tests for our contract. 
Create Car.test.js in your test directory.

**Car.test.js**
```javascript
// test/Car.test.js
// Load dependencies
const { expect } = require("chai");

// Load compiled artifacts
const Car = artifacts.require("Car");

// Start test block
contract("Car", function () {
	beforeEach(async function () {
		// Deploy a new Car contract for each test
		this.car = await Car.new();
	});

	// Test case
	it("retrieve returns a value previously stored", async function () {
		// Store a value
		await this.car.store("Mustang");

		// Test if the returned value is the same one
		// Note that we need to use strings to compare the 256 bit integers
		expect((await this.car.retrieve()).toString()).to.equal("Mustang");
	});
});
```

We will now create tests to interact with our contract through the proxy

**Car.proxy.test.js**
```javascript
// test/Car.proxy.test.js
const { expect } = require("chai");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

// Load compiled artifacts
const Car = artifacts.require("Car");

// Start test block
contract("Car (proxy)", function () {
	beforeEach(async function () {
		// Deploy a new Car contract for each test
		this.car = await deployProxy(Car, ["Mustang"], { initializer: "store" });
	});

	// Test case
	it("retrieve returns a value previously initialized", async function () {
		// Test if the returned value is the same one
		// Note that we need to use strings to compare the 256 bit integers
		expect((await this.car.retrieve()).toString()).to.equal("Mustang");
	});
});
```

<mark>Let's run our tests !</mark>(répétition et ponctuation)

``` shell
$ npx truffle test
...
  Contract: Car (proxy)
    ✔ retrieve returns a value previously initialized

  Contract: Car
    ✔ retrieve returns a value previously stored


  2 passing (169ms)
```
----------------------
## Deploy the contract <mark>to a public network</mark>(trop long)

To deploy our Car contract we will use <mark>Truffle migrations</mark>(lien ?). 

[The Truffle Upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades) plugin provides a deployProxy function to deploy our upgradeable contract. 

<mark>It will deploy our contract, a ProxyAdmin to be the admin for our projects proxies and the proxy.</mark>(pas très clair comme notion)

Create the following 2_deploy_car.js script in the migrations directory.

We will initialize state using the store function.

**2_deploy_car.js**

```javascript
// migrations/2_deploy_car.js
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const Car = artifacts.require("Car");

module.exports = async function (deployer) {
	await deployProxy(Car, ["Mustang"], { deployer, initializer: "store" });
};
```
You can now first deploy the contract to a local test to check if everything is working. 
A new post will come soon to explain you how to deploy and test your contract in local through [Ganache](https://trufflesuite.com/ganache/).

But for the moment we will deploy it to a testnet network directly.

You can <mark>test</mark>(deploy it) on any testnet ([Ropsten](https://ropsten.etherscan.io/), [Kovan](https://kovan.etherscan.io/), [Rinkeby](https://rinkeby.etherscan.io/))

But in this post we are going to use Goerli. 
A new post about <mark>setuping</mark>(setting) our project using a testnet will come soon.

Now that your project is setup on a testnet, you can now run truffle migrate on Goerli (or your preferred network). Once the migration is done we can now see our contract (Car.sol), a **ProxyAdmin** and the **proxy** being deployed.

```shell
$ npx truffle migrate --network goerli
...
2_deploy_car.js
=====================

   Replacing 'Car'
   ---------------
   > transaction hash:    0x0f176eb6611628feb19b29d6272a06da71bf403e8a776c0d5bcc850df126d036
   > Blocks: 2            Seconds: 44
   > contract address:    0x3E2eF5D3BF6FFB5500fa54c4fbB8CDaBdE6EAbbC
   > block number:        7620794
   > block timestamp:     1663581288
   > account:             0x0aE9eB029dDCC77548368b3133C7331330Ad3834
   > balance:             0.226038272738695937
   > gas used:            309861 (0x4ba65)
   > gas price:           2.500000041 gwei
   > value sent:          0 ETH
   > total cost:          0.000774652512704301 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 7620795)
   > confirmation number: 2 (block: 7620796)

   Deploying 'ProxyAdmin'
   ----------------------
   > transaction hash:    0x2c5c71630cd20521715f41a4645ab8262d8c9222011767c528ca5fd12b827ac8
   > Blocks: 0            Seconds: 4
   > contract address:    0x933E6c0248BA77a5faE80105bf6739881A125d0F
   > block number:        7620797
   > block timestamp:     1663581336
   > account:             0x0aE9eB029dDCC77548368b3133C7331330Ad3834
   > balance:             0.224828222717399057
   > gas used:            484020 (0x762b4)
   > gas price:           2.500000044 gwei
   > value sent:          0 ETH
   > total cost:          0.00121005002129688 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 7620798)
   > confirmation number: 2 (block: 7620799)

   Deploying 'TransparentUpgradeableProxy'
   ---------------------------------------
   > transaction hash:    0x54a69ef88b9f40fa5deee8954892be7786863e33efcd2e0225b98921d7329acc
   > Blocks: 3            Seconds: 44
   > contract address:    0xc52e3233BA47e89a9fA01DA429f3Cd298c4c786A
   > block number:        7620802
   > block timestamp:     1663581444
   > account:             0x0aE9eB029dDCC77548368b3133C7331330Ad3834
   > balance:             0.223279697690764427
   > gas used:            619410 (0x97392)
   > gas price:           2.500000043 gwei
   > value sent:          0 ETH
   > total cost:          0.00154852502663463 ETH

   Pausing for 2 confirmations...

   -------------------------------
```

## Update a contract <mark>on a public network</mark>(trop long)

Now that we have created and deployed an upgradable smart contract, how can we update our contract?

Let's write our new smart contract version:

**CarV2.sol**
```solidity
// contracts/CarV2.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CarV2 {
    string private _value;

    // Emitted when the stored value changes
    event ValueChanged(string value);

    // Stores a new value in the contract
    function store(string memory value) public {
        _value = value;
    }

    // Reads the last stored value
    function retrieve() public view returns (string memory) {
        return _value;
    }

    // Increments the stored value by 1
    function ChangeCarName() public {
        _value = "Porsche";
        emit ValueChanged(_value);
    }
}
```

Let's write our migration to upgrade our Car V1 smart contract into Car V2.

```javascript
// migrations/3_upgrade_car.js
const { upgradeProxy } = require("@openzeppelin/truffle-upgrades");

const Car = artifacts.require("Car");
const CarV2 = artifacts.require("CarV2");

module.exports = async function (deployer) {
	const existing = await Car.deployed();
	const instance = await upgradeProxy(existing.address, CarV2, { deployer });
	console.log("Upgraded", instance.address);
};
```

```shell
$ npx truffle migrate --network goerli
...
3_upgrade_car.js
================

   Deploying 'CarV2'
   -----------------
   > transaction hash:    0x2ddc067e8324a4d2106092bd33245292945047cd88f8245b308b447a486adf1e
   > Blocks: 1            Seconds: 16
   > contract address:    0x3c4BAC16BBb308806a44F44Aa1E42aDe0A96185c
   > block number:        7620912
   > block timestamp:     1663582944
   > account:             0x0aE9eB029dDCC77548368b3133C7331330Ad3834
   > balance:             0.207427297518284311
   > gas used:            382511 (0x5d62f)
   > gas price:           2.50000003 gwei
   > value sent:          0 ETH
   > total cost:          0.00095627751147533 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 7620913)
   > confirmation number: 2 (block: 7620914)

  Upgraded 0x1e5fD2cF4050BeDAe85daB2805491A82a4B2D9FE

   > Saving artifacts
   -------------------------------------
   > Total cost:     0.00095627751147533 ETH

Summary
=======
> Total deployments:   2
> Final cost:          0.001730930022010604 ETH
```
----------------------

More detail on Openzeppelin documentation [here](https://docs.openzeppelin.com/upgrades-plugins/1.x/truffle-upgrades)

Inspired by [OpenZeppelin Upgrades Step by Step forum](https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-truffle/3579)
