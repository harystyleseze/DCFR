"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ThumbsDown, ThumbsUp } from "lucide-react"

type VoteButtonProps = {
  proposalId: string
  voteType: "for" | "against"
}

export function VoteButton({ proposalId, voteType }: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const { toast } = useToast()

  const handleVote = async () => {
    setIsVoting(true)

    // Simulate API call
    setTimeout(() => {
      setIsVoting(false)
      setHasVoted(true)

      toast({
        title: "Vote recorded",
        description: `You voted ${voteType === "for" ? "for" : "against"} proposal #${proposalId}`,
      })
    }, 1000)
  }

  if (voteType === "for") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 ${hasVoted ? "bg-green-50 dark:bg-green-900/20" : ""}`}
        onClick={handleVote}
        disabled={isVoting || hasVoted}
      >
        <ThumbsUp className="mr-1 h-4 w-4" />
        {hasVoted ? "Voted" : "Vote For"}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${hasVoted ? "bg-red-50 dark:bg-red-900/20" : ""}`}
      onClick={handleVote}
      disabled={isVoting || hasVoted}
    >
      <ThumbsDown className="mr-1 h-4 w-4" />
      {hasVoted ? "Voted" : "Vote Against"}
    </Button>
  )
}

