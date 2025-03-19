import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, type SetupResult } from "./setup";

describe("Exchange - withdrawEther", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should allow users to withdraw ether", async function () {
    const { exchange, user1, user1Address } = setupData;
    const depositAmount = parseEther("1");
    const withdrawAmount = parseEther("0.5");

    // First deposit some ether
    await exchange.connect(user1).depositEther({ value: depositAmount });

    // Check balance before withdrawal
    const balanceBefore = await exchange.balanceOf(ETHER_ADDRESS, user1Address);
    expect(balanceBefore).to.equal(depositAmount);

    // Withdraw ether
    await expect(exchange.connect(user1).withdrawEther(withdrawAmount))
      .to.emit(exchange, "Withdraw")
      .withArgs(
        ETHER_ADDRESS,
        user1Address,
        withdrawAmount,
        depositAmount - withdrawAmount,
      );

    // Check balance after withdrawal
    const balanceAfter = await exchange.balanceOf(ETHER_ADDRESS, user1Address);
    expect(balanceAfter).to.equal(depositAmount - withdrawAmount);
  });

  it("should revert when withdrawing more than balance", async function () {
    const { exchange, user1 } = setupData;
    const depositAmount = parseEther("1");
    const withdrawAmount = parseEther("2");

    // First deposit some ether
    await exchange.connect(user1).depositEther({ value: depositAmount });

    // Try to withdraw more than deposited
    await expect(
      exchange.connect(user1).withdrawEther(withdrawAmount),
    ).to.be.revertedWith("Insufficient balance");
  });

  it("should update user's ether balance correctly", async function () {
    const { exchange, user1, user1Address } = setupData;
    const depositAmount = parseEther("1");
    const withdrawAmount = parseEther("1");

    // First deposit some ether
    await exchange.connect(user1).depositEther({ value: depositAmount });

    // Withdraw all ether
    await exchange.connect(user1).withdrawEther(withdrawAmount);

    // Check balance after withdrawal
    const balanceAfter = await exchange.balanceOf(ETHER_ADDRESS, user1Address);
    expect(balanceAfter).to.equal(0);
  });

  it("should transfer ether to user's wallet", async function () {
    const { exchange, user1 } = setupData;
    const depositAmount = parseEther("1");
    const withdrawAmount = parseEther("1");

    // First deposit some ether
    await exchange.connect(user1).depositEther({ value: depositAmount });

    // Get the exchange address (resolve the promise)
    const exchangeAddress = await exchange.getAddress();

    // Check ether balance change when withdrawing
    await expect(
      exchange.connect(user1).withdrawEther(withdrawAmount),
    ).to.changeEtherBalances(
      [exchangeAddress, user1],
      [parseEther("-1"), parseEther("1")],
    );
  });
});
