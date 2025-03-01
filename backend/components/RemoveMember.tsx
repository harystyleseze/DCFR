"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWallet } from "../hooks/useWallet";
import { ContractService } from "../lib/contract";
import { BrowserProvider } from "ethers";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function RemoveMember() {
  const [memberAddress, setMemberAddress] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { address, isCorrectNetwork } = useWallet();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!address || !isCorrectNetwork || !window.ethereum) {
        setIsAdmin(false);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);
        const contractService = new ContractService();
        await contractService.initialize(provider);
        const adminStatus = await contractService.isAdmin(address);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [address, isCorrectNetwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !address ||
      !isCorrectNetwork ||
      !window.ethereum ||
      !memberAddress ||
      !isAdmin
    )
      return;

    try {
      setIsRemoving(true);
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      // Check if address is a member first
      const isMember = await contractService.isMember(memberAddress);
      if (!isMember) {
        throw new Error("This address is not a member of the DAO");
      }

      await contractService.removeMember(memberAddress);
      toast.success("Member Removed Successfully!", {
        description: `Address: ${memberAddress}`,
      });
      setMemberAddress("");
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center p-4">
        Please connect your wallet to manage members.
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center p-4 text-yellow-600">
        Please switch to Autonomys Network to manage members.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-4 text-red-600">
        Only the DAO admin can remove members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Removing a member is irreversible. The member will lose all voting
          rights and access to DAO resources.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Member Address
          </label>
          <Input
            type="text"
            placeholder="0x..."
            value={memberAddress}
            onChange={(e) => setMemberAddress(e.target.value)}
            disabled={isRemoving}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          variant="destructive"
          disabled={!memberAddress || isRemoving}
          className="w-full"
        >
          {isRemoving ? "Removing Member..." : "Remove Member"}
        </Button>
      </form>
    </div>
  );
}
