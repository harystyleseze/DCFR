# Decentralized Collaborative File Repository (DCFR)

A decentralized file management system with DAO governance, built on Autonomys Network.

**Developer**: Harrison Eze  
**Repository**: [https://github.com/harystyleseze/DCFR](https://github.com/harystyleseze/DCFR)

## Project Overview

DCFR is a decentralized application that enables collaborative file management through DAO governance. Users can upload files, create proposals for file operations (upload, delete, share), and participate in the governance process through voting.

## Key Features

- File upload and management with DAO governance
- Proposal creation for file operations
- Voting system for proposal approval
- Decentralized storage using AutoDrive
- Member management system
- Real-time proposal tracking
- Shared file access control

## Project Structure

The project consists of two main components:

### Backend (`/backend`)

The Next.js application that serves as the frontend and API layer.

```
backend/
├── app/                 # Next.js app directory
├── components/         # React components
├── lib/               # Core utilities and services
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

### Smart Contract (`/smart-contract`)

The Solidity smart contracts that power the DAO governance system.

```
smart-contract/
├── contracts/         # Smart contract source files
├── scripts/          # Deployment and utility scripts
└── test/             # Contract test files
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask wallet
- Autonomys Network configured in MetaMask

### Backend Setup

1. Navigate to the backend directory after deploying the smart contracts:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NEXT_PUBLIC_CHAIN_ID=your_chain_id
   NEXT_PUBLIC_AUTO_DRIVE_API_KEY=your_autodrive_api_key
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Smart Contract Setup

1. Navigate to the smart-contract directory:
   ```bash
   cd smart-contract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` similar to the `.env.example` file with:
   ```
   PRIVATE_KEY=your_private_key
   RPC_URL=https://auto-evm-0.taurus.subspace.network/ws
   ```

4. Deploy contracts and save the contract addresses in the backend `.env` file:
   ```bash
   npx hardhat run scripts/deploy.js --network autonomys
   ```

## Usage Guide

### Connecting to the Application

1. Visit the application URL
2. Connect your MetaMask wallet
3. Switch to Autonomys Network if prompted

### File Management

1. **Uploading Files**:
   - Click "Upload File" in the navigation
   - Select a file and set voting period
   - Create proposal for upload

2. **Deleting Files**:
   - Navigate to "Delete" tab
   - Select file to delete
   - Create delete proposal

3. **Sharing Files**:
   - Go to "Share" tab
   - Select file to share
   - Create share proposal

### Proposal Management

1. **Viewing Proposals**:
   - Active proposals shown on home page
   - Filter by proposal type (Upload/Delete/Share)
   - View voting status and time remaining

2. **Voting on Proposals**:
   - Click on a proposal to view details
   - Vote "Yes" or "No"
   - Wait for voting period to end

3. **Executing Proposals**:
   - Passed proposals can be executed
   - Only executable after voting period ends
   - Requires transaction confirmation

### Member Management

1. **Adding Members**:
   - Navigate to Admin page
   - Enter member's wallet address
   - Submit transaction to add member

2. **Removing Members**:
   - Access Admin page
   - Select member to remove
   - Confirm removal transaction

## Technical Details

### Smart Contracts

- **FileDAO.sol**: Main DAO contract handling proposals and voting
- **Faucet.sol**: Contract for token distribution
- Deployed on Autonomys Network

### Backend Services

- **ContractService**: Handles smart contract interactions
- **AutoDriveService**: Manages file storage and retrieval
- **API Routes**: RESTful endpoints for frontend communication

### Key Technologies

- Next.js 13 (App Router)
- Ethers.js for blockchain interaction
- AutoDrive for decentralized storage
- Tailwind CSS for styling
- TypeScript for type safety

## Security Considerations

- Proposal execution requires successful vote
- Member access control through DAO
- Secure file storage with AutoDrive
- Protected admin functions
- Rate limiting on API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues or questions, please create an issue in the GitHub repository.

