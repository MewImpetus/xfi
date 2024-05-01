# xfi

## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build

`npm run build`


### Deploy or run another script

`npm run start`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`


## TestNet Contract
Jetton Master: [EQC1w4R9Bz3SLn7Jdnt8xKIbQxxGePQs63WnlM0v-mowGMMI](https://testnet.tonviewer.com/kQC1w4R9Bz3SLn7Jdnt8xKIbQxxGePQs63WnlM0v-mowGHiC)

Meta data:
