const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("FileDAO", function () {
  let FileDAO;
  let fileDAO;
  let owner;
  let addr1;
  let addr2;
  const MIN_VOTING_PERIOD = 5; // seconds
  const TEST_VOTING_PERIOD = 10; // seconds

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    FileDAO = await ethers.getContractFactory("FileDAO");
    fileDAO = await FileDAO.deploy();
    await fileDAO.waitForDeployment();
  });

  describe("Membership", function () {
    it("Should set deployer as admin and member", async function () {
      expect(await fileDAO.admin()).to.equal(owner.address);
      expect(await fileDAO.members(owner.address)).to.be.true;
      expect(await fileDAO.memberCount()).to.equal(1);
    });

    it("Should allow admin to add members", async function () {
      await fileDAO.addMember(addr1.address);
      expect(await fileDAO.members(addr1.address)).to.be.true;
      expect(await fileDAO.memberCount()).to.equal(2);
    });

    it("Should allow admin to remove members", async function () {
      await fileDAO.addMember(addr1.address);
      await fileDAO.removeMember(addr1.address);
      expect(await fileDAO.members(addr1.address)).to.be.false;
      expect(await fileDAO.memberCount()).to.equal(1);
    });

    it("Should not allow non-admin to add members", async function () {
      await expect(
        fileDAO.connect(addr1).addMember(addr2.address)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      await fileDAO.addMember(addr1.address);
    });

    it("Should allow members to create proposals", async function () {
      const tx = await fileDAO.propose(
        0,
        "QmTest",
        "test.txt",
        1024,
        TEST_VOTING_PERIOD
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment.name === "FileProposed"
      );
      expect(event).to.not.be.undefined;
    });

    it("Should not allow non-members to create proposals", async function () {
      await expect(
        fileDAO
          .connect(addr2)
          .propose(0, "QmTest", "test.txt", 1024, TEST_VOTING_PERIOD)
      ).to.be.revertedWith("Only members can call this function");
    });

    it("Should enforce voting period limits", async function () {
      await expect(
        fileDAO.propose(0, "QmTest", "test.txt", 1024, 1) // Too short
      ).to.be.revertedWith("Invalid voting period");

      await expect(
        fileDAO.propose(0, "QmTest", "test.txt", 1024, 31 * 24 * 60 * 60) // Too long
      ).to.be.revertedWith("Invalid voting period");
    });
  });

  describe("Voting and Execution", function () {
    let proposalId;

    beforeEach(async function () {
      await fileDAO.addMember(addr1.address);
      await fileDAO.addMember(addr2.address);

      const tx = await fileDAO.propose(
        0,
        "QmTest",
        "test.txt",
        1024,
        TEST_VOTING_PERIOD
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment.name === "FileProposed"
      );
      proposalId = event.args[0];
    });

    it("Should allow members to vote", async function () {
      await fileDAO.vote(proposalId, true);
      await fileDAO.connect(addr1).vote(proposalId, true);

      const proposal = await fileDAO.proposals(proposalId);
      expect(proposal.yesVotes).to.equal(2);
    });

    it("Should not allow double voting", async function () {
      await fileDAO.vote(proposalId, true);
      await expect(fileDAO.vote(proposalId, true)).to.be.revertedWith(
        "Already voted"
      );
    });

    it("Should execute proposal after successful vote", async function () {
      await fileDAO.vote(proposalId, true);
      await fileDAO.connect(addr1).vote(proposalId, true);

      // Wait for voting period to end
      await time.increase(TEST_VOTING_PERIOD);

      await fileDAO.executeProposal(proposalId);
      const proposal = await fileDAO.proposals(proposalId);
      expect(proposal.executed).to.be.true;
    });

    it("Should not execute failed proposals", async function () {
      await fileDAO.vote(proposalId, false);
      await fileDAO.connect(addr1).vote(proposalId, false);

      await time.increase(TEST_VOTING_PERIOD);

      await expect(fileDAO.executeProposal(proposalId)).to.be.revertedWith(
        "Proposal did not pass"
      );
    });
  });

  describe("File Operations", function () {
    beforeEach(async function () {
      await fileDAO.addMember(addr1.address);
      await fileDAO.addMember(addr2.address);
    });

    it("Should handle file upload proposals", async function () {
      const tx = await fileDAO.propose(
        0,
        "QmTest",
        "test.txt",
        1024,
        TEST_VOTING_PERIOD
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment.name === "FileProposed"
      );
      const proposalId = event.args[0];

      await fileDAO.vote(proposalId, true);
      await fileDAO.connect(addr1).vote(proposalId, true);

      await time.increase(TEST_VOTING_PERIOD);
      await fileDAO.executeProposal(proposalId);

      expect(await fileDAO.hasAccess("QmTest", owner.address)).to.be.true;
    });

    it("Should handle file deletion proposals", async function () {
      // First upload a file
      let tx = await fileDAO.propose(
        0,
        "QmTest",
        "test.txt",
        1024,
        TEST_VOTING_PERIOD
      );
      let receipt = await tx.wait();
      let event = receipt.logs.find(
        (log) => log.fragment.name === "FileProposed"
      );
      let uploadProposalId = event.args[0];

      await fileDAO.vote(uploadProposalId, true);
      await fileDAO.connect(addr1).vote(uploadProposalId, true);
      await time.increase(TEST_VOTING_PERIOD);
      await fileDAO.executeProposal(uploadProposalId);

      // Then delete the file
      tx = await fileDAO.propose(
        1,
        "QmTest",
        "test.txt",
        0,
        TEST_VOTING_PERIOD
      );
      receipt = await tx.wait();
      event = receipt.logs.find((log) => log.fragment.name === "FileProposed");
      const deleteProposalId = event.args[0];

      await fileDAO.vote(deleteProposalId, true);
      await fileDAO.connect(addr1).vote(deleteProposalId, true);
      await time.increase(TEST_VOTING_PERIOD);
      await fileDAO.executeProposal(deleteProposalId);

      expect(await fileDAO.hasAccess("QmTest", owner.address)).to.be.false;
    });
  });
});
