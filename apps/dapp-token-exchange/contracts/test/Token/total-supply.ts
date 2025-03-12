import { expect } from "chai";
import { setup, type SetupResult } from "./setup";

describe("Token - totalSupply", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return the correct total supply", async function () {
    const { token, initialSupply } = setupData;
    expect(await token.totalSupply()).to.equal(initialSupply);
  });

  it("should assign the total supply to the contract creator", async function () {
    const { token, ownerAddress, initialSupply } = setupData;
    expect(await token.balanceOf(ownerAddress)).to.equal(initialSupply);
  });
});
