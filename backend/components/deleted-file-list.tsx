"use client";

import React, { useEffect, useState } from "react";
import { ContractService, ProposalType } from "../lib/contract";
import { useWallet } from "../hooks/useWallet";
import { BrowserProvider } from "ethers";
import { FileText, Loader2 } from "lucide-react";
import { theme } from "../lib/theme";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface DeletedFile {
  cid: string;
  fileName: string;
  proposer: string;
  executedAt: string;
}

export function DeletedFileList() {
  const [deletedFiles, setDeletedFiles] = useState<DeletedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isCorrectNetwork } = useWallet();

  const fetchDeletedFiles = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contractService = new ContractService();
      await contractService.initialize(provider);

      const proposalCount = await contractService.proposalCount();
      const proposalPromises = [];

      for (let i = 1; i <= proposalCount; i++) {
        proposalPromises.push(contractService.getProposal(i));
      }

      const proposals = await Promise.all(proposalPromises);

      // Filter for executed delete proposals
      const deletedFiles = proposals
        .filter((p) => p.proposalType === ProposalType.DELETE && p.executed)
        .map((p) => ({
          cid: p.cid,
          fileName: p.fileName,
          proposer: p.proposer,
          executedAt: p.votingEnd,
        }));

      setDeletedFiles(deletedFiles);
    } catch (error) {
      console.error("Error fetching deleted files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedFiles();
  }, [address, isCorrectNetwork]);

  if (!address || !isCorrectNetwork) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view deleted files.
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

  if (!deletedFiles.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No deleted files found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deletedFiles.map((file) => (
        <div
          key={file.cid}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-2 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold">{file.fileName}</h3>
          <p className="text-sm text-gray-500">CID: {file.cid}</p>
          <p className="text-sm text-gray-500">
            Deleted by: {file.proposer.slice(0, 6)}...{file.proposer.slice(-4)}
          </p>
          <p className="text-sm text-gray-500">
            Deleted at:{" "}
            {new Date(parseInt(file.executedAt) * 1000).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
