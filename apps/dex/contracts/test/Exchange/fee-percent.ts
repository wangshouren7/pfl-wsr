import { expect } from "chai";
import { ethers } from "hardhat";
import { setup, type SetupResult } from "./setup";

describe("Exchange - feePercent", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should set fee percent correctly during deployment", async function () {
    const { exchange, feePercent } = setupData;

    // Check that fee percent is set correctly
    const contractFeePercent = await exchange.feePercent();
    expect(contractFeePercent).to.equal(feePercent);
  });

  it("should calculate fees correctly based on fee percent", async function () {
    const { exchange, token, user1, user2, feeAccountAddress, feePercent } =
      setupData;
    const tokenAmount = ethers.parseEther("100");
    const expectedFeeAmount = (tokenAmount * BigInt(feePercent)) / 100n;

    // Setup: Deposit tokens for both users
    await token
      .connect(user1)
      .approve(await exchange.getAddress(), tokenAmount);
    await exchange
      .connect(user1)
      .depositToken(await token.getAddress(), tokenAmount);

    await token
      .connect(user2)
      .approve(await exchange.getAddress(), tokenAmount * 2n);
    await exchange
      .connect(user2)
      .depositToken(await token.getAddress(), tokenAmount * 2n);

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
    expect(feeAccountBalance).to.equal(expectedFeeAmount);
  });
});
