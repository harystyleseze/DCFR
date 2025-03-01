"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/ui/use-toast";
import { ContractService } from "../lib/contract";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { theme } from "../lib/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNetwork } from "@/hooks/useNetwork";
import { useMembership } from "@/hooks/useMembership";
import { BrowserProvider } from "ethers";

const VOTING_PERIODS = [
  { label: "1 minute", value: "60" },
  { label: "5 minutes", value: "300" },
  { label: "15 minutes", value: "900" },
  { label: "30 minutes", value: "1800" },
  { label: "1 hour", value: "3600" },
  { label: "6 hours", value: "21600" },
  { label: "12 hours", value: "43200" },
  { label: "24 hours", value: "86400" },
];

interface DeleteProposalProps {
  cid: string;
  fileName: string;
  onDelete?: () => void;
  onCreateProposal?: (
    cid: string,
    fileName: string,
    votingPeriod: number
  ) => Promise<void>;
  proposalId?: string;
  isExecutable?: boolean;
}

export function DeleteProposal({
  cid,
  fileName,
  onDelete,
  onCreateProposal,
  proposalId: initialProposalId,
  isExecutable,
}: DeleteProposalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposalId, setProposalId] = useState<string | undefined>(
    initialProposalId
  );
  const [votingPeriod, setVotingPeriod] = useState("300"); // 5 minutes default

  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const { isCorrectNetwork } = useNetwork();
  const { isMember } = useMembership(address);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      if (onCreateProposal) {
        await onCreateProposal(cid, fileName, parseInt(votingPeriod));
      } else {
        const contract = new ContractService();
        const provider = new BrowserProvider(window.ethereum!);
        await contract.initialize(provider);

        // Create delete proposal
        const newProposalId = await contract.createDeleteProposal(
          cid,
          fileName,
          parseInt(votingPeriod)
        );

        if (newProposalId) {
          setProposalId(newProposalId.toString());
          setShowSuccessModal(true);
        } else {
          throw new Error("Failed to get proposal ID");
        }

        if (onDelete) {
          onDelete();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create delete proposal",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/proposals"); // Navigate to proposals page
  };

  const handleExecuteDelete = async () => {
    if (!window.ethereum || !proposalId) return;

    try {
      setIsExecuting(true);
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ContractService();
      await contract.initialize(provider);

      // Check if proposal has passed
      const isPassed = await contract.isProposalPassed(parseInt(proposalId));
      if (!isPassed) {
        throw new Error("Proposal has not passed");
      }

      // Execute the proposal on the contract
      await contract.executeProposal(parseInt(proposalId));

      // Delete the file through the API route
      const response = await fetch("/api/autoDrive/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }

      toast({
        title: "Success",
        description: "Proposal executed and file deleted successfully!",
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error("Error executing delete proposal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to execute delete proposal",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertDescription>
          Please connect your wallet to delete files.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Alert>
        <AlertDescription>
          Please switch to the correct network to delete files.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isMember) {
    return (
      <Alert>
        <AlertDescription>Only DAO members can delete files.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {isExecutable ? (
        <Button
          variant="destructive"
          onClick={handleExecuteDelete}
          disabled={isDeleting}
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Execute Delete
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Voting Period</label>
            <Select value={votingPeriod} onValueChange={setVotingPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select voting period" />
              </SelectTrigger>
              <SelectContent>
                {VOTING_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Creating Proposal..." : "Delete File"}
          </Button>
        </div>
      )}

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Proposal Created</DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-3">
                <p>
                  A proposal to delete the file has been created. DAO members
                  will need to vote on this proposal before the file can be
                  deleted.
                </p>
                <p>
                  <strong>Proposal ID:</strong> {proposalId}
                </p>
                <p>
                  <strong>File Name:</strong> {fileName}
                </p>
                <p>
                  <strong>CID:</strong> {cid}
                </p>
                <p>
                  <strong>Voting Period:</strong>{" "}
                  {VOTING_PERIODS.find((p) => p.value === votingPeriod)?.label}
                </p>
              </div>
              <div className="mt-6">
                <Button onClick={handleCloseSuccessModal}>
                  View Proposals
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
