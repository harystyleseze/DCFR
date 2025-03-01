# **Decentralized Collaborative File Repository (DCFR)**

## **Summary**

The **Decentralized Collaborative File Repository (DCFR)** is a decentralized platform designed for managing files, where file-related actions such as uploading, deleting, and sharing files are governed by a DAO (Decentralized Autonomous Organization). This DAO system empowers members to propose and vote on file actions, ensuring democratic control over how files are handled within the repository.

Core features:

- **File Uploading**: DAO members can propose file uploads, with voting taking place to decide whether the file should be added to the repository.
- **File Deletion**: Proposals can be made to delete files, which will be carried out if the majority of DAO members vote in favor.
- **File Sharing**: Proposals to grant file access to other members can be made and voted upon.
- **DAO Governance**: All actions are governed by DAO members, ensuring democratic control and transparency in decision-making.

## **Investor Pitch**

In today's world, where data privacy, censorship resistance, and secure access control are critical, centralized file storage solutions often fail to provide the necessary levels of security, transparency, and control. **DCFR** solves this by using blockchain technology and DAO governance to manage file storage and access.

### **Problem Solved**:

- **Data Privacy**: Users have control over who accesses their files, as DAO governance ensures decisions are made collectively.
- **Censorship Resistance**: The decentralized nature of the system ensures that no single entity can control or manipulate the file storage.
- **Secure Access Control**: File access is granted based on DAO decisions, ensuring that only approved members can access sensitive data.

### **Market Fit**:

- **Decentralized Communities**: For communities that need secure, private file storage with governance over access.
- **Organizations**: Teams that need to securely store documents, share them, and ensure that file management is governed democratically.
- **Individuals**: Anyone who values privacy and control over their personal data.

### **Why It Matters**:

As the world becomes more decentralized, tools that enable secure, transparent, and censorship-resistant file management will become essential. DCFR offers a novel approach to file governance and storage, ensuring security while promoting decentralization.

## **Development Deepdive**

### **Smart Contract Functions**:

The core of the DCFR project is the smart contract governing the file management. Key functions include:

1. **Upload**: DAO members can propose the upload of a new file to the decentralized repository. Proposals must be voted on, and if the majority approves, the file is added to the system.
2. **Delete**: Proposals to delete a file from the repository can be made, and if voted upon favorably, the file is removed.
3. **Share**: Access to a file can be granted to a member based on DAO decisions, allowing for controlled sharing of files among members.
4. **Proposal Voting**: Members of the DAO vote on various proposals (upload, delete, share), and the proposal passes only if it achieves a majority vote (51% or more).

### **Frontend**:

The frontend, built with **Next.js**, connects to the smart contract using **Ethers.js** to allow users to interact with the decentralized system. Members can view and vote on proposals, upload files, delete files, and manage file access from the UI. The frontend is also built with a modern, responsive UI, utilizing **TailwindCSS** for styling.

Key technologies used:

- **Ethers.js** for interacting with the Ethereum blockchain.
- **Next.js** as the framework for the frontend.
- **Radix UI** components for building interactive and accessible UI elements.
- **TailwindCSS** for styling.

### **Proposal Voting**:

The DAO governance is implemented by having members vote on proposals to take actions such as uploading, deleting, or sharing files. Votes are counted in real-time, and the outcome of the vote determines whether the proposed action is executed. The smart contract enforces the rules for majority voting and ensures that only valid proposals are executed.

## **Setup Instructions**

To run this project locally, follow the instructions below:

### **1. Clone the Repository**:

Clone the GitHub repository to your local machine.

```bash
git clone https://github.com/harystyleseze/DCFR.git
cd DCFR
```

### **2. Install Dependencies**:

Navigate to the frontend directory and install the required dependencies using npm.

```bash
cd frontend
npm install
```

### **3. Run the Development Server**:

Once dependencies are installed, you can run the development server to view the frontend locally.

```bash
npm run dev
```

This will start the Next.js development server, and you can view the app at [http://localhost:3000](http://localhost:3000).

### **4. Interact with the Smart Contract**:

- The frontend is set up to interact with the smart contract using **Ethers.js**.
- You’ll need a **MetaMask wallet** and connect to the autonomys testnet network.

### **5. Deploying the Smart Contract**:

For deployment, you will need to deploy your smart contract to a testnet. Instructions for deploying the contract can vary depending on the tools you’re using (e.g., **Hardhat**, **Truffle**). You can follow the standard instructions for deploying to your chosen testnet, and make sure to update the contract address in the frontend to point to the deployed instance.

---

### **Technologies Used**:

- **Solidity**: Used to write the smart contract that manages file uploads, deletions, and sharing via DAO voting.
- **Next.js**: Framework for building the frontend user interface.
- **Ethers.js**: Library to interact with Ethereum-based smart contracts.
- **Radix UI**: A library for accessible UI components.
- **TailwindCSS**: Utility-first CSS framework for styling the app.
- **AutoDrive**: A decentralized storage solution for storing files on the blockchain.
- **Auto EVM**: A decentralized blockchain.
