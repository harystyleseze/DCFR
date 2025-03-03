"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useMembership } from "@/hooks/useMembership";
import { FileList } from "@/components/file-list";
import { ProposalList } from "@/components/proposal-list";
import { DeletedFileList } from "@/components/deleted-file-list";
import { SharedFileList } from "@/components/shared-file-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Trash2, Share2, Users, FileText, FolderUp, Loader2, ArrowRight, FolderOpen, Upload, Settings } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { theme } from "@/lib/theme";

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
    <div className="relative">
      {/* Hero Section with Background */}
      <div
        className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 py-24 sm:py-32"
        style={{
          backgroundImage: 'url("/hero-bg.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Decentralized Collaborative File Repository
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A secure, transparent, and community-driven platform for managing files through DAO governance.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/proposals/upload">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary-hover text-white"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  Upload File
                  <FileUp className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/managed">
                <Button variant="outline" size="lg">
                  View All Files
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(null).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200">
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
              <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
                  <FileText className="h-4 w-4" style={{ color: theme.colors.primary }} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProposals}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Files Managed</CardTitle>
                  <FileUp className="h-4 w-4" style={{ color: theme.colors.primary }} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.filesManaged}</div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">DAO Members</CardTitle>
                  <Users className="h-4 w-4" style={{ color: theme.colors.primary }} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.daoMembers}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/proposals">
            <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">View and vote on active proposals</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/managed">
            <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  Managed Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Browse and manage your files</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/proposals/upload">
            <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Upload new files to the repository</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="bg-white dark:bg-gray-800 shadow-lg transform hover:scale-105 transition-transform duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" style={{ color: theme.colors.primary }} />
                  Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Manage DAO members and settings</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Recent Files</h2>
          <Link href="/managed">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <FileList showAll={false} viewMode="card" />
      </div>

      <Footer />
    </div>
  );
}
