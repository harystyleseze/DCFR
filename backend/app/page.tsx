"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useMembership } from "@/hooks/useMembership";
import { FileList } from "@/components/file-list";
import { ProposalList } from "@/components/proposal-list";
import { DeletedFileList } from "@/components/deleted-file-list";
import { SharedFileList } from "@/components/shared-file-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Trash2, Share2, Users, FileText, FolderUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import Image from "next/image";

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
  const { isMember } = useMembership(address);

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
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section with Image */}
          <div className="relative text-center mb-16">
            <div className="absolute inset-0 z-0">
              <div className="w-full h-[500px] relative bg-gradient-to-b from-primary/5 to-primary/10 dark:from-gray-900 dark:to-gray-800">
                <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center opacity-80 dark:opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/95 dark:from-gray-900/80 dark:to-gray-900/95" />
              </div>
            </div>
            <div className="relative z-10 py-20 px-4">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    Decentralized
                  </span>{" "}
                  <span className="text-gray-900 dark:text-white">
                    Collaborative File Repository
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
                  A secure, transparent, and community-driven file management system
                </p>
                {!isConnected ? (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                      Connect Wallet to Start
                    </Button>
                    <Link href="https://docs.autonomys.xyz" target="_blank">
                      <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                ) : !isMember ? (
                  <Link href="/admin">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                      Join the DAO
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                  <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
                    <FileText className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeProposals}</div>
                  </CardContent>
                </Card>
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Files Managed</CardTitle>
                    <FileUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.filesManaged}</div>
                  </CardContent>
                </Card>
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">DAO Members</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.daoMembers}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions */}
          {isMember && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/proposals/upload" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary group"
                  >
                    <FileUp className="h-6 w-6 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">Upload File</span>
                  </Button>
                </Link>
                <Link href="/proposals/upload-folder" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary group"
                  >
                    <FolderUp className="h-6 w-6 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">Upload Folder</span>
                  </Button>
                </Link>
                <Link href="/proposals/delete" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary group"
                  >
                    <Trash2 className="h-6 w-6 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">Delete Files</span>
                  </Button>
                </Link>
                <Link href="/proposals/share" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary group"
                  >
                    <Share2 className="h-6 w-6 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">Share Files</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Main Content Tabs */}
          {isMember && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">File Management</h2>
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full lg:w-[600px] mb-8">
                  <TabsTrigger value="files" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Managed</span> Files
                  </TabsTrigger>
                  <TabsTrigger value="proposals" className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Active</span> Proposals
                  </TabsTrigger>
                  <TabsTrigger value="deleted" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Deleted</span> Files
                  </TabsTrigger>
                  <TabsTrigger value="shared" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Shared</span> Files
                  </TabsTrigger>
                </TabsList>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <TabsContent value="files" className="p-4 md:p-6">
                    <FileList />
                  </TabsContent>
                  <TabsContent value="proposals" className="p-4 md:p-6">
                    <ProposalList />
                  </TabsContent>
                  <TabsContent value="deleted" className="p-4 md:p-6">
                    <DeletedFileList />
                  </TabsContent>
                  <TabsContent value="shared" className="p-4 md:p-6">
                    <SharedFileList />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}

          {/* Call to Action for Non-Members */}
          {isConnected && !isMember && (
            <div className="mt-12">
              <Card className="p-6 md:p-8 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Join the DAO</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Become a member to start managing files, creating proposals, and participating in governance.
                  </p>
                  <Link href="/admin">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
