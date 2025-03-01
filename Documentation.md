# **Decentralized Collaborative File Repository (DCFR)**

## **Project Overview**

The **Decentralized Collaborative File Repository (DCFR)** is a decentralized file management system governed by a DAO (Decentralized Autonomous Organization). File-related actions like uploading, deleting, and sharing files are controlled by DAO members through proposals and voting. The system ensures that all file management actions are transparent and democratically controlled.

### **Core Features**:
- **File Uploading**: Propose file uploads and vote to approve them.
- **File Deletion**: Propose and vote for the deletion of files.
- **File Sharing**: Grant or revoke access to files based on DAO votes.
- **DAO Governance**: All actions (uploads, deletions, access) are decided by voting among DAO members.

---

## **Tech Stack**

- **Solidity**: Smart contract language used for creating the DAO and file management contract.
- **Next.js**: Frontend framework for building a fast, responsive web application.
- **Ethers.js**: JavaScript library for interacting with Ethereum blockchain and smart contracts.
- **Radix UI**: A library of accessible UI components for building high-quality user interfaces.
- **TailwindCSS**: A utility-first CSS framework used for styling the frontend.
- **AutoDrive**: A decentralized storage solution for securely storing files on the blockchain.
- **Auto EVM**: A decentralized Ethereum Virtual Machine (EVM) that powers the DCFR ecosystem.

---

## **Setup Instructions**

To run the **DCFR** project locally, follow these steps:

### **1. Clone the Repository**

Start by cloning the GitHub repository to your local machine:

```bash
git clone https://github.com/harystyleseze/DCFR.git
cd DCFR
```

### **2. Install Frontend Dependencies**

Navigate to the frontend directory and install the required dependencies using `npm`:

```bash
cd frontend
npm install
```

### **3. Run the Development Server**

Once the dependencies are installed, start the development server using the following command:

```bash
npm run dev
```

This will start the Next.js application and you can view it by opening [http://localhost:3000](http://localhost:3000) in your browser.

### **4. Interacting with the Smart Contract**

- **MetaMask**: To interact with the Ethereum blockchain (and the smart contract), you’ll need a MetaMask wallet or another Ethereum wallet connected to your browser.
- **Network Configuration**: Connect your MetaMask to a test network (e.g., Autonomys Testnet, Rinkeby, etc.) to deploy and interact with the contract.
  
The frontend uses **Ethers.js** to interact with the smart contract, allowing users to propose file uploads, vote on proposals, and manage files from the UI.

### **5. Deploying the Smart Contract**

If you want to deploy the smart contract to a testnet or the mainnet, follow these steps:

1. **Choose a Development Environment**: You can use tools like **Hardhat** or **Truffle** to deploy your contract. These tools allow you to deploy the contract to Ethereum-compatible blockchains.
2. **Deploy the Contract**: Once deployed, update the frontend with the contract address (in the appropriate configuration files).
3. **Test the Interaction**: Use the frontend to interact with the deployed contract on the blockchain.

### **6. MetaMask Setup**

1. Install **MetaMask** and set up an Ethereum wallet.
2. Connect MetaMask to the same network as the one where your contract is deployed (testnet or mainnet).
3. Fund your wallet with testnet Ether (via a faucet for testnets) to interact with the contract.

---

## **Usage Guidelines**

### **Frontend Interaction**

Once the frontend is running, users can interact with the DCFR application as follows:

1. **Log in** using a Web3 wallet (e.g., MetaMask) connected to the Ethereum blockchain.
2. **Propose Actions**:
   - **File Upload**: Members of the DAO can propose new file uploads by specifying file details (CID, file name, size).
   - **File Deletion**: Proposals can be made to delete files that are no longer needed.
   - **File Sharing**: DAO members can propose to share files with others by granting access to specified users.
3. **Voting on Proposals**:
   - **Voting Period**: Each proposal has a specified voting period during which DAO members can vote.
   - **Vote Results**: After the voting period ends, if the proposal passes with the required majority, the file action (upload, delete, share) is executed.
4. **File Management**: Users can view file metadata (CID, file name, uploader) and manage access permissions.

### **Interacting with the Smart Contract**:

The frontend connects to the **FileDAO** smart contract to handle the proposal process and voting mechanisms. The following key actions are handled by the smart contract:

- **Propose Upload**: A member proposes uploading a file.
- **Propose Delete**: A member proposes deleting a file.
- **Propose Share**: A member proposes sharing a file with another member.
- **Vote**: DAO members vote on these proposals, and the results dictate whether the action proceeds.

### **Voting Mechanics**:

- DAO members can vote with either "Yes" or "No" on a proposal.
- A proposal passes if the "Yes" votes make up at least **51%** of the total votes.
- Once a proposal passes, the relevant file action (upload, delete, or share) is executed by the contract.

---

## **Additional Information**

### **Smart Contract Details**

The core logic of the DCFR project is implemented in the **FileDAO** smart contract written in **Solidity**. This contract manages:
- **File metadata**: Information such as the CID, file name, size, uploader, and access permissions.
- **Proposals**: Allows members to propose actions on files, such as uploading, deleting, or sharing.
- **Voting**: Members vote on proposals, and actions are only executed if the majority votes in favor.

Key contract functions include:
- **addMember**: Adds new members to the DAO.
- **removeMember**: Removes members from the DAO.
- **propose**: Submits proposals to upload, delete, or share files.
- **vote**: DAO members vote on proposals.
- **executeProposal**: Executes a proposal once it has passed.

### **Frontend Architecture**

The frontend is built using **Next.js**, which allows for server-side rendering and optimized static pages. The app interacts with the Ethereum blockchain using **Ethers.js**, enabling real-time interactions with the deployed smart contract. **TailwindCSS** is used for the styling of the components, providing a modern and responsive design.

**Radix UI** is used for building accessible and interactive UI components, ensuring a smooth user experience.

---

## **Conclusion**

The **Decentralized Collaborative File Repository (DCFR)** offers a powerful decentralized solution for file management, with governance fully controlled by DAO members. The project integrates blockchain technology to ensure security, privacy, and transparency in file operations like uploading, deleting, and sharing files. The democratic nature of DAO governance makes it a scalable solution for decentralized communities and organizations that require secure file management.
