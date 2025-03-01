import React from "react";
import { UploadFolder } from "../../../components/UploadFolder";

export default function UploadFolderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Folder</h1>
      <div className="max-w-xl mx-auto">
        <UploadFolder />
      </div>
    </div>
  );
}
