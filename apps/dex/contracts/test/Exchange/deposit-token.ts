import { expect } from "chai";
import { parseEther } from "ethers";
import {
  setup,
  ETHER_ADDRESS,
  approveAndDeposit,
  type SetupResult,
} from "./setup";

describe("Exchange - depositToken", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should allow users to deposit tokens", async function () {
    const { exchange, token, user1, user1Address } = setupData;
    const depositAmount = parseEther("100");

    // Approve and deposit tokens
    await token
      .connect(user1)
      .approve(await exchange.getAddress(), depositAmount);

    await expect(
      exchange
        .connect(user1)
        .depositToken(await token.getAddress(), depositAmount),
    )
      .to.emit(exchange, "Deposit")
      .withArgs(
        await token.getAddress(),
        user1Address,
        depositAmount,
        depositAmount,
      );

    // Check balance after deposit
    const balance = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(balance).to.equal(depositAmount);
  });

  it("should revert when depositing zero tokens", async function () {
    const { exchange, token, user1 } = setupData;
    const depositAmount = parseEther("0");

    // Try to deposit zero tokens
    await expect(
      exchange
        .connect(user1)
        .depositToken(await token.getAddress(), depositAmount),
    ).to.be.revertedWith("Amount must be greater than 0");
  });

  it("should revert when depositing ether address as token", async function () {
    const { exchange, user1 } = setupData;
    const depositAmount = parseEther("1");

    // Try to deposit with ether address
    await expect(
      exchange.connect(user1).depositToken(ETHER_ADDRESS, depositAmount),
    ).to.be.revertedWith("Invalid token");
  });

  it("should revert when not approved", async function () {
    const { exchange, token, user1 } = setupData;
    const depositAmount = parseEther("100");

    // Try to deposit without approval
    await expect(
      exchange
        .connect(user1)
        .depositToken(await token.getAddress(), depositAmount),
    ).to.be.revertedWith("not enough allowance");
  });

  it("should update user's token balance correctly after multiple deposits", async function () {
    const { exchange, token, user1, user1Address } = setupData;
    const firstDeposit = parseEther("50");
    const secondDeposit = parseEther("50");

    // First deposit
    await approveAndDeposit(token, exchange, user1, firstDeposit);

    // Second deposit
    await approveAndDeposit(token, exchange, user1, secondDeposit);

    // Check balance after both deposits
    const balance = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(balance).to.equal(firstDeposit + secondDeposit);
  });
});
