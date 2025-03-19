import { expect } from "chai";
import { parseEther } from "ethers";
import {
  setup,
  ETHER_ADDRESS,
  OrderStatus,
  approveAndDeposit,
  type SetupResult,
} from "./setup";

describe("Exchange - fillOrder", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();

    const { exchange, token, user1, user2 } = setupData;
    const tokenAmount = parseEther("1");
    const etherAmount = parseEther("0.1");

    // Deposit tokens for user1
    await approveAndDeposit(token, exchange, user1, tokenAmount);

    // Deposit ether for user1
    await exchange.connect(user1).depositEther({ value: etherAmount });

    // Deposit tokens for user2
    await approveAndDeposit(token, exchange, user2, tokenAmount * 2n);

    // Deposit ether for user2
    await exchange.connect(user2).depositEther({ value: etherAmount * 2n });

    // Create an order: user1 wants to buy tokens with ether
    await exchange.connect(user1).makeOrder(
      await token.getAddress(), // tokenGet
      tokenAmount, // amountGet
      ETHER_ADDRESS, // tokenGive
      etherAmount, // amountGive
    );
  });

  it("should fill an order successfully", async function () {
    const { exchange, token, user2, user1Address, user2Address, feePercent } =
      setupData;
    const tokenAmount = parseEther("1");
    const etherAmount = parseEther("0.1");
    const feeAmount = (tokenAmount * BigInt(feePercent)) / 100n;

    // Get balances before filling order
    const user1EtherBefore = await exchange.balanceOf(
      ETHER_ADDRESS,
      user1Address,
    );
    const user1TokenBefore = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    const user2EtherBefore = await exchange.balanceOf(
      ETHER_ADDRESS,
      user2Address,
    );
    const user2TokenBefore = await exchange.balanceOf(
      await token.getAddress(),
      user2Address,
    );

    // Fill the order
    await expect(exchange.connect(user2).fillOrder(1)).to.emit(
      exchange,
      "Trade",
    );

    // Then check the order status
    const orderStatus = await exchange.getOrderStatus(1);
    expect(orderStatus).to.equal(OrderStatus.FILLED);

    // Check balances after filling order
    // User1 should receive tokens and lose ether
    const user1EtherAfter = await exchange.balanceOf(
      ETHER_ADDRESS,
      user1Address,
    );
    const user1TokenAfter = await exchange.balanceOf(
      await token.getAddress(),
      user1Address,
    );
    expect(user1EtherAfter).to.equal(user1EtherBefore - etherAmount);
    expect(user1TokenAfter).to.equal(user1TokenBefore + tokenAmount);

    // User2 should receive ether and lose tokens plus fee
    const user2EtherAfter = await exchange.balanceOf(
      ETHER_ADDRESS,
      user2Address,
    );
    const user2TokenAfter = await exchange.balanceOf(
      await token.getAddress(),
      user2Address,
    );
    expect(user2EtherAfter).to.equal(user2EtherBefore + etherAmount);
    expect(user2TokenAfter).to.equal(
      user2TokenBefore - tokenAmount - feeAmount,
    );
  });

  it("should revert when filling an invalid order ID", async function () {
    const { exchange, user2 } = setupData;

    // Try to fill non-existent order
    await expect(exchange.connect(user2).fillOrder(999)).to.be.revertedWith(
      "Invalid order ID",
    );
  });

  it("should revert when filling an already filled order", async function () {
    const { exchange, user2 } = setupData;

    // Fill the order
    await exchange.connect(user2).fillOrder(1);

    // Try to fill again
    await expect(exchange.connect(user2).fillOrder(1)).to.be.revertedWith(
      "Order not available",
    );
  });

  it("should revert when filling a cancelled order", async function () {
    const { exchange, user1, user2 } = setupData;

    // Cancel the order
    await exchange.connect(user1).cancelOrder(1);

    // Try to fill cancelled order
    await expect(exchange.connect(user2).fillOrder(1)).to.be.revertedWith(
      "Order not available",
    );
  });

  it("should revert when user has insufficient balance", async function () {
    const { exchange, token, user1, user2 } = setupData;
    const largeAmount = parseEther("1000");

    // Create a new order with large amounts
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        largeAmount,
        ETHER_ADDRESS,
        largeAmount,
      );

    // Try to fill order with insufficient balance
    await expect(exchange.connect(user2).fillOrder(2)).to.be.revertedWith(
      "Insufficient balance",
    );
  });

  it("should charge the correct fee amount", async function () {
    const { exchange, token, user2, feeAccountAddress, feePercent } = setupData;
    const tokenAmount = parseEther("1");
    const feeAmount = (tokenAmount * BigInt(feePercent)) / 100n;

    // Check fee account balance before
    const feeBalanceBefore = await exchange.balanceOf(
      await token.getAddress(),
      feeAccountAddress,
    );

    // Fill the order
    await exchange.connect(user2).fillOrder(1);

    // Check fee account balance after
    const feeBalanceAfter = await exchange.balanceOf(
      await token.getAddress(),
      feeAccountAddress,
    );

    // Verify fee was charged correctly
    expect(feeBalanceAfter - feeBalanceBefore).to.equal(feeAmount);
  });
});
