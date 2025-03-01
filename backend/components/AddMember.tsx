"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWallet } from "../hooks/useWallet";
import { ContractService } from "../lib/contract";
import { BrowserProvider } from "ethers";
import { toast } from "sonner";

export function AddMember() {
  const [memberAddress, setMemberAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { address, isCorrectNetwork } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isCorrectNetwork || !window.ethereum || !memberAddress)
      return;

    try {
      setIsAdding(true);
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      await contractService.addMember(memberAddress);
      toast.success("Member Added Successfully!", {
        description: `Address: ${memberAddress}`,
      });
      setMemberAddress("");
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center p-4">
        Please connect your wallet to add members.
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center p-4 text-yellow-600">
        Please switch to Autonomys Network to add members.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Member Address</label>
        <Input
          type="text"
          placeholder="0x..."
          value={memberAddress}
          onChange={(e) => setMemberAddress(e.target.value)}
          disabled={isAdding}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={!memberAddress || isAdding}
        className="w-full"
      >
        {isAdding ? "Adding Member..." : "Add Member"}
      </Button>
    </form>
  );
}
