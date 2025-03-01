"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { FileUp, Loader2 } from "lucide-react"

type ProposalFormProps = {
  type: "upload" | "delete"
}

export function ProposalForm({ type }: ProposalFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Proposal submitted",
        description: "Your proposal has been submitted for voting.",
      })
      router.push("/")
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Proposal Title</Label>
        <Input id="title" placeholder="Enter a descriptive title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Explain why this file should be uploaded/deleted" rows={4} required />
      </div>

      {type === "upload" && (
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            {file ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">{file.name}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop a file, or click to select</p>
                <Input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0])
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("file")?.click()}>
                  Select File
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {type === "delete" && (
        <div className="space-y-2">
          <Label htmlFor="fileId">File ID to Delete</Label>
          <Input id="fileId" placeholder="Enter the file ID" required />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="votingPeriod">Voting Period (days)</Label>
        <Input id="votingPeriod" type="number" min="1" max="30" defaultValue="7" required />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Proposal"
        )}
      </Button>
    </form>
  )
}

