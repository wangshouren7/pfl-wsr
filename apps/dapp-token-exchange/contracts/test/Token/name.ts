import { expect } from "chai";
import { setup, type SetupResult } from "./setup";

describe("Token - name", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return the correct token name", async function () {
    const { token } = setupData;
    expect(await token.name()).to.equal("DAPP Token");
  });
});
