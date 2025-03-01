"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWallet } from "../hooks/useWallet";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { ContractService } from "../lib/contract";
import { BrowserProvider } from "ethers";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FileUp, Clock } from "lucide-react";
import { theme } from "../lib/theme";

const VOTING_PERIODS = [
  { label: "1 second", value: "1" },
  { label: "10 seconds", value: "10" },
  { label: "30 seconds", value: "30" },
  { label: "1 minute", value: "60" },
  { label: "5 minutes", value: "300" },
  { label: "15 minutes", value: "900" },
  { label: "30 minutes", value: "1800" },
  { label: "1 hour", value: "3600" },
  { label: "6 hours", value: "21600" },
  { label: "12 hours", value: "43200" },
  { label: "24 hours", value: "86400" },
];

export function UploadProposal() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [votingPeriod, setVotingPeriod] = useState("60");
  const [proposalDetails, setProposalDetails] = useState<{
    id: string;
    cid: string;
    fileName: string;
    votingEnds: string;
  } | null>(null);
  const { address, isCorrectNetwork } = useWallet();

  useEffect(() => {
    const checkMembership = async () => {
      if (address && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const contractService = new ContractService();
          await contractService.initialize(provider);
          const memberStatus = await contractService.isMember(address);
          setIsMember(memberStatus);
        } catch (error) {
          console.error("Error checking membership:", error);
        }
      }
    };

    checkMembership();
  }, [address]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !address || !isCorrectNetwork || !window.ethereum || !isMember)
      return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const response = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Upload failed:", data);
        throw new Error(data.error || "Failed to create proposal");
      }

      console.log("Upload successful:", data);

      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      const proposalId = await contractService.createUploadProposal(
        data.cid,
        file.name,
        file.size,
        parseInt(votingPeriod)
      );

      setUploadProgress(100);
      const votingEnds = new Date(
        Date.now() + parseInt(votingPeriod) * 1000
      ).toLocaleString();
      setProposalDetails({
        id: proposalId,
        cid: data.cid,
        fileName: file.name,
        votingEnds,
      });
      setShowSuccessModal(true);

      setFile(null);
      setUploadProgress(0);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/"); // Navigate to home page
  };

  if (!address) {
    return (
      <div className="text-center p-4">
        Please connect your wallet to create proposals.
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="text-center p-4 text-yellow-600">
        Please switch to Autonomys Network to create proposals.
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="text-center p-4 text-red-600">
        You must be a DAO member to create proposals.
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-700 hover:border-primary/50"
          }`}
          style={
            {
              "--tw-border-opacity": isDragging ? "1" : "0.5",
              borderColor: isDragging ? theme.colors.primary : undefined,
            } as React.CSSProperties
          }
        >
          <div className="mb-4">
            <FileUp
              className="mx-auto mb-4 h-12 w-12"
              style={{ color: theme.colors.primary }}
            />
            {file ? (
              <p className="text-sm">Selected file: {file.name}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Drag and drop a file here, or click to select
              </p>
            )}
          </div>
          <Input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock
              className="h-4 w-4"
              style={{ color: theme.colors.primary }}
            />
            Voting Period
          </label>
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

        {uploadProgress > 0 && (
          <Progress
            value={uploadProgress}
            className="w-full [&>div]:bg-primary"
          />
        )}

        <Button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-primary hover:bg-primary-hover"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {uploading ? "Creating Proposal..." : "Create Proposal"}
        </Button>
      </form>

      <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2">
                <FileUp
                  className="h-6 w-6"
                  style={{ color: theme.colors.primary }}
                />
                <span>Proposal Created Successfully!</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 space-y-2">
                  <p>
                    <strong>Proposal ID:</strong>{" "}
                    <span className="font-mono">{proposalDetails?.id}</span>
                  </p>
                  <p>
                    <strong>File Name:</strong>{" "}
                    <span className="font-mono">
                      {proposalDetails?.fileName}
                    </span>
                  </p>
                  <p>
                    <strong>CID:</strong>{" "}
                    <span className="font-mono text-sm">
                      {proposalDetails?.cid}
                    </span>
                  </p>
                  <p>
                    <strong>Voting Ends:</strong>{" "}
                    <span className="font-mono">
                      {proposalDetails?.votingEnds}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Your proposal has been created and is now available for
                  voting. You will be redirected to the home page to view all
                  proposals.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={handleCloseSuccessModal}
              className="w-full bg-primary hover:bg-primary-hover"
              style={{ backgroundColor: theme.colors.primary }}
            >
              View All Proposals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
