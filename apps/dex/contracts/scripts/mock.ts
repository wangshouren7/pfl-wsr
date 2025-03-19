import hre from "hardhat";
import { type HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { formatEther, parseEther } from "ethers";
import { type Exchange, type Token } from "../typechain-types";
import { getLocalhostDeployedAddressesJSON } from "./utils";

// Constants for simulation
const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";
const MIN_INTERVAL_MS = 30 * 1000; // 30 seconds
const MAX_INTERVAL_MS = 60 * 1000; // 60 seconds
const ACTION_PROBABILITY = 0.7; // 70% chance to take action
const BUY_PROBABILITY = 0.55; // 55% chance to buy vs sell
const MIN_AMOUNT = parseEther("1"); // Minimum amount for orders
const MAX_AMOUNT = parseEther("20"); // Maximum amount for orders

// Price simulation constants
const INITIAL_PRICE = parseEther("0.1"); // Initial price (0.1 ETH per token)
const MAX_PRICE_CHANGE_PERCENT = 1; // Maximum price change in percentage
const TREND_CHANGE_PROBABILITY = 0.2; // 20% chance to change market trend
const TREND_STRENGTH = 0.7; // How strongly the trend influences price (0-1)
const VOLATILITY = 0.1; // Base volatility level (0-1)

// Strategic pricing configuration
const MAX_BUY_DISCOUNT = 5; // Max discount % below market when buying
const MIN_BUY_DISCOUNT = 1; // Min discount % below market when buying
const MAX_SELL_PREMIUM = 7; // Max premium % above market when selling
const MIN_SELL_PREMIUM = 2; // Min premium % above market when selling

// For debugging - set to true to see more details
const DEBUG_MODE = true;
// For debugging - reduce wait times (set to true for testing)
const FAST_MODE = false;

class Mocker {
  accounts: HardhatEthersSigner[] = [];
  token!: Token;
  exchange!: Exchange;
  pendingOrders: {
    id: number;
    user: string;
    isBuyOrder: boolean;
    price: bigint;
    tokenAmount: bigint;
  }[] = []; // Enhanced order tracking with price
  isSimulationRunning = false;
  fillingOrders: Set<number> = new Set(); // Track orders currently being filled

  // Price simulation variables
  currentPrice: bigint = INITIAL_PRICE;
  marketTrend: number = 0; // -1: downtrend, 0: neutral, 1: uptrend
  lastPrices: bigint[] = []; // Array to store recent prices for price averaging

  constructor() {}

  async init() {
    const deployedAddresses = await getLocalhostDeployedAddressesJSON();

    // Get contract instances
    this.token = await hre.ethers.getContractAt(
      "Token",
      deployedAddresses["TokenModule#Token"],
    );
    this.exchange = await hre.ethers.getContractAt(
      "Exchange",
      deployedAddresses["ExchangeModule#Exchange"],
    );

    // Get signers (accounts)
    const accounts = await hre.ethers.getSigners();
    this.accounts = accounts;

    // Initialize price history with current price
    this.lastPrices = Array(10).fill(this.currentPrice);

    // Set initial market trend (random)
    this.marketTrend = Math.random() > 0.5 ? 1 : -1;
    console.log(
      `\n📊 Initial market trend: ${this.marketTrend > 0 ? "UPTREND" : "DOWNTREND"}`,
    );
    console.log(
      `📈 Initial price: ${formatEther(this.currentPrice)} ETH per token`,
    );

    console.log("\n🕵️ Loading existing orders...");
    await this.loadExistingOrders();

    console.log("\n🚀 Starting market simulation...");
    this.startMarketSimulation();
  }

  // Load existing orders from the blockchain
  async loadExistingOrders(): Promise<void> {
    try {
      const orderCount = await this.exchange.orderCount();
      console.log(`Found ${orderCount} orders on the exchange`);

      // Load all orders with status OPEN (0)
      for (let i = 1; i <= orderCount; i++) {
        const order = await this.exchange.orders(i);

        // Only add pending orders (status 0)
        if (order.status === 0n) {
          const isBuyOrder = order.tokenGet !== ETHER_ADDRESS;
          const tokenAmount = isBuyOrder ? order.amountGet : order.amountGive;
          const etherAmount = isBuyOrder ? order.amountGive : order.amountGet;
          const price = (etherAmount * parseEther("1")) / tokenAmount;

          this.pendingOrders.push({
            id: i,
            user: order.user,
            isBuyOrder,
            price,
            tokenAmount,
          });

          console.log(
            `  - Order #${i}: ${isBuyOrder ? "BUY" : "SELL"} ${formatEther(tokenAmount)} tokens at ${formatEther(price)} ETH/token`,
          );
        }
      }
    } catch (error) {
      console.error(`Error loading existing orders:`, error);
    }
  }

  // Calculate random wait time between min and max interval
  waitRandomInterval(): Promise<void> {
    const waitTime = FAST_MODE
      ? Math.random() * 5000 + 2000 // 2-7 seconds in fast mode
      : Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS) + MIN_INTERVAL_MS;

    return new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Get a random BigInt between min and max (inclusive)
  getRandomBigInt(min: bigint, max: bigint): bigint {
    const range = max - min;
    const randomFactor = BigInt(Math.floor(Math.random() * 1000000));
    return min + (range * randomFactor) / 1000000n;
  }

  // Calculate next price with trends and volatility
  calculateNextPrice(): bigint {
    // Maybe change the trend
    if (Math.random() < TREND_CHANGE_PROBABILITY) {
      const oldTrend = this.marketTrend;
      // Randomly select new trend: -1, 0, or 1
      this.marketTrend = Math.floor(Math.random() * 3) - 1;

      if (oldTrend !== this.marketTrend) {
        console.log(
          `📊 Market trend changed: ${oldTrend > 0 ? "UPTREND" : oldTrend < 0 ? "DOWNTREND" : "NEUTRAL"} -> ${this.marketTrend > 0 ? "UPTREND" : this.marketTrend < 0 ? "DOWNTREND" : "NEUTRAL"}`,
        );
      }
    }

    // Calculate price movement based on trend and volatility
    // Trend component
    const trendFactor =
      this.marketTrend * (TREND_STRENGTH * MAX_PRICE_CHANGE_PERCENT);

    // Volatility component (random noise)
    const volatilityMax = VOLATILITY * MAX_PRICE_CHANGE_PERCENT;
    const volatilityFactor = Math.random() * volatilityMax * 2 - volatilityMax;

    // Combined percentage change
    const percentChange = trendFactor + volatilityFactor;

    // Apply the price change to current price
    const priceChange =
      (this.currentPrice * BigInt(Math.floor(percentChange * 100))) / 10000n;
    let newPrice = this.currentPrice + priceChange;

    // Ensure price doesn't go below minimum or above maximum
    const minPrice = parseEther("0.01"); // Minimum price: 0.01 ETH per token
    const maxPrice = parseEther("1"); // Maximum price: 1 ETH per token

    if (newPrice < minPrice) newPrice = minPrice;
    if (newPrice > maxPrice) newPrice = maxPrice;

    // Calculate and show price change percentage for display
    const priceChangePercent =
      (Number(formatEther(newPrice)) / Number(formatEther(this.currentPrice)) -
        1) *
      100;

    const priceChangeFormatted = priceChangePercent.toFixed(2);
    const priceChangeEmoji =
      priceChangePercent > 0 ? "🟢" : priceChangePercent < 0 ? "🔴" : "⚪";

    console.log(
      `${priceChangeEmoji} New price: ${formatEther(
        newPrice,
      )} ETH per token (${priceChangeFormatted}%)`,
    );

    return newPrice;
  }

  // Create a strategic buy or sell order (rational trader behavior)
  async createRationalOrder(account: HardhatEthersSigner): Promise<void> {
    // Base price from current market conditions
    const marketPrice = this.currentPrice;

    // Decide if this is a buy or sell order with trend consideration
    const trendFactor = 0.3; // How much trend influences buy/sell decision
    const trendAdjustedBuyProb =
      BUY_PROBABILITY + this.marketTrend * trendFactor;
    const isBuyOrder = Math.random() < trendAdjustedBuyProb;

    // Random token amount (between MIN_AMOUNT and MAX_AMOUNT)
    const tokenAmount = this.getRandomBigInt(MIN_AMOUNT, MAX_AMOUNT);

    // Set a strategic price as a rational trader
    let orderPrice: bigint;

    if (isBuyOrder) {
      // Buy orders: Strategically set price below market (want to buy cheap)
      const discountPercent =
        MIN_BUY_DISCOUNT +
        Math.random() * (MAX_BUY_DISCOUNT - MIN_BUY_DISCOUNT);
      const discount =
        (marketPrice * BigInt(Math.floor(discountPercent * 100))) / 10000n;
      orderPrice = marketPrice - discount;
    } else {
      // Sell orders: Strategically set price above market (want to sell high)
      const premiumPercent =
        MIN_SELL_PREMIUM +
        Math.random() * (MAX_SELL_PREMIUM - MIN_SELL_PREMIUM);
      const maxSellPrice = (marketPrice * 3n) / 2n; // 最高不超过市场价格的150%
      const premiumFactor =
        BigInt(Math.floor((100 + premiumPercent) * 100)) / 10000n;
      const calculatedPrice = (marketPrice * premiumFactor) / BigInt(1);
      orderPrice =
        calculatedPrice > maxSellPrice ? maxSellPrice : calculatedPrice;
    }

    // Ensure minimum price
    if (orderPrice < parseEther("0.01")) {
      orderPrice = parseEther("0.01");
    }

    // Calculate ETH amount based on the strategic price
    const etherAmount = (tokenAmount * orderPrice) / parseEther("1");

    try {
      if (isBuyOrder) {
        // Buy order: Getting tokens by giving ETH
        // Check if user has enough ETH in the exchange
        const ethBalance = await this.exchange.balanceOf(
          ETHER_ADDRESS,
          account.address,
        );
        if (ethBalance < etherAmount) {
          console.log(
            `  ❌ Not enough ETH balance to create buy order (${formatEther(ethBalance)} < ${formatEther(etherAmount)})`,
          );
          return;
        }

        // Create buy order
        const tx = await this.exchange.connect(account).makeOrder(
          await this.token.getAddress(), // tokenGet (tokens)
          tokenAmount, // amountGet (token amount)
          ETHER_ADDRESS, // tokenGive (ETH)
          etherAmount, // amountGive (ETH amount)
        );

        const receipt = await tx.wait();
        if (receipt?.status === 1) {
          const orderId = await this.exchange.orderCount();
          // Add to pending orders with full information
          this.pendingOrders.push({
            id: Number(orderId),
            user: account.address,
            isBuyOrder: true,
            price: orderPrice,
            tokenAmount,
          });
          console.log(
            `  🟢 Created BUY order #${orderId}: ${formatEther(tokenAmount)} tokens at ${formatEther(orderPrice)} ETH/token (Total: ${formatEther(etherAmount)} ETH)`,
          );
        }
      } else {
        // Sell order: Getting ETH by giving tokens
        // Check if user has enough tokens in the exchange
        const tokenAddress = await this.token.getAddress();
        const tokenBalance = await this.exchange.balanceOf(
          tokenAddress,
          account.address,
        );
        if (tokenBalance < tokenAmount) {
          console.log(
            `  ❌ Not enough token balance to create sell order (${formatEther(tokenBalance)} < ${formatEther(tokenAmount)})`,
          );
          return;
        }

        // Create sell order
        const tx = await this.exchange.connect(account).makeOrder(
          ETHER_ADDRESS, // tokenGet (ETH)
          etherAmount, // amountGet (ETH amount)
          await this.token.getAddress(), // tokenGive (tokens)
          tokenAmount, // amountGive (token amount)
        );

        const receipt = await tx.wait();
        if (receipt?.status === 1) {
          const orderId = await this.exchange.orderCount();
          // Add to pending orders with full information
          this.pendingOrders.push({
            id: Number(orderId),
            user: account.address,
            isBuyOrder: false,
            price: orderPrice,
            tokenAmount,
          });
          console.log(
            `  🔴 Created SELL order #${orderId}: ${formatEther(tokenAmount)} tokens at ${formatEther(orderPrice)} ETH/token (Total: ${formatEther(etherAmount)} ETH)`,
          );
        }
      }
    } catch (error) {
      console.error(`  ❌ Failed to create order:`, error);
    }
  }

  // Fill the most profitable order (rational trader behavior)
  async fillRationalOrder(account: HardhatEthersSigner): Promise<void> {
    if (this.pendingOrders.length === 0) {
      console.log(`  ℹ️ No pending orders available to fill`);
      return;
    }

    // Debug current pending orders
    if (DEBUG_MODE) {
      console.log(`  🔍 Current pending orders: ${this.pendingOrders.length}`);
      this.pendingOrders.forEach((order) => {
        console.log(
          `    - Order #${order.id} (${order.isBuyOrder ? "BUY" : "SELL"}) at ${formatEther(order.price)} ETH/token by ${order.user.substring(0, 8)}...`,
        );
      });
    }

    // Get a list of valid pending orders (exclude own orders and currently being filled)
    const validBuyOrders: typeof this.pendingOrders = [];
    const validSellOrders: typeof this.pendingOrders = [];

    for (const orderInfo of this.pendingOrders) {
      // Skip orders created by this account
      if (orderInfo.user.toLowerCase() === account.address.toLowerCase()) {
        if (DEBUG_MODE)
          console.log(`    - Skipping order #${orderInfo.id} (own order)`);
        continue;
      }

      // Skip orders currently being filled by other accounts
      if (this.fillingOrders.has(orderInfo.id)) {
        if (DEBUG_MODE)
          console.log(
            `    - Skipping order #${orderInfo.id} (being filled by another account)`,
          );
        continue;
      }

      try {
        // Double-check order status on chain (might have been filled or canceled)
        const order = await this.exchange.orders(orderInfo.id);

        // Skip if not pending (0 = PENDING in the contract)
        if (order.status !== 0n) {
          if (DEBUG_MODE)
            console.log(
              `    - Skipping order #${orderInfo.id} (not pending, status=${order.status})`,
            );
          continue;
        }

        // Check if account has enough balance to fill this order
        const canFill = await this.canFillOrder(account, order);

        if (canFill) {
          // Separate buy and sell orders for rational selection
          if (orderInfo.isBuyOrder) {
            validBuyOrders.push(orderInfo);
          } else {
            validSellOrders.push(orderInfo);
          }
        } else if (DEBUG_MODE) {
          console.log(
            `    - Skipping order #${orderInfo.id} (insufficient balance to fill)`,
          );
        }
      } catch (error) {
        console.error(`  ❌ Error checking order ${orderInfo.id}:`, error);
      }
    }

    // Rational trading strategy:
    // - When SELLING tokens, fill the BUY order with the HIGHEST price
    // - When BUYING tokens, fill the SELL order with the LOWEST price

    let orderToFill: number | null = null;

    // First decide whether we want to buy or sell (if both are available)
    // This simulates a trader deciding whether to be a buyer or seller in this moment
    const wantToBuy = Math.random() < BUY_PROBABILITY;

    if (validBuyOrders.length > 0 && validSellOrders.length > 0) {
      // Both types available, choose based on preference and profit potential
      if (wantToBuy) {
        // Want to buy tokens - find cheapest sell order
        validSellOrders.sort(
          (a, b) => Number(a.price - b.price), // Sort by ascending price
        );
        orderToFill = validSellOrders[0].id;
        console.log(
          `  🔍 Rationally filling lowest priced SELL order #${orderToFill} at ${formatEther(validSellOrders[0].price)} ETH/token`,
        );
      } else {
        // Want to sell tokens - find highest buy order
        validBuyOrders.sort(
          (a, b) => Number(b.price - a.price), // Sort by descending price
        );
        orderToFill = validBuyOrders[0].id;
        console.log(
          `  🔍 Rationally filling highest priced BUY order #${orderToFill} at ${formatEther(validBuyOrders[0].price)} ETH/token`,
        );
      }
    } else if (validBuyOrders.length > 0) {
      // Only buy orders available
      validBuyOrders.sort(
        (a, b) => Number(b.price - a.price), // Sort by descending price
      );
      orderToFill = validBuyOrders[0].id;
      console.log(
        `  🔍 Filling highest priced BUY order #${orderToFill} at ${formatEther(validBuyOrders[0].price)} ETH/token`,
      );
    } else if (validSellOrders.length > 0) {
      // Only sell orders available
      validSellOrders.sort(
        (a, b) => Number(a.price - b.price), // Sort by ascending price
      );
      orderToFill = validSellOrders[0].id;
      console.log(
        `  🔍 Filling lowest priced SELL order #${orderToFill} at ${formatEther(validSellOrders[0].price)} ETH/token`,
      );
    } else {
      console.log(`  ℹ️ No valid pending orders available to fill`);
      return;
    }

    // Mark this order as being filled
    this.fillingOrders.add(orderToFill);

    try {
      console.log(`  🔄 Attempting to fill order #${orderToFill}...`);

      // Fill the order
      const tx = await this.exchange.connect(account).fillOrder(orderToFill);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        // Get order details for logging
        const order = await this.exchange.orders(orderToFill);
        const isBuyOrder = order.tokenGet !== ETHER_ADDRESS;
        const tokenAmount = isBuyOrder ? order.amountGet : order.amountGive;
        const etherAmount = isBuyOrder ? order.amountGive : order.amountGet;
        const price = (etherAmount * parseEther("1")) / tokenAmount;

        // Update our market price to match the filled order
        this.currentPrice = price;

        // Remove the filled order from our tracking
        this.pendingOrders = this.pendingOrders.filter(
          (order) => order.id !== orderToFill,
        );

        console.log(
          `  ✅ Filled order #${orderToFill}: ${isBuyOrder ? "BUY" : "SELL"} ${formatEther(tokenAmount)} tokens at ${formatEther(price)} ETH/token`,
        );
      } else {
        console.log(`  ❌ Fill transaction failed for order #${orderToFill}`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to fill order ${orderToFill}:`, error);
    } finally {
      // Remove from filling set regardless of success or failure
      this.fillingOrders.delete(orderToFill);
    }
  }

  // Check if an account can fill a given order
  async canFillOrder(
    account: HardhatEthersSigner,
    order: any, // This would ideally be a properly typed order object
  ): Promise<boolean> {
    try {
      const isBuyOrder = order.tokenGet !== ETHER_ADDRESS;

      if (isBuyOrder) {
        // For buy orders, filler needs tokens
        const tokenAddress = order.tokenGet;
        const tokenAmount = order.amountGet;

        // Calculate fee (3% of tokenAmount)
        const feeAmount = (tokenAmount * 3n) / 100n;
        const totalTokenNeeded = tokenAmount + feeAmount;

        // Check token balance
        const tokenBalance = await this.exchange.balanceOf(
          tokenAddress,
          account.address,
        );

        if (tokenBalance < totalTokenNeeded) {
          if (DEBUG_MODE) {
            console.log(
              `    - Cannot fill buy order: insufficient token balance (${formatEther(tokenBalance)} < ${formatEther(totalTokenNeeded)} needed)`,
            );
          }
          return false;
        }
      } else {
        // For sell orders, filler needs ETH
        const etherAmount = order.amountGet;

        // Calculate fee (3% of etherAmount)
        const feeAmount = (etherAmount * 3n) / 100n;
        const totalEthNeeded = etherAmount + feeAmount;

        // Check ETH balance
        const ethBalance = await this.exchange.balanceOf(
          ETHER_ADDRESS,
          account.address,
        );

        if (ethBalance < totalEthNeeded) {
          if (DEBUG_MODE) {
            console.log(
              `    - Cannot fill sell order: insufficient ETH balance (${formatEther(ethBalance)} < ${formatEther(totalEthNeeded)} needed)`,
            );
          }
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`Error in canFillOrder:`, error);
      return false;
    }
  }

  // Simulate random market behavior for a single account
  async simulateMarketBehavior(
    account: HardhatEthersSigner,
    index: number,
  ): Promise<void> {
    while (this.isSimulationRunning) {
      console.log(
        `\n👤 Account ${index} (${account.address}) considering actions...`,
      );

      // Randomly decide whether to create an order
      if (Math.random() < ACTION_PROBABILITY) {
        await this.createRationalOrder(account);
      } else {
        console.log(`  🤔 Decided not to create an order this time`);
      }

      // Wait for 30-60 seconds
      await this.waitRandomInterval();

      // Randomly decide whether to fill an order
      if (Math.random() < ACTION_PROBABILITY) {
        await this.fillRationalOrder(account);
      } else {
        console.log(`  🤔 Decided not to fill an order this time`);
      }

      // Wait for another 30-60 seconds before the next cycle
      await this.waitRandomInterval();
    }
  }

  // Start the market simulation
  async startMarketSimulation(): Promise<void> {
    console.log("\n🚀 Starting market simulation with the last 15 accounts...");
    this.isSimulationRunning = true;

    // Start simulation for the last 15 accounts
    const simulationAccounts = this.accounts.slice(-15);

    // Create simulation promises for each account
    const simulationPromises = simulationAccounts.map((account, index) =>
      this.simulateMarketBehavior(
        account,
        this.accounts.length - 15 + index + 1,
      ),
    );

    // Run simulations concurrently
    await Promise.all(simulationPromises);
  }
}

// Entry point
async function main() {
  const mocker = new Mocker();
  await mocker.init();

  // Keep the script running
  console.log("\n📈 Market simulation is running. Press Ctrl+C to stop.");
}

main().catch((error) => {
  console.error("Error in market simulation:", error);
  process.exit(1);
});
