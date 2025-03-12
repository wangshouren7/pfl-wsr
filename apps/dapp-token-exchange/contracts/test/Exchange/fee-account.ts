import { expect } from "chai";
import { ethers } from "hardhat";
import { approveAndDeposit, setup, type SetupResult } from "./setup";

describe("Exchange - feeAccount", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should set fee account correctly during deployment", async function () {
    const { exchange, feeAccountAddress } = setupData;

    // Check that fee account is set correctly
    const feeAccount = await exchange.feeAccount();
    expect(feeAccount).to.equal(feeAccountAddress);
  });

  it("should allow fee account to receive fees", async function () {
    const { exchange, token, user1, user2, feeAccountAddress } = setupData;
    const tokenAmount = ethers.parseEther("100");
    const feePercent = await exchange.feePercent();
    const feeAmount = (tokenAmount * BigInt(feePercent)) / 100n;

    // Setup: Deposit tokens for both users
    // User1 needs tokens to create the order
    await approveAndDeposit(token, exchange, user1, tokenAmount);

    // User2 needs tokens to fill the order (including fee)
    await approveAndDeposit(token, exchange, user2, tokenAmount + feeAmount);

    // User1 creates an order
    await exchange.connect(user1).makeOrder(
      await token.getAddress(), // tokenGet
      tokenAmount, // amountGet
      await token.getAddress(), // tokenGive
      tokenAmount, // amountGive
    );

    // User2 fills the order
    await exchange.connect(user2).fillOrder(1);

    // Check fee account balance
    const feeAccountBalance = await exchange.balanceOf(
      await token.getAddress(),
      feeAccountAddress,
    );
    expect(feeAccountBalance).to.equal(feeAmount);
  });
});
