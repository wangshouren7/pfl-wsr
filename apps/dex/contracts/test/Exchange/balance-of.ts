import { expect } from "chai";
import { parseEther } from "ethers";
import {
  setup,
  ETHER_ADDRESS,
  approveAndDeposit,
  type SetupResult,
} from "./setup";

describe("Exchange - balanceOf", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return correct ether balance", async function () {
    const { exchange, user1, user1Address } = setupData;
    const depositAmount = parseEther("1");

    // Initial balance should be zero
    const initialBalance = await exchange.balanceOf(
      ETHER_ADDRESS,
      user1Address,
    );
    expect(initialBalance).to.equal(0);

    // Deposit ether
    await exchange.connect(user1).depositEther({ value: depositAmount });

    // Check balance after deposit
    const balance = await exchange.balanceOf(ETHER_ADDRESS, user1Address);
    expect(balance).to.equal(depositAmount);
  });

  it("should return correct token balance", async function () {
    const { exchange, token, user1, user1Address } = setupData;
    const depositAmount = parseEther("100");

    // Initial balance should be zero
    const initialBalance = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(initialBalance).to.equal(0);

    // Deposit tokens
    await approveAndDeposit(token, exchange, user1, depositAmount);

    // Check balance after deposit
    const balance = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(balance).to.equal(depositAmount);
  });

  it("should return zero for addresses with no balance", async function () {
    const { exchange, token, user2Address } = setupData;

    // Check balance for user with no deposits
    const etherBalance = await exchange.balanceOf(ETHER_ADDRESS, user2Address);
    const tokenBalance = await exchange.balanceOf(
      await token.getAddress(),
      user2Address,
    );

    expect(etherBalance).to.equal(0);
    expect(tokenBalance).to.equal(0);
  });

  it("should return correct balances for multiple users", async function () {
    const { exchange, token, user1, user2, user1Address, user2Address } =
      setupData;
    const user1DepositAmount = parseEther("100");
    const user2DepositAmount = parseEther("200");

    // Deposit tokens for user1
    await approveAndDeposit(token, exchange, user1, user1DepositAmount);

    // Deposit tokens for user2
    await approveAndDeposit(token, exchange, user2, user2DepositAmount);

    // Check balances
    const user1Balance = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    const user2Balance = await exchange.balanceOf(
      await token.getAddress(),
      user2Address,
    );

    expect(user1Balance).to.equal(user1DepositAmount);
    expect(user2Balance).to.equal(user2DepositAmount);
  });
});
