import { ethers } from "ethers";
import { BrowserProvider } from "ethers";

const CHAIN_ID = 490000;
const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

export const AUTONOMYS_NETWORK = {
  chainId: CHAIN_ID_HEX,
  chainName: "Autonomys EVM",
  nativeCurrency: {
    name: "tAI3",
    symbol: "tAI3",
    decimals: 18,
  },
  rpcUrls: ["https://auto-evm-0.taurus.subspace.network/ws"],
  blockExplorerUrls: ["https://blockscout.taurus.autonomys.xyz/"],
};

// Convert hex to decimal for display and comparison
export const CHAIN_ID_DECIMAL = parseInt(CHAIN_ID_HEX, 16).toString();

export const checkAndSwitchNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  try {
    // First check if we're already on the correct network
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    if (currentChainId === CHAIN_ID_HEX) {
      return; // Already on the correct network
    }

    // Try to switch to the network first
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AUTONOMYS_NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to switch network");
  }
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  try {
    // First ensure we're on the correct network
    await checkAndSwitchNetwork();

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Get the provider and signer
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return {
      address: accounts[0],
      provider,
      signer,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to connect wallet");
  }
};

// Listen for account changes
export const setupAccountChangeListener = (
  callback: (address: string | null) => void
) => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      callback(accounts[0] || null);
    });
  }
};

// Listen for network changes
export const setupNetworkChangeListener = (
  callback: (chainId: string) => void
) => {
  if (window.ethereum) {
    window.ethereum.on("chainChanged", (chainId: string) => {
      callback(chainId);
    });
  }
};
