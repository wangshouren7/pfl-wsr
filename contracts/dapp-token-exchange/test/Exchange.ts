import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, util } from "chai";
import hre, { ethers } from "hardhat";
import { ContractTransactionResponse, getAddress, Signer } from "ethers";
import { Exchange, Token } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

const ether = (n: number) => {
  return hre.ethers.parseEther(n.toString());
};

// Same as ether
const tokens = (n: number) => ether(n);
const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000"; // 0x 后面 40 个 0
const FEE_PERCENT = 3; // 3%
const MAX_AMOUNT = BigInt(999999999999999999999999);

describe("Exchange", function () {
  let exchange: Exchange;
  let owner: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;
  let thirdAccount: HardhatEthersSigner;
  let feeAccount: HardhatEthersSigner;
  let token: Token;

  let tokenGet: string;
  let amountGet: bigint;
  let tokenGive: string;
  let amountGive: bigint;

  let creator: HardhatEthersSigner;
  let filler: HardhatEthersSigner;
  let ownerTokenGetBalanceBefore: bigint;
  let ownerTokenGiveBalanceBefore: bigint;
  let creatorTokenGetBalanceBefore: bigint;
  let creatorTokenGiveBalanceBefore: bigint;
  let fillerTokenGetBalanceBefore: bigint;
  let fillerTokenGiveBalanceBefore: bigint;
  let feeAccountTokenGetBalanceBefore: bigint;

  beforeEach(async () => {
    [owner, otherAccount, thirdAccount] = await hre.ethers.getSigners();
    const Exchange = await hre.ethers.getContractFactory("Exchange");
    exchange = await Exchange.deploy(owner.address, FEE_PERCENT);

    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();

    feeAccount = owner;

    tokenGet = ETHER_ADDRESS;
    amountGet = ether(1);
    tokenGive = await token.getAddress();
    amountGive = tokens(1);

    ownerTokenGetBalanceBefore = await exchange.balanceOf(
      tokenGet,
      owner.address,
    );
    ownerTokenGiveBalanceBefore = await exchange.balanceOf(
      tokenGive,
      owner.address,
    );

    creator = otherAccount;
    filler = thirdAccount;

    await token.transfer(creator.address, tokens(100));
    await token.transfer(filler.address, tokens(100));

    // creator deposit
    await token.connect(creator).approve(exchange, tokens(100));
    await exchange.connect(creator).depositToken(token, tokens(10));
    await exchange.connect(creator).depositEther({ value: ether(10) });

    // filler deposit
    await token.connect(filler).approve(exchange, tokens(100));
    await exchange.connect(filler).depositToken(token, tokens(10));
    await exchange.connect(filler).depositEther({ value: ether(10) });

    creatorTokenGetBalanceBefore = await exchange.balanceOf(
      tokenGet,
      creator.address,
    );
    creatorTokenGiveBalanceBefore = await exchange.balanceOf(
      tokenGive,
      creator.address,
    );
    fillerTokenGetBalanceBefore = await exchange.balanceOf(
      tokenGet,
      filler.address,
    );
    fillerTokenGiveBalanceBefore = await exchange.balanceOf(
      tokenGive,
      filler.address,
    );

    feeAccountTokenGetBalanceBefore = await exchange.balanceOf(
      tokenGet,
      feeAccount.address,
    );
  });

  describe("Deployment", function () {
    it("Should set the right fee account", async function () {
      expect(await exchange.feeAccount()).to.equal(feeAccount);
    });

    it("Should set the right fee percent", async function () {
      expect(await exchange.feePercent()).to.equal(FEE_PERCENT);
    });
  });

  describe("Depositing Ether", function () {
    it("reverts if the amount is less or equal to 0", async () => {
      await expect(
        exchange.depositEther({ value: ether(0) }),
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should deposit Ether and update balance", async function () {
      await exchange.depositEther({ value: ether(1) });
      const balance = await exchange.balanceOf(ETHER_ADDRESS, owner.address);
      expect(balance.toString()).to.equal(
        (ownerTokenGetBalanceBefore + ether(1)).toString(),
      );
    });

    it("emits the Deposit event", async () => {
      await expect(exchange.depositEther({ value: ether(1) }))
        .to.emit(exchange, "Deposit")
        .withArgs(ETHER_ADDRESS, owner.address, ether(1), ether(1));
    });
  });

  describe("Withdrawing Ether", function () {
    beforeEach(async () => {
      await exchange.depositEther({ value: ether(1) });
    });

    it("reverts if the amount is insufficient", async () => {
      await expect(exchange.withdrawEther(MAX_AMOUNT)).to.be.revertedWith(
        "Insufficient balance",
      );
    });

    it("Should withdraw Ether and update balance", async function () {
      await exchange.withdrawEther(ether(1));

      const balance = await exchange.balanceOf(ETHER_ADDRESS, owner.address);
      expect(balance.toString()).to.equal(ether(0).toString());
    });

    it("emits the Withdraw event", async () => {
      await expect(exchange.withdrawEther(ether(1)))
        .to.emit(exchange, "Withdraw")
        .withArgs(ETHER_ADDRESS, owner.address, ether(1), ether(0));
    });
  });

  describe("Depositing Tokens", function () {
    it("reverts if the token is ether", async () => {
      await expect(
        exchange.depositToken(ETHER_ADDRESS, tokens(100)),
      ).to.be.revertedWith("Invalid token");
    });

    it("reverts if the amount is less or equal to 0", async () => {
      await expect(
        exchange.depositToken(token.target, tokens(0)),
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("reverts if the token transfer fails", async () => {
      await expect(
        exchange.depositToken(token.target, tokens(100)),
      ).to.be.revertedWith(/(Transfer failed)|(not enough allowance)/);
    });

    it("Should deposit tokens and update balance", async function () {
      await token.approve(exchange.target, tokens(100));
      await exchange.depositToken(token.target, tokens(100));
      const balance = await exchange.balanceOf(token.target, owner.address);
      expect(balance.toString()).to.equal(tokens(100).toString());
    });

    it("emits the Deposit event", async () => {
      await token.approve(exchange.target, tokens(100));
      await expect(exchange.depositToken(token.target, tokens(100)))
        .to.emit(exchange, "Deposit")
        .withArgs(token.target, owner.address, tokens(100), tokens(100));
    });
  });

  describe("Withdrawing Tokens", function () {
    beforeEach(async () => {
      await token.approve(exchange.target, tokens(100));
      await exchange.depositToken(token.target, tokens(100));
    });

    it("reverts if the token is ether", async () => {
      await expect(
        exchange.withdrawToken(ETHER_ADDRESS, tokens(100)),
      ).to.be.revertedWith("Invalid token");
    });

    it("reverts if the amount is insufficient", async () => {
      await expect(
        exchange.withdrawToken(token.target, MAX_AMOUNT),
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should withdraw tokens and update balance", async function () {
      await exchange.withdrawToken(token.target, tokens(100));
      const balance = await exchange.balanceOf(token.target, owner.address);
      expect(balance.toString()).to.equal(tokens(0).toString());
    });

    it("emits the Withdraw event", async () => {
      await expect(exchange.withdrawToken(token.target, tokens(100)))
        .to.emit(exchange, "Withdraw")
        .withArgs(token.target, owner.address, tokens(100), tokens(0));
    });

    // todo
    // it("reverts if the transfer fails", async () => {
    //   await expect(
    //     exchange.withdrawToken(token.target, tokens(100))
    //   ).to.be.revertedWith("Transfer failed");
    // });
  });

  describe("Order Creation", function () {
    it("Should create an order", async function () {
      await exchange
        .connect(creator)
        .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
      const order = await exchange.orders(1);
      expect(order.id).to.equal(1);
      expect(order.user).to.equal(creator.address);
      expect(order.tokenGet).to.equal(tokenGet);
      expect(order.amountGet.toString()).to.equal(amountGet.toString());
      expect(order.tokenGive).to.equal(tokenGive);
      expect(order.amountGive.toString()).to.equal(amountGive.toString());
    });

    it("emits the Order event", async () => {
      await expect(
        exchange
          .connect(creator)
          .makeOrder(tokenGet, amountGet, tokenGive, amountGive),
      )
        .to.emit(exchange, "Order")
        .withArgs(
          1,
          creator.address,
          tokenGet,
          amountGet,
          tokenGive,
          amountGive,
          anyValue,
        );
    });
  });

  describe("Order Cancellation", function () {
    it("Should cancel an order", async function () {
      await exchange.makeOrder(tokenGet, amountGet, tokenGive, amountGive);
      await exchange.cancelOrder(1);
      const isCancelled = await exchange.orderCancelled(1);
      expect(isCancelled);
    });

    it("reverts if the order is not found", async () => {
      await expect(exchange.cancelOrder(1)).to.be.revertedWith(
        "Order not found",
      );
    });

    it("reverts if the order creator is not the caller", async () => {
      await exchange
        .connect(creator)
        .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
      await expect(exchange.connect(filler).cancelOrder(1)).to.be.revertedWith(
        "Only allow order creator to cancel",
      );
    });
  });

  describe("Order Execution", function () {
    beforeEach(async () => {
      await exchange
        .connect(creator)
        .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    });

    it("Should execute an order", async function () {
      await exchange.connect(filler).fillOrder(1);

      const creatorTokenGetBalanceAfter = await exchange.balanceOf(
        tokenGet,
        creator.address,
      );
      const creatorTokenGiveBalanceAfter = await exchange.balanceOf(
        tokenGive,
        creator.address,
      );
      const fillerTokenGetBalanceAfter = await exchange.balanceOf(
        tokenGet,
        filler.address,
      );
      const fillerTokenGiveBalanceAfter = await exchange.balanceOf(
        tokenGive,
        filler.address,
      );

      const feeAccountTokenGetBalanceAfter = await exchange.balanceOf(
        tokenGet,
        feeAccount.address,
      );

      expect(creatorTokenGetBalanceAfter).to.equal(
        creatorTokenGetBalanceBefore + amountGet,
      );
      expect(creatorTokenGiveBalanceAfter).to.equal(
        creatorTokenGiveBalanceBefore - amountGive,
      );
      expect(fillerTokenGetBalanceAfter).to.equal(
        fillerTokenGetBalanceBefore -
          (amountGet * BigInt(100 + FEE_PERCENT)) / BigInt(100),
      );
      expect(fillerTokenGiveBalanceAfter).to.equal(
        fillerTokenGiveBalanceBefore + amountGive,
      );

      expect(feeAccountTokenGetBalanceAfter).to.equal(
        feeAccountTokenGetBalanceBefore +
          (amountGet * BigInt(FEE_PERCENT)) / BigInt(100),
      );
    });

    it("emits the Trade event", async () => {
      await expect(exchange.connect(filler).fillOrder(1))
        .to.emit(exchange, "Trade")
        .withArgs(
          1,
          creator,
          tokenGet,
          amountGet,
          tokenGive,
          amountGive,
          filler,
          anyValue,
        );
    });

    it("reverts if the amount of tokenGet is not enough", async () => {
      await exchange
        .connect(creator)
        .makeOrder(tokenGet, MAX_AMOUNT, tokenGive, amountGive);
      await expect(exchange.connect(filler).fillOrder(2)).to.be.revertedWith(
        "Insufficient balance",
      );
    });

    it("reverts if the amount of tokenGive is not enough", async () => {
      await exchange
        .connect(creator)
        .makeOrder(tokenGet, amountGet, tokenGive, MAX_AMOUNT);
      await expect(exchange.connect(filler).fillOrder(2)).to.be.revertedWith(
        "Insufficient balance",
      );
    });
  });
});
