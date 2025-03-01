"use client";

import { useEffect, useState } from "react";
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
  const baseClass = "h-12 w-12";
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
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view managed files.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: theme.colors.primary }}
        />
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="text-center py-12">
        <FileText
          className="h-16 w-16 mx-auto mb-4"
          style={{ color: theme.colors.primary }}
        />
        <p className="text-gray-500 dark:text-gray-400">No files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Card
          key={file.cid}
          className="group overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10 border-gray-100 dark:border-gray-800"
        >
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center text-center gap-3">
              {getFileIcon(file.type || "application/octet-stream")}
              <div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Badge
                className="mt-2"
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
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate cursor-help">
                    CID: {file.cid}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{file.cid}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:text-primary hover:border-primary transition-colors"
              onClick={() =>
                window.open(
                  `https://auto-drive.taurus.autonomys.io/ipfs/${file.cid}`,
                  "_blank"
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:text-primary hover:border-primary transition-colors"
              onClick={() =>
                window.open(
                  `https://ai3.storage/taurus/drive/metadata/${file.cid}`,
                  "_blank"
                )
              }
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
