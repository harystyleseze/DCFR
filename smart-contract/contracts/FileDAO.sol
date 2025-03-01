// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// FileMetadata struct to store file information
struct FileMetadata {
    string cid;
    string fileName;
    uint256 fileSize;
    address uploader;
    bool exists;
    mapping(address => bool) hasAccess;
}

contract FileDAO {
    enum ProposalType { UPLOAD, DELETE, SHARE }
    enum Vote { NONE, YES, NO }
    
    struct Proposal {
        ProposalType proposalType;
        string cid;
        string fileName;
        uint256 fileSize;
        address proposer;
        bool executed;
        uint256 yesVotes;
        uint256 noVotes;
        mapping(address => Vote) votes;
        uint256 votingEnd;
        uint256 votingPeriod;
    }

    address public admin;
    mapping(address => bool) public members;
    uint256 public memberCount;
    uint256 public constant MIN_VOTING_PERIOD = 5 seconds;
    uint256 public constant MAX_VOTING_PERIOD = 30 days;
    uint256 public constant REQUIRED_MAJORITY_PERCENTAGE = 51;

    mapping(uint256 => Proposal) public proposals;
    mapping(string => FileMetadata) public files;
    uint256 public proposalCount;
    
    event MemberAdded(address member);
    event MemberRemoved(address member);
    event FileProposed(uint256 proposalId, ProposalType proposalType, string cid, string fileName);
    event VoteCast(uint256 proposalId, address voter, bool support);
    event FileUploaded(string cid, string fileName, address uploader);
    event FileDeleted(string cid);
    event FileAccessGranted(string cid, address user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender], "Only members can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
        members[msg.sender] = true;
        memberCount = 1;
    }

    function addMember(address _member) external onlyAdmin {
        require(!members[_member], "Already a member");
        members[_member] = true;
        memberCount++;
        emit MemberAdded(_member);
    }

    function removeMember(address _member) external onlyAdmin {
        require(members[_member], "Not a member");
        require(_member != admin, "Cannot remove admin");
        members[_member] = false;
        memberCount--;
        emit MemberRemoved(_member);
    }

    function propose(
        ProposalType proposalType,
        string memory cid,
        string memory fileName,
        uint256 fileSize,
        uint256 votingPeriod
    ) public onlyMember returns (uint256) {
        require(votingPeriod >= MIN_VOTING_PERIOD && votingPeriod <= MAX_VOTING_PERIOD, "Invalid voting period");
        
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.proposalType = proposalType;
        newProposal.cid = cid;
        newProposal.fileName = fileName;
        newProposal.fileSize = fileSize;
        newProposal.proposer = msg.sender;
        newProposal.executed = false;
        newProposal.votingPeriod = votingPeriod;
        newProposal.votingEnd = block.timestamp + votingPeriod;

        emit FileProposed(proposalCount, proposalType, cid, fileName);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) public onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.votingEnd, "Voting period ended");
        require(proposal.votes[msg.sender] == Vote.NONE, "Already voted");
        require(!proposal.executed, "Proposal already executed");

        if (support) {
            proposal.yesVotes++;
            proposal.votes[msg.sender] = Vote.YES;
        } else {
            proposal.noVotes++;
            proposal.votes[msg.sender] = Vote.NO;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) public onlyMember {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.votingEnd, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        require(isProposalPassed(proposalId), "Proposal did not pass");

        if (proposal.proposalType == ProposalType.UPLOAD) {
            _handleUpload(proposal);
        } else if (proposal.proposalType == ProposalType.DELETE) {
            _handleDelete(proposal);
        } else if (proposal.proposalType == ProposalType.SHARE) {
            _handleShare(proposal);
        }

        proposal.executed = true;
    }

    function isProposalPassed(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.yesVotes + proposal.noVotes == 0) return false;
        
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
        return (proposal.yesVotes * 100) / totalVotes >= REQUIRED_MAJORITY_PERCENTAGE;
    }

    function getProposalVotingTimeLeft(uint256 proposalId) public view returns (uint256) {
        Proposal storage proposal = proposals[proposalId];
        if (block.timestamp >= proposal.votingEnd) return 0;
        return proposal.votingEnd - block.timestamp;
    }

    function _handleUpload(Proposal storage proposal) private {
        FileMetadata storage newFile = files[proposal.cid];
        newFile.cid = proposal.cid;
        newFile.fileName = proposal.fileName;
        newFile.fileSize = proposal.fileSize;
        newFile.uploader = proposal.proposer;
        newFile.exists = true;
        newFile.hasAccess[proposal.proposer] = true;

        emit FileUploaded(proposal.cid, proposal.fileName, proposal.proposer);
    }

    function _handleDelete(Proposal storage proposal) private {
        require(files[proposal.cid].exists, "File does not exist");
        delete files[proposal.cid];
        emit FileDeleted(proposal.cid);
    }

    function _handleShare(Proposal storage proposal) private {
        require(files[proposal.cid].exists, "File does not exist");
        files[proposal.cid].hasAccess[proposal.proposer] = true;
        emit FileAccessGranted(proposal.cid, proposal.proposer);
    }

    function hasAccess(string memory cid, address user) public view returns (bool) {
        return files[cid].hasAccess[user];
    }
} 