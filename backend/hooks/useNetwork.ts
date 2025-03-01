import { useEffect, useState } from "react";
import { useWallet } from "./useWallet";
import { AUTONOMYS_NETWORK } from "../lib/wallet";

export function useNetwork() {
  const { chainId } = useWallet();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    // Check if the chainId matches Autonomys Network
    setIsCorrectNetwork(chainId === AUTONOMYS_NETWORK.chainId);
  }, [chainId]);

  return { isCorrectNetwork };
}
