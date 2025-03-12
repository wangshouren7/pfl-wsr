import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { type HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { type Token } from "../../typechain-types";

// Type for setup result
export interface SetupResult {
  token: Token;
  owner: HardhatEthersSigner;
  user1: HardhatEthersSigner;
  user2: HardhatEthersSigner;
  ownerAddress: string;
  user1Address: string;
  user2Address: string;
  initialSupply: bigint;
}

// Helper function to setup test environment
export async function setup(): Promise<SetupResult> {
  // Get signers
  const [owner, user1, user2] = await ethers.getSigners();
  const ownerAddress = await owner.getAddress();
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();

  // Deploy token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();

  // Get initial supply
  const initialSupply = parseEther("1000000"); // 1 million tokens with 18 decimals

  return {
    token,
    owner,
    user1,
    user2,
    ownerAddress,
    user1Address,
    user2Address,
    initialSupply,
  };
}
