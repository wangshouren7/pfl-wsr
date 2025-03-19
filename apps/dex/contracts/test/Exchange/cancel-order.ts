import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, OrderStatus, type SetupResult } from "./setup";

describe("Exchange - cancelOrder", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();

    // Create an order for testing
    const { exchange, token, user1 } = setupData;
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("1"),
        ETHER_ADDRESS,
        parseEther("0.1"),
      );
  });

  it("should allow user to cancel their own order", async function () {
    const { exchange, user1, user1Address } = setupData;

    // Get order details before cancellation
    const order = await exchange.orders(1);

    // Cancel order
    await expect(exchange.connect(user1).cancelOrder(1))
      .to.emit(exchange, "Cancel")
      .withArgs(
        order.id,
        user1Address,
        order.tokenGet,
        order.amountGet,
        order.tokenGive,
        order.amountGive,
        order.timestamp,
      );

    // Check order status after cancellation
    const orderStatus = await exchange.getOrderStatus(1);
    expect(orderStatus).to.equal(OrderStatus.CANCELLED);
  });

  it("should revert when cancelling non-existent order", async function () {
    const { exchange, user1 } = setupData;

    // Try to cancel non-existent order
    await expect(exchange.connect(user1).cancelOrder(999)).to.be.revertedWith(
      "Order not found",
    );
  });

  it("should revert when user tries to cancel someone else's order", async function () {
    const { exchange, user2 } = setupData;

    // User2 tries to cancel User1's order
    await expect(exchange.connect(user2).cancelOrder(1)).to.be.revertedWith(
      "Only allow order creator to cancel",
    );
  });

  it("should revert when trying to cancel an already filled order", async function () {
    const { exchange, token, user1, user2 } = setupData;
    const tokenAmount = parseEther("1");

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

    // Deposit ether for user1
    await exchange.connect(user1).depositEther({ value: parseEther("0.1") });

    // Fill the order
    await exchange.connect(user2).fillOrder(1);

    // Try to cancel filled order
    await expect(exchange.connect(user1).cancelOrder(1)).to.be.revertedWith(
      "Order cannot be cancelled",
    );
  });

  it("should revert when trying to cancel an already cancelled order", async function () {
    const { exchange, user1 } = setupData;

    // Cancel order
    await exchange.connect(user1).cancelOrder(1);

    // Try to cancel again
    await expect(exchange.connect(user1).cancelOrder(1)).to.be.revertedWith(
      "Order cannot be cancelled",
    );
  });
});
