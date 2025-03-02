import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWallet } from "../hooks/useWallet";
import { ContractService } from "../lib/contract";
import { BrowserProvider } from "ethers";
import { toast } from "sonner";
import { Share2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { theme } from "../lib/theme";

interface ShareProposalProps {
  cid: string;
  fileName: string;
  onShare?: () => void;
  onCreateProposal?: (
    cid: string,
    fileName: string,
    votingPeriod: number
  ) => Promise<void>;
  proposalId?: string;
  isExecutable?: boolean;
}

export function ShareProposal({
  cid,
  fileName,
  onShare,
  onCreateProposal,
  proposalId: initialProposalId,
  isExecutable,
}: ShareProposalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [votingPeriod, setVotingPeriod] = useState("300"); // 5 minutes default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { address, isCorrectNetwork } = useWallet();

  const handleShare = async () => {
    if (!address || !isCorrectNetwork || !window.ethereum) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      if (onCreateProposal) {
        await onCreateProposal(cid, fileName, parseInt(votingPeriod));
      } else {
        const proposalId = await contractService.createShareProposal(
          cid,
          fileName,
          parseInt(votingPeriod)
        );
        console.log("Share proposal created:", proposalId);
      }

      setShowSuccessModal(true);
      setIsOpen(false);
      onShare?.();
    } catch (error: any) {
      console.error("Error creating share proposal:", error);
      toast.error("Error", {
        description: error.message || "Failed to create share proposal",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleExecuteShare = async () => {
    if (!address || !isCorrectNetwork || !window.ethereum || !initialProposalId) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      await contractService.executeProposal(parseInt(initialProposalId));
      toast.success("Share proposal executed successfully!");
      onShare?.();
    } catch (error: any) {
      console.error("Error executing share proposal:", error);
      toast.error("Error", {
        description: error.message || "Failed to execute share proposal",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isExecutable) {
    return (
      <Button
        variant="outline"
        className="w-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:text-[#F88D0B] hover:border-[#F88D0B] dark:hover:bg-gray-800"
        onClick={handleExecuteShare}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Executing..."
        ) : (
          <>
            <Share2 className="mr-2 h-4 w-4" />
            Execute Share
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      <Button
        className="w-full transition-all duration-300 hover:scale-105 hover:shadow-md bg-[#F88D0B] hover:bg-[#E07D0A] text-white"
        onClick={() => setIsOpen(true)}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share File
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">Create Share Proposal</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a proposal to share this file with the public. Members will vote on
              making the file publicly accessible.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="font-medium">File Name</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">{fileName}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">CID</Label>
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all">{cid}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="votingPeriod" className="font-medium">Voting Period (seconds)</Label>
              <Input
                id="votingPeriod"
                type="number"
                value={votingPeriod}
                onChange={(e) => setVotingPeriod(e.target.value)}
                min="60"
                className="col-span-3"
              />
              <p className="text-sm text-gray-500">
                Minimum 60 seconds (1 minute)
              </p>
            </div>
          </div>

          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              If this proposal passes, the file will be publicly accessible to anyone.
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <DialogFooter className="mt-6 gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSubmitting}
              className="flex-1 bg-[#F88D0B] hover:bg-[#E07D0A] text-white"
            >
              {isSubmitting ? "Creating..." : "Create Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Share2 className="h-6 w-6" style={{ color: theme.colors.primary }} />
                <span>Share Proposal Created</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                  <div className="grid grid-cols-[auto,1fr] gap-2">
                    <strong>File Name:</strong>
                    <span className="font-mono text-sm truncate">{fileName}</span>
                    
                    <strong>CID:</strong>
                    <span className="font-mono text-sm truncate">{cid}</span>
                    
                    <strong>Voting Period:</strong>
                    <span className="font-mono text-sm">{votingPeriod} seconds</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Your share proposal has been created successfully. Members can now vote
                  on making this file publicly accessible.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button onClick={handleCloseSuccessModal} className="w-full bg-primary hover:bg-primary-hover text-white">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 