import { expect } from "chai";
import { setup, type SetupResult } from "./setup";

describe("Token - decimals", function () {
  let setupData: SetupResult;

  beforeEach(async function () {
    setupData = await setup();
  });

  it("should return the correct token decimals", async function () {
    const { token } = setupData;
    expect(await token.decimals()).to.equal(18);
  });
});
