# **Decentralized Collaborative File Repository (DCFR)**

## **User-Focused Summary**

DCFR is a decentralized file management platform that puts control in the hands of its community through DAO governance. Every file operation - from uploads to deletions - is decided by member voting, ensuring transparent and democratic file management.

**Key Features:**
- Upload files through community-approved proposals
- Democratic file deletion process
- Controlled file sharing with granular access management
- Real-time proposal tracking and voting
- Secure, decentralized storage using AutoDrive
- Member management through DAO governance

## **Investor Pitch**

### **Problem Statement**
Traditional file storage solutions suffer from:
- Centralized control leading to single points of failure
- Lack of transparency in file management decisions
- Limited user control over data governance
- Vulnerability to censorship and unauthorized access

### **Solution**
DCFR revolutionizes file management by:
- Implementing DAO-based governance for all file operations
- Ensuring transparent decision-making through blockchain
- Providing decentralized storage with AutoDrive
- Enabling community-driven access control

### **Market Fit**
DCFR serves:
1. **DAOs & Web3 Organizations**
   - Secure document management
   - Transparent governance
   - Decentralized collaboration

2. **Privacy-Focused Enterprises**
   - Controlled file access
   - Audit trail of decisions
   - Democratic file management

3. **Decentralized Communities**
   - Collective decision-making
   - Shared resource management
   - Transparent operations

## **Development Deepdive**

### **Architecture Overview**
The system consists of two main components:

1. **Smart Contracts (Solidity)**
   - FileDAO.sol: Core governance and proposal management
   - Faucet.sol: Token distribution for testing

2. **Frontend/Backend (Next.js)**
   - React components for UI
   - API routes for contract interaction
   - AutoDrive integration for storage

### **Key Contract Interactions**

1. **Proposal Creation**
```solidity
function propose(
    ProposalType proposalType,
    string memory cid,
    string memory fileName,
    uint256 fileSize,
    uint256 votingPeriod
) public returns (uint256)
```
- Creates new proposals for file operations
- Validates member status and proposal parameters
- Emits ProposalCreated event

2. **Voting Mechanism**
```solidity
function vote(uint256 proposalId, bool support) public
```
- Handles member votes on proposals
- Updates vote counts and checks thresholds
- Prevents double voting

3. **Proposal Execution**
```solidity
function executeProposal(uint256 proposalId) public
```
- Verifies proposal passed
- Executes file operation
- Updates proposal status

### **Design Choices**

1. **Storage Architecture**
- AutoDrive for decentralized file storage
- Encrypted file storage for security

2. **Access Control**
- Role-based permissions
- DAO membership validation
- Proposal-based access management

3. **Frontend Integration**
- Server-side rendering for performance
- Real-time updates using polling
- Responsive design with Tailwind CSS

### **Technical Stack**

- **Blockchain**: Autonomys Network
- **Smart Contracts**: Solidity
- **Frontend**: Next.js 13, TypeScript
- **Storage**: AutoDrive
- **Styling**: Tailwind CSS
- **Contract Interaction**: ethers.js

## **Quick Start**

1. Clone repository:
```bash
git clone https://github.com/harystyleseze/DCFR.git
```

2. Install dependencies:
```bash
cd DCFR/backend && npm install
cd ../smart-contract && npm install
```

3. Configure environment:
```bash
# In /backend/.env
NEXT_PUBLIC_AUTO_DRIVE_API_KEY=your_key
RPC_URL=https://auto-evm-0.taurus.subspace.network/ws
```

4. Run development server:
```bash
npm run dev
```

Visit [Documentation](./Documentation.md) for detailed setup and usage instructions.

---

### **Technologies Used**:

- **Solidity**: Used to write the smart contract that manages file uploads, deletions, and sharing via DAO voting.
- **Next.js**: Framework for building the frontend user interface.
- **Ethers.js**: Library to interact with Ethereum-based smart contracts.
- **Radix UI**: A library for accessible UI components.
- **TailwindCSS**: Utility-first CSS framework for styling the app.
- **AutoDrive**: A decentralized storage solution for storing files on the blockchain.
- **Auto EVM**: A decentralized blockchain.
