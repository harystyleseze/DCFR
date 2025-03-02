"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Image,
  FileArchive,
  Film,
  Music,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { AutoDriveService } from "@/lib/autoDrive";
import { useWallet } from "@/hooks/useWallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { theme } from "@/lib/theme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface File {
  name: string;
  cid: string;
  size: number;
  type?: string;
}

const getFileIcon = (type: string) => {
  const baseClass = "h-16 w-16 transition-transform duration-300 group-hover:scale-110";
  switch (type.split("/")[0]) {
    case "application":
      if (type.includes("pdf")) {
        return <FileText className={`${baseClass} text-blue-500`} />;
      }
      return <FileArchive className={`${baseClass} text-yellow-500`} />;
    case "image":
      return <Image className={`${baseClass} text-green-500`} />;
    case "video":
      return <Film className={`${baseClass} text-red-500`} />;
    case "audio":
      return <Music className={`${baseClass} text-purple-500`} />;
    default:
      return <FileText className={`${baseClass} text-gray-500`} />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isCorrectNetwork } = useWallet();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/files");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data.files);
      } catch (error: any) {
        console.error("Error fetching files:", error);
        toast.error("Error", {
          description: error.message || "Failed to fetch files",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (!address || !isCorrectNetwork) {
    return (
      <Alert className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view managed files.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2
            className="h-12 w-12 animate-spin mb-4 mx-auto"
            style={{ color: theme.colors.primary }}
          />
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            Loading your files...
          </p>
        </div>
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="text-center py-24 px-4">
        <FileText
          className="h-20 w-20 mx-auto mb-6 opacity-80"
          style={{ color: theme.colors.primary }}
        />
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          No Files Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start by uploading your first file to the decentralized repository.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {files.map((file) => (
        <Card
          key={file.cid}
          className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10 border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-gray-800/50 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="pb-4 relative">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full p-6 bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary/20 dark:group-hover:ring-primary/20 transition-all duration-300">
                {getFileIcon(file.type || "application/octet-stream")}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Badge
                className="transition-all duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  color: theme.colors.primary,
                }}
              >
                {file.type?.split("/")[1] || "file"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate cursor-help text-center px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                    {file.cid}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-xs">{file.cid}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>

          <CardFooter className="grid grid-cols-2 gap-3 relative">
            <Button
              variant="outline"
              size="sm"
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:text-primary hover:border-primary dark:hover:bg-gray-800"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/files/download?cid=${file.cid}`);
                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to download file');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name;
                  document.body.appendChild(a);
                  a.click();
                  
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error: any) {
                  console.error('Error downloading file:', error);
                  toast.error('Error', {
                    description: error.message || 'Failed to download file'
                  });
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:text-primary hover:border-primary dark:hover:bg-gray-800"
              onClick={async () => {
                try {
                  const previewUrl = `/api/files/preview?cid=${file.cid}`;
                  window.open(previewUrl, '_blank');
                } catch (error: any) {
                  console.error('Error previewing file:', error);
                  toast.error('Error', {
                    description: error.message || 'Failed to preview file'
                  });
                }
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
