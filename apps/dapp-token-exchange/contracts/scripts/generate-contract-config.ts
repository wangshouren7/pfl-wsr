import { writeFileSync } from "fs";
import { artifacts } from "hardhat";
import { format } from "prettier";

async function generateContractConfig(contractName: string) {
  const address = (
    (await import(
      "../ignition/deployments/chain-31337/deployed_addresses.json"
    )) as unknown as Record<string, string>
  )[`${contractName}Module#${contractName}`];
  const config = await artifacts.readArtifact(contractName);

  const contractConfig = {
    address,
    abi: config.abi,
  };

  const events = config.abi
    .filter((abi) => abi.type === "event")
    .reduce((acc, abi) => {
      acc[abi.name] = abi;
      return acc;
    }, {});

  const code = `
  const ${`${contractName}_Contract_Config`.toUpperCase()} = ${JSON.stringify(contractConfig, null, 2)} as const;

    const ${`${contractName}_Contract_Events`.toUpperCase()} = ${JSON.stringify(events, null, 2)} as const;

    export { ${`${contractName}_Contract_Config`.toUpperCase()} , ${`${contractName}_Contract_Events`.toUpperCase()}  };
    `;

  writeFileSync(
    `./contracts/${contractName}.ts`,
    await format(code, { parser: "typescript" }),
  );
}

generateContractConfig("Exchange");
generateContractConfig("Token");
