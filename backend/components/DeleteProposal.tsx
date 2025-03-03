"use client";

import React, { useState, useEffect } from "react";
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
  const [canExecute, setCanExecute] = useState(false);

  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const { isCorrectNetwork } = useNetwork();
  const { isMember } = useMembership(address);

  useEffect(() => {
    const checkExecutable = async () => {
      if (!proposalId || !isExecutable || !window.ethereum) return;
      
      try {
        const provider = new BrowserProvider(window.ethereum as any);
        const contractService = new ContractService();
        await contractService.initialize(provider);
        const isPassed = await contractService.isProposalPassed(Number(proposalId));
        setCanExecute(isPassed);
      } catch (error) {
        console.error("Error checking if proposal can be executed:", error);
        setCanExecute(false);
      }
    };

    checkExecutable();
  }, [proposalId, isExecutable]);

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

      // First check if the file still exists
      try {
        const response = await fetch(`/api/files/metadata?cid=${cid}`);
        const data = await response.json();
        
        if (response.status === 404 || (data.error && data.error.includes("not found"))) {
          toast({
            title: "Error",
            description: "This file no longer exists. It may have been deleted already.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error checking file existence:", error);
        toast({
          title: "Error",
          description: "Unable to verify file existence. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const contract = new ContractService();
      await contract.initialize(provider);

      // Check if proposal has passed
      const isPassed = await contract.isProposalPassed(parseInt(proposalId));
      if (!isPassed) {
        toast({
          title: "Error",
          description: "This proposal has not passed and cannot be executed.",
          variant: "destructive",
        });
        return;
      }

      // Execute the proposal on the contract
      try {
        await contract.executeProposal(parseInt(proposalId));
      } catch (error: any) {
        if (error.message?.includes("File does not exist")) {
          toast({
            title: "Error",
            description: "This file has already been deleted.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

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
      {!proposalId && !isExecutable && (
        <Button
          onClick={() => handleDelete()}
          disabled={isDeleting}
          className="w-full flex items-center justify-center gap-2"
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Creating Proposal..." : "Create Delete Proposal"}
        </Button>
      )}

      {isExecutable && canExecute && (
        <Button
          onClick={handleExecuteDelete}
          disabled={isDeleting}
          className="w-full"
        >
          {isDeleting ? "Executing..." : "Execute Delete"}
        </Button>
      )}

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Trash2 className="h-6 w-6" style={{ color: theme.colors.primary }} />
                <span>Delete Proposal Created</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                  <div className="grid grid-cols-[auto,1fr] gap-2">
                    <strong>Proposal ID:</strong>
                    <span className="font-mono text-sm truncate">{proposalId}</span>
                    
                    <strong>File Name:</strong>
                    <span className="font-mono text-sm truncate">{fileName}</span>
                    
                    <strong>CID:</strong>
                    <span className="font-mono text-sm truncate">{cid}</span>
                    
                    <strong>Voting Period:</strong>
                    <span className="font-mono text-sm">{VOTING_PERIODS.find((p) => p.value === votingPeriod)?.label}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  A proposal to delete the file has been created. DAO members
                  will need to vote on this proposal before the file can be deleted.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button onClick={handleCloseSuccessModal} className="w-full bg-primary hover:bg-primary-hover text-white">
              View Proposals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
