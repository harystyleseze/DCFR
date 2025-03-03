"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ProposalType } from "../lib/contract";
import { useWallet } from "../hooks/useWallet";
import { FileText, Loader2, Check, X, RefreshCw } from "lucide-react";
import { theme } from "../lib/theme";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { shortenAddress } from "@/lib/utils";
import { DeleteProposal as DeleteProposalComponent } from "./DeleteProposal";

interface DeleteProposal {
  id: number;
  cid: string;
  fileName: string;
  fileSize: string;
  proposer: string;
  executed: boolean;
  yesVotes: string;
  noVotes: string;
  votingEnd: string;
  votingPeriod: string;
}

const formatFileSize = (bytes: string) => {
  const size = parseInt(bytes);
  if (size === 0) return "N/A";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function DeletedFileList() {
  const [deleteProposals, setDeleteProposals] = useState<DeleteProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { address, isCorrectNetwork } = useWallet();
  const [activeTab, setActiveTab] = useState("active");
  const [fileExists, setFileExists] = useState<{[key: string]: boolean}>({});

  const fetchDeleteProposals = useCallback(async () => {
    if (!address || !isCorrectNetwork) {
      setError("Please connect your wallet and switch to the correct network");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching delete proposals...");
      setError(null);
      const response = await fetch("/api/proposals/delete/list");
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || "Failed to fetch delete proposals");
      }

      const data = await response.json();
      console.log("Received proposals data:", data);

      if (!data.proposals || !Array.isArray(data.proposals)) {
        throw new Error("Invalid response format: proposals array missing");
      }

      const proposals = data.proposals as DeleteProposal[];
      console.log("Parsed proposals:", proposals);

      setDeleteProposals(proposals);
      
      if (proposals.length === 0) {
        console.log("No proposals found");
        toast.info("No delete proposals found");
      } else {
        console.log(`Found ${proposals.length} proposals`);
        const activeCount = proposals.filter(p => !p.executed && parseInt(p.votingEnd) > Math.floor(Date.now() / 1000)).length;
        const executedCount = proposals.length - activeCount;
        console.log(`Active: ${activeCount}, Executed: ${executedCount}`);
      }
    } catch (error: any) {
      console.error("Error fetching delete proposals:", error);
      console.error("Error details:", error.stack);
      setError(error.message || "Failed to fetch delete proposals");
      toast.error("Error fetching proposals", {
        description: error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [address, isCorrectNetwork]);

  // Set up polling for updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (address && isCorrectNetwork) {
      // Initial fetch
      fetchDeleteProposals();

      // Poll every 30 seconds
      intervalId = setInterval(fetchDeleteProposals, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [address, isCorrectNetwork, fetchDeleteProposals]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDeleteProposals();
  };

  const formatTimeLeft = (votingEnd: string) => {
    const now = Math.floor(Date.now() / 1000);
    const end = parseInt(votingEnd);
    if (end <= now) return "Ended";
    
    const timeLeft = end - now;
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${hours}h ${minutes}m left`;
  };

  useEffect(() => {
    const checkFileExistence = async () => {
      const existenceMap: {[key: string]: boolean} = {};
      for (const proposal of deleteProposals) {
        try {
          const response = await fetch(`/api/files/metadata?cid=${proposal.cid}`);
          existenceMap[proposal.cid] = response.ok;
        } catch (error) {
          console.error(`Error checking file existence for ${proposal.cid}:`, error);
          existenceMap[proposal.cid] = false;
        }
      }
      setFileExists(existenceMap);
    };

    if (deleteProposals.length > 0) {
      checkFileExistence();
    }
  }, [deleteProposals]);

  if (!address || !isCorrectNetwork) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet and switch to the correct network to view delete proposals.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          style={{ color: theme.colors.primary }}
        />
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const activeProposals = deleteProposals.filter(
    (p) => !p.executed && parseInt(p.votingEnd) > now
  );
  const executedProposals = deleteProposals.filter(
    (p) => p.executed || parseInt(p.votingEnd) <= now
  );

  const renderProposalList = (proposals: DeleteProposal[]) => (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{proposal.fileName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">File Size</p>
                <p>{formatFileSize(proposal.fileSize)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Proposer</p>
                <p className="font-mono">{shortenAddress(proposal.proposer)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Yes Votes</p>
                <p>{proposal.yesVotes}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">No Votes</p>
                <p>{proposal.noVotes}</p>
              </div>
              {!proposal.executed && (
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Time Left</p>
                  <p>{formatTimeLeft(proposal.votingEnd)}</p>
                </div>
              )}
            </div>
          </div>
          <DeleteProposalComponent
            cid={proposal.cid}
            fileName={proposal.fileName}
            proposalId={proposal.id.toString()}
            isExecutable={!proposal.executed && fileExists[proposal.cid]}
            onDelete={handleRefresh}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Delete Proposals</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeProposals.length})
            </TabsTrigger>
            <TabsTrigger value="executed">
              Executed ({executedProposals.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {activeProposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No active delete proposals</p>
              </div>
            ) : (
              renderProposalList(activeProposals)
            )}
          </TabsContent>
          <TabsContent value="executed">
            {executedProposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No executed delete proposals</p>
              </div>
            ) : (
              renderProposalList(executedProposals)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
