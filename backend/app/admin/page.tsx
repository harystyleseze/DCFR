"use client";

import React, { useState, useEffect } from "react";
import { AddMember } from "../../components/AddMember";
import { RemoveMember } from "../../components/RemoveMember";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { ContractService } from "../../lib/contract";
import { BrowserProvider } from "ethers";

export default function AdminPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">DAO Admin</h1>
      <div className="max-w-xl mx-auto">
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="remove" className="flex items-center gap-2">
                <UserMinus className="h-4 w-4" />
                Remove Member
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="add">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <AddMember />
            </div>
          </TabsContent>
          {isAdmin && (
            <TabsContent value="remove">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <RemoveMember />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
