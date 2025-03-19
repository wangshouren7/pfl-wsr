import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, OrderStatus, type SetupResult } from "./setup";

describe("Exchange - getOrders", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();

    const { exchange, token, user1, user2 } = setupData;

    // Create multiple orders with different statuses
    // Order 1: PENDING
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("1"),
        ETHER_ADDRESS,
        parseEther("0.1"),
      );

    // Order 2: PENDING
    await exchange
      .connect(user2)
      .makeOrder(
        await token.getAddress(),
        parseEther("2"),
        ETHER_ADDRESS,
        parseEther("0.2"),
      );

    // Order 3: CANCELLED
    await exchange
      .connect(user1)
      .makeOrder(
        ETHER_ADDRESS,
        parseEther("0.3"),
        await token.getAddress(),
        parseEther("3"),
      );
    await exchange.connect(user1).cancelOrder(3);

    // Setup for filled order
    const tokenAmount = parseEther("4");
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

    await exchange.connect(user1).depositEther({ value: parseEther("0.4") });

    // Order 4: FILLED
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("4"),
        ETHER_ADDRESS,
        parseEther("0.4"),
      );
    await exchange.connect(user2).fillOrder(4);
  });

  it("should return all orders", async function () {
    const { exchange } = setupData;

    const allOrders = await exchange.getOrders();

    // Check that we have the correct number of orders
    expect(allOrders.length).to.equal(4);

    // Check orders by status
    const pendingOrders = allOrders.filter(
      (order) => Number(order.status) === OrderStatus.PENDING,
    );
    expect(pendingOrders.length).to.equal(2);

    // Verify the specific orders
    expect(pendingOrders[0].id).to.equal(1n);
    expect(pendingOrders[1].id).to.equal(2n);
  });

  it("should return all CANCELLED orders", async function () {
    const { exchange } = setupData;

    const allOrders = await exchange.getOrders();
    const cancelledOrders = allOrders.filter(
      (order) => Number(order.status) === OrderStatus.CANCELLED,
    );

    // Check that we have the correct number of orders with CANCELLED status
    expect(cancelledOrders.length).to.equal(1);

    // Verify the specific order
    expect(cancelledOrders[0].id).to.equal(3n);
  });

  it("should return all FILLED orders", async function () {
    const { exchange } = setupData;

    const allOrders = await exchange.getOrders();
    const filledOrders = allOrders.filter(
      (order) => Number(order.status) === OrderStatus.FILLED,
    );

    // Check that we have the correct number of orders with FILLED status
    expect(filledOrders.length).to.equal(1);

    // Verify the specific order
    expect(filledOrders[0].id).to.equal(4n);
  });

  it("should return empty array when no orders exist", async function () {
    // Reset the contract state
    const newSetup = await setup();
    const newExchange = newSetup.exchange;

    const orders = await newExchange.getOrders();

    // Check that the array is empty (orderCount is 0)
    expect(orders.length).to.equal(0);
  });

  it("should filter user orders with specific status", async function () {
    const { exchange, user1 } = setupData;

    const allOrders = await exchange.getOrders();

    const user1Address = await user1.getAddress();
    // Filter user1's PENDING orders manually
    const user1PendingOrders = allOrders.filter(
      (order) =>
        order.user === user1Address &&
        Number(order.status) === OrderStatus.PENDING,
    );

    // Check that we have the correct number of user1's PENDING orders
    expect(user1PendingOrders.length).to.equal(1);

    // Verify the specific order
    expect(user1PendingOrders[0].id).to.equal(1n);
  });
});
