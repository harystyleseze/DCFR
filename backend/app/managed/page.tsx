"use client";

import React, { useState, useCallback } from "react";
import { FileList } from "@/components/file-list";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

export default function ManagedFilesPage() {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTotalPagesChange = useCallback((pages: number) => {
    setTotalPages(pages);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Managed Files</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage all your decentralized files
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <FileList 
          showAll={true}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onTotalPagesChange={handleTotalPagesChange}
          onLoadingChange={handleLoadingChange}
          viewMode="table"
        />
      </div>
      
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
} 