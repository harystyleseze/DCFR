"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useWallet } from "../hooks/useWallet";
import { FaucetService } from "../lib/faucet";
import { BrowserProvider } from "ethers";
import { toast } from "sonner";
import { Droplet } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ethers } from "ethers";

export function FaucetButton() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [nextAccessTime, setNextAccessTime] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { address, isCorrectNetwork } = useWallet();

  const checkNextAccessTime = async () => {
    if (!address || !isCorrectNetwork || !window.ethereum) {
      setIsInitializing(false);
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const faucetService = new FaucetService();
      await faucetService.initialize(provider);

      const [nextTime, amount] = await Promise.all([
        faucetService.getNextAccessTime(address),
        faucetService.getWithdrawalAmount(),
      ]);

      setNextAccessTime(nextTime);
      setWithdrawalAmount(amount);
    } catch (error: any) {
      console.error("Error checking faucet status:", error);
      toast.error("Error", {
        description: "Failed to check faucet status. Please try again later.",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    checkNextAccessTime();
  }, [address, isCorrectNetwork]);

  const handleRequestTokens = async () => {
    if (!address || !isCorrectNetwork || !window.ethereum) return;

    try {
      setIsRequesting(true);
      const provider = new BrowserProvider(window.ethereum);
      const faucetService = new FaucetService();
      await faucetService.initialize(provider);

      await faucetService.requestTokens();
      toast.success("Tokens Requested Successfully!", {
        description: `${ethers.formatEther(
          withdrawalAmount || "0"
        )} tokens have been sent to your wallet.`,
      });

      // Update next access time
      await checkNextAccessTime();
    } catch (error: any) {
      console.error("Error requesting tokens:", error);
      toast.error("Error", {
        description:
          error.message || "Failed to request tokens. Please try again later.",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const getTimeRemaining = () => {
    if (!nextAccessTime) return "";
    const now = Math.floor(Date.now() / 1000);
    const remaining = parseInt(nextAccessTime) - now;

    if (remaining <= 0) return "";

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!address || !isCorrectNetwork) {
    return null;
  }

  if (isInitializing) {
    return (
      <Button variant="outline" size="icon" disabled className="relative">
        <Droplet className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const canRequest = !nextAccessTime || parseInt(nextAccessTime) <= now;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRequestTokens}
            disabled={!canRequest || isRequesting}
            className="relative"
          >
            <Droplet className="h-4 w-4" />
            {isRequesting && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!canRequest && nextAccessTime ? (
            <p>Next request available in {getTimeRemaining()}</p>
          ) : withdrawalAmount ? (
            <p>Request {ethers.formatEther(withdrawalAmount)} tokens</p>
          ) : (
            <p>Request tokens</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
