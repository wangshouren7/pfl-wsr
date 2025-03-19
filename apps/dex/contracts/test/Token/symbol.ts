import { expect } from "chai";
import { setup, type SetupResult } from "./setup";

describe("Token - symbol", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return the correct token symbol", async function () {
    const { token } = setupData;
    expect(await token.symbol()).to.equal("DAPP");
  });
});
