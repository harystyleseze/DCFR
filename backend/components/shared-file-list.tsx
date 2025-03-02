"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { FileText, Loader2, Download, Eye } from "lucide-react";
import { theme } from "../lib/theme";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface SharedFile {
  name: string;
  headCid: string;
  size: number;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function SharedFileList() {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isCorrectNetwork } = useWallet();

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/files/shared");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch shared files");
      }
      const data = await response.json();
      setSharedFiles(data.files);
    } catch (error: any) {
      console.error("Error fetching shared files:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && isCorrectNetwork) {
      fetchSharedFiles();
    }
  }, [address, isCorrectNetwork]);

  const handleDownload = async (cid: string) => {
    try {
      window.open(`/api/files/download?cid=${cid}`, "_blank");
    } catch (error: any) {
      console.error("Error downloading file:", error);
    }
  };

  const handlePreview = async (cid: string) => {
    try {
      window.open(`/api/files/preview?cid=${cid}`, "_blank");
    } catch (error: any) {
      console.error("Error previewing file:", error);
    }
  };

  if (!address || !isCorrectNetwork) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view shared files.
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!sharedFiles.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No files have been shared with you</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sharedFiles.map((file) => (
        <div
          key={file.headCid}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-2 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{file.name}</h3>
              <p className="text-sm text-gray-500">Size: {formatFileSize(file.size)}</p>
              <p className="text-sm text-gray-500 font-mono mt-2">
                CID: {file.headCid}
              </p>
            </div>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePreview(file.headCid)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview File</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(file.headCid)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download File</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 