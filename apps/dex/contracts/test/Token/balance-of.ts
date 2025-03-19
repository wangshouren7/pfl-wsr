import { expect } from "chai";
import { parseEther } from "ethers";
import { setup, type SetupResult } from "./setup";

describe("Token - balanceOf", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return the correct balance for the token owner", async function () {
    const { token, ownerAddress, initialSupply } = setupData;
    expect(await token.balanceOf(ownerAddress)).to.equal(initialSupply);
  });

  it("should return zero for accounts with no tokens", async function () {
    const { token, user1Address } = setupData;
    expect(await token.balanceOf(user1Address)).to.equal(0);
  });

  it("should update balance after token transfer", async function () {
    const { token, owner, ownerAddress, user1Address, initialSupply } =
      setupData;
    const transferAmount = parseEther("100");

    // Transfer tokens
    await token.connect(owner).transfer(user1Address, transferAmount);

    // Check balances
    expect(await token.balanceOf(ownerAddress)).to.equal(
      initialSupply - transferAmount,
    );
    expect(await token.balanceOf(user1Address)).to.equal(transferAmount);
  });
});
