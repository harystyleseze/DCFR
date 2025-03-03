"use client";

import React, { useEffect, useState } from "react";
import { ContractService, ProposalType } from "../lib/contract";
import { useWallet } from "../hooks/useWallet";
import { BrowserProvider } from "ethers";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  History,
  Upload,
  Trash2,
  Share2,
  File,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { theme } from "../lib/theme";
import { Alert, AlertDescription } from "./ui/alert";
import { DeleteProposal } from "./DeleteProposal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface Proposal {
  id: number;
  proposalType: ProposalType;
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

export interface ProposalListProps {
  proposals: Proposal[];
  type: 'delete' | 'share' | 'upload';
  status: 'active' | 'executed';
}

export function ProposalList({ proposals, type, status }: ProposalListProps) {
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { address, isCorrectNetwork } = useWallet();
  const [votingStates, setVotingStates] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!address || !isCorrectNetwork || !window.ethereum) {
        setIsMember(false);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);
        const contractService = new ContractService();
        await contractService.initialize(provider);
        const memberStatus = await contractService.isMember(address);
        setIsMember(memberStatus);
      } catch (error) {
        console.error("Error checking member status:", error);
        setIsMember(false);
      }
    };

    checkMemberStatus();
  }, [address, isCorrectNetwork]);

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!address || !isCorrectNetwork || !window.ethereum) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!isMember) {
      toast.error("Only DAO members can vote on proposals");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      await contractService.voteOnProposal(proposalId, support);
      setVotingStates({ ...votingStates, [proposalId]: true });
      toast.success("Vote cast successfully!");

      // Refresh page after voting
      window.location.reload();
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to cast vote");
    }
  };

  const formatTimeLeft = (votingEnd: string) => {
    const now = Math.floor(Date.now() / 1000);
    const end = parseInt(votingEnd);
    const timeLeft = end - now;

    if (timeLeft <= 0) return "Voting ended";

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${hours}h ${minutes}m left`;
  };

  const isProposalActive = (proposal: Proposal) => {
    const now = Math.floor(Date.now() / 1000);
    const votingEnded = parseInt(proposal.votingEnd) <= now;
    return !votingEnded && !proposal.executed;
  };

  const getFilteredProposals = () => {
    return proposals
      .filter((proposal) => {
        if (activeTab === "active") {
          return isProposalActive(proposal);
        } else {
          const now = Math.floor(Date.now() / 1000);
          const votingEnded = parseInt(proposal.votingEnd) <= now;
          return votingEnded || proposal.executed;
        }
      })
      .sort((a, b) => b.id - a.id); // Sort by ID in descending order
  };

  const getProposalTypeText = (type: ProposalType) => {
    switch (type) {
      case ProposalType.UPLOAD:
        return "Upload";
      case ProposalType.DELETE:
        return "Delete";
      case ProposalType.SHARE:
        return "Share";
      default:
        return "Unknown";
    }
  };

  const getProposalTypeColor = (type: ProposalType) => {
    switch (type) {
      case ProposalType.UPLOAD:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case ProposalType.DELETE:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case ProposalType.SHARE:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getProposalTypeIcon = (type: ProposalType) => {
    switch (type) {
      case ProposalType.UPLOAD:
        return <Upload className="h-4 w-4" />;
      case ProposalType.DELETE:
        return <Trash2 className="h-4 w-4" />;
      case ProposalType.SHARE:
        return <Share2 className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  if (!address || !isCorrectNetwork) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view and vote on proposals.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isMember) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be a DAO member to vote on proposals. Please contact the
          admin to become a member.
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

  const filteredProposals = getFilteredProposals();

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="active"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Proposals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Proposal History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {!filteredProposals.length ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No active proposals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onVote={handleVote}
                  votingStates={votingStates}
                  formatTimeLeft={formatTimeLeft}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {!filteredProposals.length ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No historical proposals</p>
            </div>
          ) : (
    <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onVote={handleVote}
                  votingStates={votingStates}
                  formatTimeLeft={formatTimeLeft}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: number, support: boolean) => Promise<void>;
  votingStates: { [key: number]: boolean };
  formatTimeLeft: (votingEnd: string) => string;
}

function ProposalCard({
  proposal,
  onVote,
  votingStates,
  formatTimeLeft,
}: ProposalCardProps) {
  const totalVotes = parseInt(proposal.yesVotes) + parseInt(proposal.noVotes);
  const yesPercentage =
    totalVotes > 0 ? (parseInt(proposal.yesVotes) / totalVotes) * 100 : 0;
  const votingEnded =
    parseInt(proposal.votingEnd) <= Math.floor(Date.now() / 1000);
  const isActive =
    !proposal.executed &&
    parseInt(proposal.votingEnd) > Math.floor(Date.now() / 1000);
  const isDelete = proposal.proposalType === ProposalType.DELETE;

  const displayFileSize = () => {
    const size = parseInt(proposal.fileSize);
    if (size === 0) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 space-y-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {isDelete ? "Delete Proposal" : "Upload Proposal"} #{proposal.id}
          </h3>
          {isDelete && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
              Delete
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {formatTimeLeft(proposal.votingEnd)}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          File: {proposal.fileName}
        </p>
        <p className="text-sm text-gray-500">
          Size: {displayFileSize()}
        </p>
        <p className="text-sm text-gray-500">
          Proposer: {proposal.proposer.slice(0, 6)}...
          {proposal.proposer.slice(-4)}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Votes</span>
          <span style={{ color: theme.colors.primary }}>
            {yesPercentage.toFixed(1)}% Yes
          </span>
        </div>
        <Progress
          value={yesPercentage}
          className="h-2 [&>div]:bg-primary [&>div]:transition-all"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{proposal.yesVotes} Yes</span>
          <span>{proposal.noVotes} No</span>
        </div>
      </div>

      {!proposal.executed && !votingStates[proposal.id] && !votingEnded && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary/5"
            onClick={() => onVote(proposal.id, true)}
            style={{
              borderColor: theme.colors.primary,
              color: theme.colors.primary,
            }}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Vote Yes
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary/5"
            onClick={() => onVote(proposal.id, false)}
            style={{
              borderColor: theme.colors.primary,
              color: theme.colors.primary,
            }}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Vote No
          </Button>
        </div>
      )}

      {votingEnded && !proposal.executed && (
        <div className="mt-4 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Voting period has ended</AlertDescription>
          </Alert>
          {proposal.proposalType === ProposalType.DELETE && (
            <div className="mt-4">
              <DeleteProposal
                cid={proposal.cid}
                fileName={proposal.fileName}
                proposalId={proposal.id.toString()}
                isExecutable={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
