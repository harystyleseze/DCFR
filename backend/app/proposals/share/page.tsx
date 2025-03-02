"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShareProposal } from "@/components/ShareProposal";
import { useWallet } from "@/hooks/useWallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ContractService } from "@/lib/contract";
import { BrowserProvider } from "ethers";
import debounce from "lodash/debounce";

export default function SharePage() {
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

  const handleCreateShareProposal = async (
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

      const proposalId = await contractService.createShareProposal(
        cid,
        fileName,
        votingPeriod
      );

      toast.success("Share proposal created!", {
        description: `Proposal ID: ${proposalId}`,
      });

      // Clear the search results after successful proposal creation
      setSearchTerm("");
      setSearchResults([]);
    } catch (error: any) {
      console.error("Error creating share proposal:", error);
      toast.error("Error", {
        description: error.message || "Failed to create share proposal",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to create share proposals.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Share Proposal</h1>
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
                  key={`${file.cid}-${file.name}`}
                  className="border dark:border-gray-700 rounded-lg p-4 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10 hover:border-primary/50 dark:hover:border-primary/50"
                >
                  <h3 className="font-medium mb-2">{file.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-mono">
                    CID: {file.cid}
                  </p>
                  <ShareProposal
                    cid={file.cid}
                    fileName={file.name}
                    onCreateProposal={handleCreateShareProposal}
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