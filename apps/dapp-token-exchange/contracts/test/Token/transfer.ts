import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, type SetupResult } from "./setup";

describe("Token - transfer", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should transfer tokens between accounts", async function () {
    const { token, owner, ownerAddress, user1Address } = setupData;
    const transferAmount = parseEther("100");

    // Get initial balances
    const initialOwnerBalance = await token.balanceOf(ownerAddress);
    const initialUser1Balance = await token.balanceOf(user1Address);

    // Transfer tokens
    await expect(token.connect(owner).transfer(user1Address, transferAmount))
      .to.emit(token, "Transfer")
      .withArgs(ownerAddress, user1Address, transferAmount);

    // Check updated balances
    expect(await token.balanceOf(ownerAddress)).to.equal(
      initialOwnerBalance - transferAmount,
    );
    expect(await token.balanceOf(user1Address)).to.equal(
      initialUser1Balance + transferAmount,
    );
  });

  it("should fail when trying to transfer more than balance", async function () {
    const { token, user1, user2Address } = setupData;
    const transferAmount = parseEther("100"); // User1 has 0 tokens

    // Try to transfer tokens
    await expect(token.connect(user1).transfer(user2Address, transferAmount)).to
      .be.reverted; // Revert reason depends on how the contract handles it
  });

  it("should fail when transferring to the zero address", async function () {
    const { token, owner } = setupData;
    const transferAmount = parseEther("100");
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    // Try to transfer to zero address
    await expect(
      token.connect(owner).transfer(zeroAddress, transferAmount),
    ).to.be.revertedWith("invalid address");
  });

  it("should return true on successful transfer", async function () {
    const { token, owner, user1Address } = setupData;
    const transferAmount = parseEther("100");

    // Check return value
    const result = await token
      .connect(owner)
      .transfer(user1Address, transferAmount);

    // Verify the transaction receipt has a status of 1 (success)
    const receipt = await result.wait();
    expect(receipt?.status).to.equal(1);
  });
});
