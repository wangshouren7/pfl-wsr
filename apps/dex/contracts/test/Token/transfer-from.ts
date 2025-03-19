import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, type SetupResult } from "./setup";

describe("Token - transferFrom", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should allow approved spender to transfer tokens", async function () {
    const { token, owner, user1, ownerAddress, user1Address, user2Address } =
      setupData;
    const approvalAmount = parseEther("100");
    const transferAmount = parseEther("50");

    // Owner approves user1 to spend tokens
    await token.connect(owner).approve(user1Address, approvalAmount);

    // Initial balances
    const initialOwnerBalance = await token.balanceOf(ownerAddress);
    const initialUser2Balance = await token.balanceOf(user2Address);

    // User1 transfers tokens from owner to user2
    await expect(
      token
        .connect(user1)
        .transferFrom(ownerAddress, user2Address, transferAmount),
    )
      .to.emit(token, "Transfer")
      .withArgs(ownerAddress, user2Address, transferAmount);

    // Check balances after transfer
    expect(await token.balanceOf(ownerAddress)).to.equal(
      initialOwnerBalance - transferAmount,
    );
    expect(await token.balanceOf(user2Address)).to.equal(
      initialUser2Balance + transferAmount,
    );

    // Check allowance is reduced
    expect(await token.allowance(ownerAddress, user1Address)).to.equal(
      approvalAmount - transferAmount,
    );
  });

  it("should fail when trying to transfer more than allowed", async function () {
    const { token, owner, user1, ownerAddress, user1Address, user2Address } =
      setupData;
    const approvalAmount = parseEther("50");
    const transferAmount = parseEther("100");

    // Owner approves user1 to spend tokens
    await token.connect(owner).approve(user1Address, approvalAmount);

    // User1 tries to transfer more than approved
    await expect(
      token
        .connect(user1)
        .transferFrom(ownerAddress, user2Address, transferAmount),
    ).to.be.revertedWith("not enough allowance");
  });

  it("should fail when trying to transfer more than balance", async function () {
    const {
      token,
      owner,
      user1,
      ownerAddress,
      user1Address,
      user2Address,
      initialSupply,
    } = setupData;
    const approvalAmount = initialSupply + parseEther("1000"); // More than total supply
    const transferAmount = initialSupply + parseEther("100"); // More than owner has

    // Owner approves user1 to spend a very large amount
    await token.connect(owner).approve(user1Address, approvalAmount);

    // User1 tries to transfer more than owner's balance
    await expect(
      token
        .connect(user1)
        .transferFrom(ownerAddress, user2Address, transferAmount),
    ).to.be.revertedWith("not enough balance");
  });

  it("should fail when transferring to the zero address", async function () {
    const { token, owner, user1, ownerAddress, user1Address } = setupData;
    const approvalAmount = parseEther("100");
    const transferAmount = parseEther("50");
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    // Owner approves user1 to spend tokens
    await token.connect(owner).approve(user1Address, approvalAmount);

    // User1 tries to transfer to zero address
    await expect(
      token
        .connect(user1)
        .transferFrom(ownerAddress, zeroAddress, transferAmount),
    ).to.be.revertedWith("invalid address");
  });

  it("should return true on successful transferFrom", async function () {
    const { token, owner, user1, ownerAddress, user1Address, user2Address } =
      setupData;
    const approvalAmount = parseEther("100");
    const transferAmount = parseEther("50");

    // Owner approves user1 to spend tokens
    await token.connect(owner).approve(user1Address, approvalAmount);

    // Check return value
    const result = await token
      .connect(user1)
      .transferFrom(ownerAddress, user2Address, transferAmount);

    // Verify the transaction receipt has a status of 1 (success)
    const receipt = await result.wait();
    expect(receipt?.status).to.equal(1);
  });
});
