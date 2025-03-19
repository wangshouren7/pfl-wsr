# Dex

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat compile
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Token.ts --network localhost
npx hardhat ignition deploy ./ignition/modules/Exchange.ts --network localhost
npx hardhat run ./scripts/seed.ts --network localhost
npx hardhat run ./scripts/generate-contract-config.ts --network localhost
```
