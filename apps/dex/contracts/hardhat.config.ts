import { vars, type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { type NetworksUserConfig } from "hardhat/types";

const hasSepoliaPrivateKey = vars.has("SEPOLIA_TEST_PRIVATE_KEY");

const networks: NetworksUserConfig = {
  ganache: {
    url: "http://localhost:7545",
    accounts: [
      "0x341afa1e065408123210c5d54d1c8813f0db99fbc172f9fc388b60040f627f5b",
    ],
  },
};

if (hasSepoliaPrivateKey) {
  networks.sepolia = {
    url: "https://eth-sepolia.g.alchemy.com/v2/ktIe8-3T28q2B3tEnK2VhPr2izkBsRA9",
    accounts: [vars.get("SEPOLIA_TEST_PRIVATE_KEY")],
  };
}

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks,
};

export default config;
