import { expect } from "chai";
import { parseEther } from "ethers";
import {
  setup,
  ETHER_ADDRESS,
  approveAndDeposit,
  type SetupResult,
} from "./setup";

describe("Exchange - withdrawToken", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should allow users to withdraw tokens", async function () {
    const { exchange, token, user1, user1Address } = setupData;
    const depositAmount = parseEther("100");
    const withdrawAmount = parseEther("50");

    // First deposit some tokens
    await approveAndDeposit(token, exchange, user1, depositAmount);

    // Check balance before withdrawal
    const balanceBefore = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(balanceBefore).to.equal(depositAmount);

    // Withdraw tokens
    await expect(
      exchange
        .connect(user1)
        .withdrawToken(await token.getAddress(), withdrawAmount),
    )
      .to.emit(exchange, "Withdraw")
      .withArgs(
        await token.getAddress(),
        user1Address,
        withdrawAmount,
        depositAmount - withdrawAmount,
      );

    // Check balance after withdrawal
    const balanceAfter = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(balanceAfter).to.equal(depositAmount - withdrawAmount);
  });

  it("should revert when withdrawing more than balance", async function () {
    const { exchange, token, user1 } = setupData;
    const depositAmount = parseEther("100");
    const withdrawAmount = parseEther("200");

    // First deposit some tokens
    await approveAndDeposit(token, exchange, user1, depositAmount);

    // Try to withdraw more than deposited
    await expect(
      exchange
        .connect(user1)
        .withdrawToken(await token.getAddress(), withdrawAmount),
    ).to.be.revertedWith("Insufficient balance");
  });

  it("should revert when withdrawing ether address as token", async function () {
    const { exchange, user1 } = setupData;
    const withdrawAmount = parseEther("1");

    // Try to withdraw with ether address
    await expect(
      exchange.connect(user1).withdrawToken(ETHER_ADDRESS, withdrawAmount),
    ).to.be.revertedWith("Invalid token");
  });

  it("should update user's token balance correctly", async function () {
    const { exchange, token, user1, user1Address } = setupData;
    const depositAmount = parseEther("100");
    const withdrawAmount = parseEther("100");

    // First deposit some tokens
    await approveAndDeposit(token, exchange, user1, depositAmount);

    // Withdraw all tokens
    await exchange
      .connect(user1)
      .withdrawToken(await token.getAddress(), withdrawAmount);

    // Check balance after withdrawal
    const balanceAfter = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(balanceAfter).to.equal(0);
  });

  it("should transfer tokens to user's wallet", async function () {
    const { exchange, token, user1 } = setupData;
    const depositAmount = parseEther("100");
    const withdrawAmount = parseEther("100");

    // First deposit some tokens
    await approveAndDeposit(token, exchange, user1, depositAmount);

    // Get user token balance before withdrawal
    const userBalanceBefore = await token.balanceOf(await user1.getAddress());

    // Withdraw tokens
    await exchange
      .connect(user1)
      .withdrawToken(await token.getAddress(), withdrawAmount);

    // Get user token balance after withdrawal
    const userBalanceAfter = await token.balanceOf(await user1.getAddress());

    // Check that tokens were transferred to user
    expect(userBalanceAfter - userBalanceBefore).to.equal(withdrawAmount);
  });
});
