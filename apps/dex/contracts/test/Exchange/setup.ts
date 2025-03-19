import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { type HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { type Exchange, type Token } from "../../typechain-types";

// Constants
export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

// Enum to match the contract's OrderStatus
export enum OrderStatus {
  PENDING = 0,
  FILLED = 1,
  CANCELLED = 2,
}

// Type for setup result
export interface SetupResult {
  exchange: Exchange;
  token: Token;
  owner: HardhatEthersSigner;
  user1: HardhatEthersSigner;
  user2: HardhatEthersSigner;
  feeAccount: HardhatEthersSigner;
  ownerAddress: string;
  user1Address: string;
  user2Address: string;
  feeAccountAddress: string;
  feePercent: number;
}

// Helper function to setup test environment
export async function setup(): Promise<SetupResult> {
  // Get signers
  const [owner, user1, user2, feeAccount] = await ethers.getSigners();
  const ownerAddress = await owner.getAddress();
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();
  const feeAccountAddress = await feeAccount.getAddress();

  // Deploy token
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();

  // Deploy exchange with 3% fee
  const feePercent = 3;
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchange = await Exchange.deploy(feeAccountAddress, feePercent);
  await exchange.waitForDeployment();

  // Transfer some tokens to users for testing
  await token.connect(owner).transfer(user1Address, parseEther("1000"));
  await token.connect(owner).transfer(user2Address, parseEther("1000"));

  return {
    exchange,
    token,
    owner,
    user1,
    user2,
    feeAccount,
    ownerAddress,
    user1Address,
    user2Address,
    feeAccountAddress,
    feePercent,
  };
}

// Helper function to approve and deposit tokens in one go
export async function approveAndDeposit(
  token: Token,
  exchange: Exchange,
  user: HardhatEthersSigner,
  amount: bigint,
): Promise<void> {
  await token.connect(user).approve(await exchange.getAddress(), amount);
  await exchange.connect(user).depositToken(await token.getAddress(), amount);
}
