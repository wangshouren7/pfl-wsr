import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, type SetupResult } from "./setup";

describe("Token - approve", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should approve tokens for delegated transfer", async function () {
    const { token, owner, ownerAddress, user1Address } = setupData;
    const approvalAmount = parseEther("100");

    // Initial allowance should be 0
    expect(await token.allowance(ownerAddress, user1Address)).to.equal(0);

    // Approve tokens
    await expect(token.connect(owner).approve(user1Address, approvalAmount))
      .to.emit(token, "Approval")
      .withArgs(ownerAddress, user1Address, approvalAmount);

    // Check updated allowance
    expect(await token.allowance(ownerAddress, user1Address)).to.equal(
      approvalAmount,
    );
  });

  it("should update allowance when called again", async function () {
    const { token, owner, user1Address } = setupData;
    const initialApproval = parseEther("100");
    const updatedApproval = parseEther("200");

    // First approval
    await token.connect(owner).approve(user1Address, initialApproval);
    expect(
      await token.allowance(await owner.getAddress(), user1Address),
    ).to.equal(initialApproval);

    // Update approval
    await token.connect(owner).approve(user1Address, updatedApproval);
    expect(
      await token.allowance(await owner.getAddress(), user1Address),
    ).to.equal(updatedApproval);
  });

  it("should fail when approving the zero address", async function () {
    const { token, owner } = setupData;
    const approvalAmount = parseEther("100");
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    // Try to approve zero address
    await expect(
      token.connect(owner).approve(zeroAddress, approvalAmount),
    ).to.be.revertedWith("invalid address");
  });

  it("should return true on successful approval", async function () {
    const { token, owner, user1Address } = setupData;
    const approvalAmount = parseEther("100");

    // Check return value
    const result = await token
      .connect(owner)
      .approve(user1Address, approvalAmount);

    // Verify the transaction receipt has a status of 1 (success)
    const receipt = await result.wait();
    expect(receipt?.status).to.equal(1);
  });
});
