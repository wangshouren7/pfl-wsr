import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ContractTransactionResponse, getAddress, Signer } from "ethers";
import { Token } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const ether = (n: number) => {
  return hre.ethers.parseEther(n.toString());
};

// Same as ether
const tokens = (n: number) => ether(n);

describe("Token", function () {
  let token: Token;
  let owner: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;
  let thirdAccount: HardhatEthersSigner;
  beforeEach(async () => {
    // Contracts are deployed using the first signer/account by default
    [owner, otherAccount, thirdAccount] = await hre.ethers.getSigners();

    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();
  });

  describe("Deployment", function () {
    it("tracks the name", async () => {
      const result = await token.name();
      expect(result).to.equal("DAPP Token");
    });
    it("tracks the symbol", async () => {
      const result = await token.symbol();
      expect(result).to.equal("DAPP");
    });
    it("tracks the decimals", async () => {
      const result = await token.decimals();
      expect(result).to.equal(18);
    });
    it("tracks the total supply", async () => {
      const result = await token.totalSupply();
      expect(result.toString()).to.equal("1000000000000000000000000");
    });
    it("assigns the total supply to the deployer", async () => {
      const result = await token.balanceOf(owner.address);
      expect(result.toString()).to.equal("1000000000000000000000000");
    });
  });

  describe("sending tokens", () => {
    let amount: bigint;

    describe("success", () => {
      beforeEach(async () => {
        amount = tokens(100);
        await token.transfer(otherAccount.address, amount);
      });

      it("transfers token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(owner.address);
        expect(balanceOf.toString()).to.equal(tokens(999900).toString());
        balanceOf = await token.balanceOf(otherAccount.address);
        expect(balanceOf.toString()).to.equal(tokens(100).toString());
      });

      it("emit the Transfer event", async () => {
        await expect(token.transfer(otherAccount.address, amount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, otherAccount.address, amount);
      });
    });

    describe("failure", () => {
      it("rejects insufficient balances", async () => {
        let invalidAmount;

        let balanceOf;
        balanceOf = await token.balanceOf(owner.address);
        expect(balanceOf.toString()).to.equal(tokens(1000000).toString());
        balanceOf = await token.balanceOf(otherAccount.address);
        expect(balanceOf.toString()).to.equal(tokens(0).toString());

        invalidAmount = tokens(100000000); // 100 million - greater than total supply
        await expect(
          token.transfer(otherAccount.address, invalidAmount),
        ).to.be.revertedWithoutReason();
      });

      it("rejects transfer to zero address", async () => {
        await expect(
          token.transfer(
            "0x0000000000000000000000000000000000000000",
            tokens(100),
          ),
        ).to.be.revertedWith("invalid address");
      });
    });
  });

  describe("approval and allowance", () => {
    const amount: bigint = tokens(100);

    beforeEach(async () => {
      await token.approve(otherAccount.address, amount);
    });

    it("approves token for delegated transfer", async () => {
      const allowance = await token.allowance(
        owner.address,
        otherAccount.address,
      );
      expect(allowance.toString()).to.equal(amount.toString());
    });

    it("emits the Approval event", async () => {
      await expect(token.approve(otherAccount.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, otherAccount.address, amount);
    });

    describe("delegated token transfers", () => {
      let spender: HardhatEthersSigner;
      let to: HardhatEthersSigner;
      let from: HardhatEthersSigner;

      beforeEach(async () => {
        spender = otherAccount;
        to = thirdAccount;
        from = owner;
        await token.connect(from).approve(spender, amount + amount);
        await token
          .connect(spender)
          .transferFrom(from.address, to.address, amount);
      });

      it("emits the Transfer event", async () => {
        await expect(
          token.connect(spender).transferFrom(from.address, to.address, amount),
        )
          .to.emit(token, "Transfer")
          .withArgs(from.address, to.address, amount);
      });

      it("transfers token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(from.address);
        expect(balanceOf.toString()).to.equal(tokens(999900).toString());
        balanceOf = await token.balanceOf(to.address);
        expect(balanceOf.toString()).to.equal(tokens(100).toString());
      });

      it("resets the allowance", async () => {
        const allowance = await token.allowance(from.address, spender.address);
        expect(allowance.toString()).to.equal(amount.toString());
      });

      it("rejects transferFrom with insufficient allowance", async () => {
        await expect(
          token
            .connect(spender)
            .transferFrom(from.address, to.address, tokens(200)),
        ).to.be.revertedWith("not enough allowance");
      });

      it("rejects transferFrom with insufficient balance", async () => {
        await token.connect(from).approve(spender.address, tokens(1000000));
        await expect(
          token
            .connect(spender)
            .transferFrom(from.address, to.address, tokens(1000000)),
        ).to.be.revertedWith("not enough balance");
      });

      it("rejects approve to zero address", async () => {
        await expect(
          token
            .connect(from)
            .approve("0x0000000000000000000000000000000000000000", amount),
        ).to.be.revertedWith("invalid address");
      });
    });
  });
});
