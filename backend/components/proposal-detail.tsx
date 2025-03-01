"use client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { VoteButton } from "./vote-button"
import { Clock, FileUp, Trash2, User, Calendar } from "lucide-react"

type ProposalDetailProps = {
  id: string
}

export function ProposalDetail({ id }: ProposalDetailProps) {
  // In a real app, you would fetch the proposal data based on the ID
  // This is mock data for demonstration
  const proposal = {
    id,
    title: id === "1" ? "Upload quarterly financial report" : "Delete outdated marketing materials",
    description:
      id === "1"
        ? "This proposal is to upload the Q1 2023 financial report for transparency. The report contains all financial activities of the DAO for the first quarter of 2023, including revenue, expenses, and treasury management. This document is crucial for maintaining transparency with all DAO members."
        : "These marketing materials are no longer relevant and should be removed from our decentralized storage. They contain outdated information about our previous product offerings and could cause confusion if accessed by new users. Removing these files will help maintain clarity in our documentation.",
    type: id === "1" ? "upload" : "delete",
    proposer: "0x1234...5678",
    votesFor: 24,
    votesAgainst: 3,
    status: "active",
    timeRemaining: "2 days",
    createdAt: "2023-04-10",
    quorum: 30,
    fileDetails:
      id === "1"
        ? { name: "Q1_2023_Financial_Report.pdf", size: "2.4 MB" }
        : { name: "Old_Marketing_Materials", fileIds: ["file123", "file456", "file789"] },
  }

  const totalVotes = proposal.votesFor + proposal.votesAgainst
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0
  const quorumPercentage = (totalVotes / proposal.quorum) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {proposal.type === "upload" ? (
                  <Badge className="bg-blue-500">
                    <FileUp className="mr-1 h-3 w-3" />
                    Upload
                  </Badge>
                ) : (
                  <Badge className="bg-red-500">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Badge>
                )}
                <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                  <Clock className="mr-1 h-3 w-3" />
                  {proposal.timeRemaining} left
                </Badge>
              </div>
              <h1 className="text-2xl font-bold">{proposal.title}</h1>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Proposer: </span>
              <span className="ml-1">{proposal.proposer}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Created: </span>
              <span className="ml-1">{proposal.createdAt}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{proposal.description}</p>
          </div>

          {proposal.type === "upload" && (
            <div>
              <h3 className="text-lg font-medium mb-2">File Details</h3>
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileUp className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium">{proposal.fileDetails.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{proposal.fileDetails.size}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {proposal.type === "delete" && (
            <div>
              <h3 className="text-lg font-medium mb-2">Files to Delete</h3>
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-4">
                  <p className="font-medium mb-2">{proposal.fileDetails.name}</p>
                  <div className="space-y-2">
                    {proposal.fileDetails.fileIds.map((fileId) => (
                      <div key={fileId} className="flex items-center">
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{fileId}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Voting Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>For vs Against</span>
                  <span>
                    {proposal.votesFor} / {totalVotes} votes
                  </span>
                </div>
                <Progress value={forPercentage} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>For: {forPercentage.toFixed(1)}%</span>
                  <span>Against: {(100 - forPercentage).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quorum Progress</span>
                  <span>
                    {totalVotes} / {proposal.quorum} votes
                  </span>
                </div>
                <Progress value={quorumPercentage} className="h-2" />
                <div className="text-xs mt-1">{quorumPercentage.toFixed(1)}% of required votes</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <VoteButton proposalId={proposal.id} voteType="for" />
            <VoteButton proposalId={proposal.id} voteType="against" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

