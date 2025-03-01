"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { useWallet } from "@/hooks/useWallet";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ContractService, ProposalType } from "../lib/contract";
import { BrowserProvider } from "ethers";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Folder, Clock } from "lucide-react";
import { theme } from "../lib/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";
import { FolderUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNetwork } from "@/hooks/useNetwork";
import { useMembership } from "@/hooks/useMembership";

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

export function UploadFolder() {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposalDetails, setProposalDetails] = useState<{
    id: string;
    name: string;
    cid: string;
    votingEnd: number;
  } | null>(null);
  const [votingPeriod, setVotingPeriod] = useState("300"); // 5 minutes default
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const { isCorrectNetwork } = useNetwork();
  const { isMember } = useMembership(address);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Log files for debugging
    console.log(
      "Dropped files:",
      acceptedFiles.map((f) => ({
        name: f.name,
        path: f.webkitRelativePath,
        size: f.size,
      }))
    );

    // Filter out any directory entries and hidden files
    const files = acceptedFiles.filter(
      (file) => file.size > 0 && !file.name.startsWith(".")
    );

    console.log(
      "Filtered dropped files:",
      files.map((f) => ({
        name: f.name,
        path: f.webkitRelativePath,
        size: f.size,
      }))
    );

    const fileList = Object.assign(files, {
      item: (index: number) => files[index],
      length: files.length,
    });
    setSelectedFolder(fileList as unknown as FileList);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    accept: {
      "folder/*": ["./*"],
    },
  });

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      // Log files for debugging
      console.log(
        "All files:",
        Array.from(event.target.files).map((f) => ({
          name: f.name,
          path: f.webkitRelativePath,
          size: f.size,
        }))
      );

      // Filter out any directory entries and hidden files
      const files = Array.from(event.target.files).filter(
        (file) => file.size > 0 && !file.name.startsWith(".")
      );

      console.log(
        "Filtered files:",
        files.map((f) => ({
          name: f.name,
          path: f.webkitRelativePath,
          size: f.size,
        }))
      );

      const fileList = Object.assign(files, {
        item: (index: number) => files[index],
        length: files.length,
      });
      setSelectedFolder(fileList as unknown as FileList);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFolder || selectedFolder.length === 0) {
      toast({
        title: "Error",
        description: "Please select a folder to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData and append files
      const formData = new FormData();
      Array.from(selectedFolder).forEach((file) => {
        formData.append("files", file);
      });

      // Upload folder
      const response = await fetch("/api/proposals/folder", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload folder");
      }

      const data = await response.json();

      // Create proposal
      const contract = new ContractService();
      const proposalId = await contract.createProposal(
        data.name,
        data.cid,
        parseInt(votingPeriod)
      );

      setProposalDetails({
        id: proposalId,
        name: data.name,
        cid: data.cid,
        votingEnd: Math.floor(Date.now() / 1000) + parseInt(votingPeriod),
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create proposal",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFolder(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/"); // Navigate to home page
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertDescription>
          Please connect your wallet to upload folders.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Alert>
        <AlertDescription>
          Please switch to the correct network to upload folders.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isMember) {
    return (
      <Alert>
        <AlertDescription>
          Only DAO members can upload folders.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
        >
          <input
            {...getInputProps()}
            ref={fileInputRef}
            onChange={handleFolderSelect}
            type="file"
            // @ts-ignore - These attributes are non-standard but supported by browsers
            webkitdirectory=""
            directory=""
            className="hidden"
          />
          <FolderUp className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the folder here"
              : "Drag and drop a folder here, or click to select"}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Folder
          </Button>
        </div>

        {selectedFolder && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selected folder:{" "}
              {selectedFolder[0]?.webkitRelativePath.split("/")[0]}
            </p>
            <p className="text-sm text-gray-600">
              Files: {selectedFolder.length}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Voting Period</label>
          <Select value={votingPeriod} onValueChange={setVotingPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select voting period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-600 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!selectedFolder || isUploading}
        >
          {isUploading ? "Uploading..." : "Create Proposal"}
        </Button>
      </form>

      <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposal Created Successfully</DialogTitle>
          </DialogHeader>
          {proposalDetails && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Proposal ID</p>
                <p className="font-mono text-sm">{proposalDetails.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Folder Name</p>
                <p className="font-mono text-sm">{proposalDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">CID</p>
                <p className="font-mono text-sm break-all">
                  {proposalDetails.cid}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Voting Ends</p>
                <p className="font-mono text-sm">
                  {new Date(proposalDetails.votingEnd * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
