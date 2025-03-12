import hre from "hardhat";
import deployedAddresses from "../ignition/deployments/chain-31337/deployed_addresses.json";

/**
 * Get 10 accounts, each account does:
 *
 * Deposit 5000 eth.
 *
 * If not the owner, get 1000 tokens.
 *
 * Deposit 500 tokens.
 *
 * Make an order to buy 100 tokens, price is 0.1eth per token.
 */
async function seed() {
  console.log("🌱 Seeding the blockchain with initial data...");

  // Get contract instances
  const Token = await hre.ethers.getContractAt(
    "Token",
    deployedAddresses["TokenModule#Token"],
  );
  const Exchange = await hre.ethers.getContractAt(
    "Exchange",
    deployedAddresses["ExchangeModule#Exchange"],
  );

  // Get signers (accounts)
  const accounts = await hre.ethers.getSigners();
  const owner = accounts[0];

  // Take first 10 accounts
  const users = accounts;

  console.log("👥 Processing accounts...");

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`\n🔷 Setting up account ${i + 1}: ${user.address}`);

    // Deposit 5000 ETH to exchange
    const ethAmount = hre.ethers.parseEther("8000");
    await Exchange.connect(user).depositEther({ value: ethAmount });
    console.log(`  ✅ Deposited 8000 ETH for ${user.address}`);

    // If not the owner, get 1000 tokens
    if (user.address !== owner.address) {
      const tokenAmount = hre.ethers.parseEther("5000");
      await Token.connect(owner).transfer(user.address, tokenAmount);
      console.log(`  ✅ Transferred 5000 tokens to ${user.address}`);
    }

    // Deposit 500 tokens to exchange
    const depositAmount = hre.ethers.parseEther("4000");
    await Token.connect(user).approve(Exchange.target, depositAmount);
    await Exchange.connect(user).depositToken(Token.target, depositAmount);
    console.log(`  ✅ Deposited 4000 tokens for ${user.address}`);
  }

  console.log("\n🎉 Seeding completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Error during seeding:", error);
  process.exit(1);
});
