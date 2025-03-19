import { resolve } from "path";
import { existsSync } from "fs";
import fg from "fast-glob";

export async function getLocalhostDeployedAddressesJSON() {
  const addressFile = resolve(
    "ignition/deployments/chain-31337/deployed_addresses.json",
  );

  if (!existsSync(addressFile)) {
    throw new Error(`Address file ${addressFile} does not exist`);
  }

  return (await import(addressFile)) as Record<string, string>;
}

export async function getDeployedChainIdToAddresses() {
  const addressFiles = await fg(
    "ignition/deployments/*/deployed_addresses.json",
    { absolute: true },
  );
  if (addressFiles.length === 0) {
    throw new Error("No deployed addresses found");
  }

  const ret = {} as Record<
    string,
    {
      Token: string;
      Exchange: string;
    }
  >;

  await Promise.all(
    addressFiles.map(async (addressFile) => {
      const chainId = Number(addressFile.match(/chain-(\d+)/)?.[1]);
      if (!chainId) {
        throw new Error(`Chain ID not found in ${addressFile}`);
      }

      const json = (await import(addressFile)) as Record<string, string>;
      ret[chainId] = {
        Token: json["TokenModule#Token"],
        Exchange: json["ExchangeModule#Exchange"],
      };
    }),
  );

  console.log("Chain id to addresses:\n", JSON.stringify(ret, null, 2));

  return ret;
}
