"use client";

import { FileList } from "@/components/file-list";
import { ProposalList } from "@/components/proposal-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Trash2, FolderUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { DeletedFileList } from "@/components/deleted-file-list";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";

interface Stats {
  activeProposals: number;
  filesManaged: number;
  daoMembers: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    activeProposals: 0,
    filesManaged: 0,
    daoMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useWallet();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Collaborative File Repository
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Decentralized Collaborative File Repository Governed by Community
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/proposals/upload">
              <Button className="bg-primary hover:bg-primary/90">
                <FileUp className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </Link>
            <Link href="/proposals/upload-folder">
              <Button className="bg-primary hover:bg-primary/90">
                <FolderUp className="mr-2 h-4 w-4" />
                Upload Folder
              </Button>
            </Link>
            <Link href="/proposals/delete">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Proposal
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ))
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Active Proposals
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {stats.activeProposals}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Files Managed
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {stats.filesManaged}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    DAO Members
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {stats.daoMembers}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="proposals" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="files">Managed Files</TabsTrigger>
            <TabsTrigger value="deleted">Deleted Files</TabsTrigger>
          </TabsList>
          <TabsContent value="proposals">
            <ProposalList />
          </TabsContent>
          <TabsContent value="files">
            <FileList />
          </TabsContent>
          <TabsContent value="deleted">
            <DeletedFileList />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
