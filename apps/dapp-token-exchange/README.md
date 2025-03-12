## Local development

1. Deploy the contracts

`cd ./contracts`

```bash
npx hardhat node
```

```bash
npx hardhat ignition deploy ./ignition/modules/Token.ts --network localhost
npx hardhat ignition deploy ./ignition/modules/Exchange.ts --network localhost
npx hardhat run ./scripts/seed.ts --network localhost
npx hardhat run ./scripts/generate-contract-config.ts --network localhost
```

2. Start the frontend

```bash
cd ./frontend
npm run dev
```
