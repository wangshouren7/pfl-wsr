## Local development

1. Deploy the contracts to localhost

`cd ./contracts`

```bash
npx hardhat node
```

```bash
npm run deploy:localhost
npx hardhat run ./scripts/seed.ts --network localhost
npx hardhat run ./scripts/generate-contract-config.ts --network localhost
```

2. Start the frontend

```bash
cd ./frontend
npm run dev
```

## Sepolia testnet development

1. Deploy the contracts to Sepolia

`cd ./contracts`

This following command only needs execute once.

```bash
npx hardhat vars set SEPOLIA_TEST_PRIVATE_KEY
```

Then run:

```bash
npm run deploy:sepolia
npx hardhat run ./scripts/generate-contract-config.ts --network sepolia
```

2. Start the frontend

```bash
cd ./frontend
npm run dev
```
