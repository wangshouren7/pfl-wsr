import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, ETHER_ADDRESS, type SetupResult } from "./setup";

describe("Exchange - orderCount", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should start with zero orders", async function () {
    const { exchange } = setupData;

    const orderCount = await exchange.orderCount();
    expect(orderCount).to.equal(0);
  });

  it("should increment when creating orders", async function () {
    const { exchange, token, user1 } = setupData;

    // Create first order
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("1"),
        ETHER_ADDRESS,
        parseEther("0.1"),
      );

    let orderCount = await exchange.orderCount();
    expect(orderCount).to.equal(1);

    // Create second order
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        parseEther("2"),
        ETHER_ADDRESS,
        parseEther("0.2"),
      );

    orderCount = await exchange.orderCount();
    expect(orderCount).to.equal(2);
  });

  it("should not change when cancelling orders", async function () {
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

    const orderCountBefore = await exchange.orderCount();

    // Cancel order
    await exchange.connect(user1).cancelOrder(1);

    const orderCountAfter = await exchange.orderCount();
    expect(orderCountAfter).to.equal(orderCountBefore);
  });

  it("should not change when filling orders", async function () {
    const { exchange, token, user1, user2 } = setupData;
    const tokenAmount = parseEther("1");

    // Setup for filled order
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

    await exchange.connect(user1).depositEther({ value: parseEther("0.1") });

    // Create order
    await exchange
      .connect(user1)
      .makeOrder(
        await token.getAddress(),
        tokenAmount,
        ETHER_ADDRESS,
        parseEther("0.1"),
      );

    const orderCountBefore = await exchange.orderCount();

    // Fill order
    await exchange.connect(user2).fillOrder(1);

    const orderCountAfter = await exchange.orderCount();
    expect(orderCountAfter).to.equal(orderCountBefore);
  });
});
