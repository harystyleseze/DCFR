"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteProposal } from "@/components/DeleteProposal";
import { useWallet } from "@/hooks/useWallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ContractService } from "@/lib/contract";
import { BrowserProvider } from "ethers";
import debounce from "lodash/debounce";

export default function DeletePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { name: string; cid: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const { address, isConnected } = useWallet();

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/proposals/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to search files");
        }
        const { results } = await response.json();
        setSearchResults(results);
      } catch (error: any) {
        console.error("Error searching files:", error);
        toast.error("Error", {
          description: error.message || "Failed to search files",
        });
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(searchTerm);
    return () => {
      performSearch.cancel();
    };
  }, [searchTerm, performSearch]);

  const handleCreateDeleteProposal = async (
    cid: string,
    fileName: string,
    votingPeriod: number
  ) => {
    if (!address || !window.ethereum) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      const proposalId = await contractService.createDeleteProposal(
        cid,
        fileName,
        votingPeriod
      );

      toast.success("Delete proposal created!", {
        description: `Proposal ID: ${proposalId}`,
      });

      // Clear the search results after successful proposal creation
      setSearchTerm("");
      setSearchResults([]);
    } catch (error: any) {
      console.error("Error creating delete proposal:", error);
      toast.error("Error", {
        description: error.message || "Failed to create delete proposal",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to create delete proposals.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Delete Proposal</h1>
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Search File
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter file name or CID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Search Results</h2>
              {searchResults.map((file) => (
                <div
                  key={file.cid}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-medium mb-2">{file.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">CID: {file.cid}</p>
                  <DeleteProposal
                    cid={file.cid}
                    fileName={file.name}
                    onCreateProposal={handleCreateDeleteProposal}
                  />
                </div>
              ))}
            </div>
          )}

          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No files found matching your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
