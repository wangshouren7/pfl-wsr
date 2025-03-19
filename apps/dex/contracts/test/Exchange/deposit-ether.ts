import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, type SetupResult } from "./setup";

describe("Exchange - depositEther", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should allow users to deposit ether", async function () {
    const { exchange, user1, user1Address } = setupData;
    const depositAmount = parseEther("1");

    // Deposit ether
    await expect(exchange.connect(user1).depositEther({ value: depositAmount }))
      .to.emit(exchange, "Deposit")
      .withArgs(ETHER_ADDRESS, user1Address, depositAmount, depositAmount);

    // Check balance after deposit
    const balance = await exchange.balanceOf(ETHER_ADDRESS, user1Address);
    expect(balance).to.equal(depositAmount);
  });

  it("should revert when depositing zero ether", async function () {
    const { exchange, user1 } = setupData;
    const depositAmount = parseEther("0");

    // Try to deposit zero ether
    await expect(
      exchange.connect(user1).depositEther({ value: depositAmount }),
    ).to.be.revertedWith("Amount must be greater than 0");
  });

  it("should update user's ether balance correctly after multiple deposits", async function () {
    const { exchange, user1, user1Address } = setupData;
    const firstDeposit = parseEther("1");
    const secondDeposit = parseEther("2");

    // First deposit
    await exchange.connect(user1).depositEther({ value: firstDeposit });

    // Second deposit
    await exchange.connect(user1).depositEther({ value: secondDeposit });

    // Check balance after both deposits
    const balance = await exchange.balanceOf(ETHER_ADDRESS, user1Address);
    expect(balance).to.equal(firstDeposit + secondDeposit);
  });

  it("should transfer ether from user to contract", async function () {
    const { exchange, user1 } = setupData;
    const depositAmount = parseEther("1");

    // Check ether balance change when depositing
    await expect(
      exchange.connect(user1).depositEther({ value: depositAmount }),
    ).to.changeEtherBalances(
      [user1, await exchange.getAddress()],
      [parseEther("-1"), parseEther("1")],
    );
  });
});
