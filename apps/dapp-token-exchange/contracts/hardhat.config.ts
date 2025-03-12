import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0x341afa1e065408123210c5d54d1c8813f0db99fbc172f9fc388b60040f627f5b",
      ],
    },
  },
};

export default config;
