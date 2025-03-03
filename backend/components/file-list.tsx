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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProposal } from "./DeleteProposal";
import { ShareProposal } from "./ShareProposal";

interface File {
  name: string;
  cid: string;
  size: number;
  type?: string;
}

interface FileListProps {
  showAll?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onTotalPagesChange?: (pages: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  viewMode?: 'card' | 'table';
}

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
};

const getDisplayFileType = (fileName: string, mimeType?: string) => {
  const extension = getFileExtension(fileName);
  if (extension) {
    return extension.slice(1).toUpperCase(); // Remove the dot and uppercase
  }
  if (mimeType) {
    return mimeType.split('/')[1].toUpperCase();
  }
  return 'FILE';
};

const getFileIcon = (fileName: string, type: string = '') => {
  const baseClass = "h-16 w-16 transition-transform duration-300 group-hover:scale-110";
  const smallClass = "h-4 w-4";
  const isSmall = type === 'small';
  const className = isSmall ? smallClass : baseClass;

  const extension = getFileExtension(fileName);

  // First check common file extensions
  switch (extension) {
    case '.pdf':
      return <FileText className={`${className} text-blue-500`} />;
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.webp':
      return <Image className={`${className} text-green-500`} />;
    case '.mp4':
    case '.mov':
    case '.avi':
    case '.mkv':
      return <Film className={`${className} text-red-500`} />;
    case '.mp3':
    case '.wav':
    case '.ogg':
      return <Music className={`${className} text-purple-500`} />;
    case '.zip':
    case '.rar':
    case '.7z':
    case '.tar':
    case '.gz':
      return <FileArchive className={`${className} text-yellow-500`} />;
  }

  // Fallback to MIME type if extension is not recognized
  if (type) {
    const mimeType = type.split('/')[0];
    switch (mimeType) {
    case "image":
        return <Image className={`${className} text-green-500`} />;
    case "video":
        return <Film className={`${className} text-red-500`} />;
    case "audio":
        return <Music className={`${className} text-purple-500`} />;
      case "application":
        if (type.includes("pdf")) {
          return <FileText className={`${className} text-blue-500`} />;
        }
        if (type.includes("zip") || type.includes("compressed")) {
          return <FileArchive className={`${className} text-yellow-500`} />;
        }
    }
  }

  // Default icon for unknown types
  return <FileText className={`${className} text-gray-500`} />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileList({
  showAll = false,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onTotalPagesChange,
  onLoadingChange,
  viewMode = 'card'
}: FileListProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { address, isCorrectNetwork } = useWallet();

  useEffect(() => {
    let isMounted = true;

    const fetchFiles = async () => {
      if (!address || !isCorrectNetwork) return;
      
      try {
        setLoading(true);
        onLoadingChange?.(true);

        const limit = showAll ? itemsPerPage : 5;
        const response = await fetch(`/api/files?page=${currentPage}&limit=${limit}`);
        
        if (!isMounted) return;
        
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setFiles(data.files || []);

        if (onTotalPagesChange) {
          onTotalPagesChange(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        if (isMounted) {
          toast.error("Error", {
            description: "Failed to fetch files. Please try again."
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    fetchFiles();

    return () => {
      isMounted = false;
    };
  }, [currentPage, itemsPerPage, showAll, address, isCorrectNetwork, onTotalPagesChange, onLoadingChange]);

  const handleDownload = async (cid: string) => {
    try {
      window.open(`/api/files/download?cid=${cid}`, '_blank');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error('Error', {
        description: error.message || 'Failed to download file'
      });
    }
  };

  const handlePreview = async (cid: string) => {
    try {
      window.open(`/api/files/preview?cid=${cid}`, '_blank');
    } catch (error: any) {
      console.error('Error previewing file:', error);
      toast.error('Error', {
        description: error.message || 'Failed to preview file'
      });
    }
  };

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

  if (loading && !files.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mb-4 mx-auto"
            style={{ color: theme.colors.primary }}
          />
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            Loading your files...
          </p>
        </div>
      </div>
    );
  }

  if (!loading && !files.length) {
    return (
      <div className="text-center py-12">
        <FileText
          className="h-16 w-16 mx-auto mb-4 opacity-80"
          style={{ color: theme.colors.primary }}
        />
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          No Files Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start by uploading your first file to the decentralized repository.
        </p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.colors.primary }} />
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.cid}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.name, 'small')}
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{getDisplayFileType(file.name, file.type)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(file.cid)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.cid)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DeleteProposal
                        cid={file.cid}
                        fileName={file.name}
                      />
                      <ShareProposal
                        cid={file.cid}
                        fileName={file.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
                {getFileIcon(file.name, file.type)}
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
                {getDisplayFileType(file.name, file.type)}
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
              onClick={() => handleDownload(file.cid)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:text-primary hover:border-primary dark:hover:bg-gray-800"
              onClick={() => handlePreview(file.cid)}
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
