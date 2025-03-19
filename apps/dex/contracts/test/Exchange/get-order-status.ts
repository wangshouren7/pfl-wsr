import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, OrderStatus, type SetupResult } from "./setup";

describe("Exchange - getOrderStatus", function () {
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

  it("should return PENDING for a new order", async function () {
    const { exchange } = setupData;

    const status = await exchange.getOrderStatus(1);
    expect(status).to.equal(OrderStatus.PENDING);
  });

  it("should return CANCELLED for a cancelled order", async function () {
    const { exchange, user1 } = setupData;

    // Cancel the order
    await exchange.connect(user1).cancelOrder(1);

    const status = await exchange.getOrderStatus(1);
    expect(status).to.equal(OrderStatus.CANCELLED);
  });

  it("should return FILLED for a filled order", async function () {
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

    const status = await exchange.getOrderStatus(1);
    expect(status).to.equal(OrderStatus.FILLED);
  });

  it("should revert for an invalid order ID", async function () {
    const { exchange } = setupData;

    await expect(exchange.getOrderStatus(999)).to.be.revertedWith(
      "Invalid order ID",
    );
  });
});
