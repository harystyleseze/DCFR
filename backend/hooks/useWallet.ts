import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  setupAccountChangeListener,
  setupNetworkChangeListener,
  AUTONOMYS_NETWORK,
} from "../lib/wallet";

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const handleAccountChange = useCallback((newAddress: string | null) => {
    setAddress(newAddress);
  }, []);

  const handleChainChange = useCallback((newChainId: string) => {
    setChainId(newChainId);
  }, []);

  useEffect(() => {
    setupAccountChangeListener(handleAccountChange);
    setupNetworkChangeListener(handleChainChange);

    // Check if already connected
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts[0]) {
            setAddress(accounts[0]);
          }
        })
        .catch(console.error);

      window.ethereum
        .request({ method: "eth_chainId" })
        .then(setChainId)
        .catch(console.error);
    }
  }, [handleAccountChange, handleChainChange]);

  const connect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const { address: newAddress } = await connectWallet();
      setAddress(newAddress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  const isCorrectNetwork = chainId === AUTONOMYS_NETWORK.chainId;

  return {
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    isCorrectNetwork,
    chainId,
    isConnected: !!address,
  };
};
