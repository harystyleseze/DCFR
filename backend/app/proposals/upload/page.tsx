import React from "react";
import { UploadProposal } from "../../../components/UploadProposal";

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Proposal</h1>
      <div className="max-w-xl mx-auto">
        <UploadProposal />
      </div>
    </div>
  );
}
