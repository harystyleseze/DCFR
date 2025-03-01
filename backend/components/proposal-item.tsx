import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileUp, Trash2, Clock, ArrowRight } from "lucide-react"
import { VoteButton } from "./vote-button"

type Proposal = {
  id: string
  title: string
  description: string
  type: "upload" | "delete"
  proposer: string
  votesFor: number
  votesAgainst: number
  status: "active" | "passed" | "rejected"
  timeRemaining: string
  createdAt: string
}

type ProposalItemProps = {
  proposal: Proposal
}

export function ProposalItem({ proposal }: ProposalItemProps) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
            <h3 className="text-lg font-semibold">{proposal.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            {proposal.timeRemaining} left
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{proposal.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>For: {proposal.votesFor}</span>
            <span>Against: {proposal.votesAgainst}</span>
          </div>
          <Progress value={forPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <VoteButton proposalId={proposal.id} voteType="for" />
          <VoteButton proposalId={proposal.id} voteType="against" />
        </div>
        <Link href={`/proposals/${proposal.id}`}>
          <Button variant="ghost" className="text-primary hover:text-primary/90 hover:bg-primary/10">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

