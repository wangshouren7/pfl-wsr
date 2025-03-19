import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, OrderStatus, type SetupResult } from "./setup";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("Exchange - makeOrder", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should create a new order", async function () {
    const { exchange, token, user1, user1Address } = setupData;
    const tokenAmount = parseEther("1");
    const etherAmount = parseEther("1");

    // Create order
    await expect(
      exchange.connect(user1).makeOrder(
        await token.getAddress(), // tokenGet
        tokenAmount, // amountGet
        ETHER_ADDRESS, // tokenGive
        etherAmount, // amountGive
      ),
    )
      .to.emit(exchange, "Order")
      .withArgs(
        1, // id
        user1Address, // user
        await token.getAddress(), // tokenGet
        tokenAmount, // amountGet
        ETHER_ADDRESS, // tokenGive
        etherAmount, // amountGive
        anyValue, // timestamp (approximate)
      );

    // Check order count
    const orderCount = await exchange.orderCount();
    expect(orderCount).to.equal(1);

    // Check order details
    const order = await exchange.orders(1);
    expect(order.id).to.equal(1);
    expect(order.user).to.equal(user1Address);
    expect(order.tokenGet).to.equal(await token.getAddress());
    expect(order.amountGet).to.equal(tokenAmount);
    expect(order.tokenGive).to.equal(ETHER_ADDRESS);
    expect(order.amountGive).to.equal(etherAmount);
    expect(order.status).to.equal(OrderStatus.PENDING);
  });

  it("should increment order count for each new order", async function () {
    const { exchange, token, user1 } = setupData;
    const tokenAmount = parseEther("1");
    const etherAmount = parseEther("1");

    // Create first order
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        tokenAmount,
        ETHER_ADDRESS,
        etherAmount,
      );

    // Check order count
    let orderCount = await exchange.orderCount();
    expect(orderCount).to.equal(1);

    // Create second order
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        tokenAmount,
        ETHER_ADDRESS,
        etherAmount,
      );

    // Check order count again
    orderCount = await exchange.orderCount();
    expect(orderCount).to.equal(2);
  });

  it("should create orders with different parameters", async function () {
    const { exchange, token, user1 } = setupData;

    // Create first order: Buy token with ether
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("1"),
        ETHER_ADDRESS,
        parseEther("0.1"),
      );

    // Create second order: Sell token for ether
    await exchange
      .connect(user1)
      .makeOrder(
        ETHER_ADDRESS,
        parseEther("0.1"),
        await token.getAddress(),
        parseEther("1"),
      );

    // Check first order details
    const order1 = await exchange.orders(1);
    expect(order1.tokenGet).to.equal(await token.getAddress());
    expect(order1.amountGet).to.equal(parseEther("1"));
    expect(order1.tokenGive).to.equal(ETHER_ADDRESS);
    expect(order1.amountGive).to.equal(parseEther("0.1"));

    // Check second order details
    const order2 = await exchange.orders(2);
    expect(order2.tokenGet).to.equal(ETHER_ADDRESS);
    expect(order2.amountGet).to.equal(parseEther("0.1"));
    expect(order2.tokenGive).to.equal(await token.getAddress());
    expect(order2.amountGive).to.equal(parseEther("1"));
  });

  it("should set initial order status to PENDING", async function () {
    const { exchange, token, user1 } = setupData;

    // Create order
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("1"),
        ETHER_ADDRESS,
        parseEther("0.1"),
      );

    // Check order status
    const orderStatus = await exchange.getOrderStatus(1);
    expect(orderStatus).to.equal(OrderStatus.PENDING);
  });
});
