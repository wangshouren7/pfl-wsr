import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, type SetupResult } from "./setup";

describe("Token - allowance", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return zero allowance by default", async function () {
    const { token, ownerAddress, user1Address } = setupData;
    expect(await token.allowance(ownerAddress, user1Address)).to.equal(0);
  });

  it("should return the correct allowance after approval", async function () {
    const { token, owner, user1Address } = setupData;
    const approvalAmount = parseEther("100");

    // Approve tokens
    await token.connect(owner).approve(user1Address, approvalAmount);

    // Check allowance
    expect(
      await token.allowance(await owner.getAddress(), user1Address),
    ).to.equal(approvalAmount);
  });

  it("should update allowance when approval amount changes", async function () {
    const { token, owner, user1Address } = setupData;
    const initialApproval = parseEther("100");
    const updatedApproval = parseEther("200");

    // Initial approval
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
});
