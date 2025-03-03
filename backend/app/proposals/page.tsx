"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { theme } from "@/lib/theme";
import { toast } from "sonner";
import { ProposalList, Proposal } from "@/components/proposal-list";
import { ProposalType } from "@/lib/contract";

interface GroupedProposals {
  active: {
    upload: Proposal[];
    delete: Proposal[];
    share: Proposal[];
  };
  executed: {
    upload: Proposal[];
    delete: Proposal[];
    share: Proposal[];
  };
}

interface ProposalStats {
  active: number;
  executed: number;
  total: number;
}

export default function ProposalsPage() {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<GroupedProposals | null>(null);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const { address, isCorrectNetwork } = useWallet();

  useEffect(() => {
    const fetchProposals = async () => {
      if (!address || !isCorrectNetwork) return;

      try {
        setLoading(true);
        const response = await fetch("/api/proposals/list");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setProposals(data.proposals);
        setStats(data.stats);
      } catch (error: any) {
        console.error("Error fetching proposals:", error);
        toast.error("Error", {
          description: "Failed to fetch proposals. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [address, isCorrectNetwork]);

  if (!address || !isCorrectNetwork) {
    return (
      <Alert className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view proposals.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mb-4 mx-auto"
            style={{ color: theme.colors.primary }}
          />
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            Loading proposals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Proposals</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage all DAO proposals
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Executed Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.executed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="executed">Proposal History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Tabs defaultValue="delete" className="space-y-4">
            <TabsList>
              <TabsTrigger value="delete">Delete Proposals</TabsTrigger>
              <TabsTrigger value="share">Share Proposals</TabsTrigger>
              <TabsTrigger value="upload">Upload Proposals</TabsTrigger>
            </TabsList>

            <TabsContent value="delete">
              <ProposalList proposals={proposals?.active.delete || []} type="delete" status="active" />
            </TabsContent>
            <TabsContent value="share">
              <ProposalList proposals={proposals?.active.share || []} type="share" status="active" />
            </TabsContent>
            <TabsContent value="upload">
              <ProposalList proposals={proposals?.active.upload || []} type="upload" status="active" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="executed" className="space-y-4">
          <Tabs defaultValue="delete" className="space-y-4">
            <TabsList>
              <TabsTrigger value="delete">Delete Proposals</TabsTrigger>
              <TabsTrigger value="share">Share Proposals</TabsTrigger>
              <TabsTrigger value="upload">Upload Proposals</TabsTrigger>
            </TabsList>

            <TabsContent value="delete">
              <ProposalList proposals={proposals?.executed.delete || []} type="delete" status="executed" />
            </TabsContent>
            <TabsContent value="share">
              <ProposalList proposals={proposals?.executed.share || []} type="share" status="executed" />
            </TabsContent>
            <TabsContent value="upload">
              <ProposalList proposals={proposals?.executed.upload || []} type="upload" status="executed" />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
} 