"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { Menu, X } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { FaucetButton } from "./FaucetButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">DCFR DAO</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/proposals/upload"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
            >
              Upload File
            </Link>
            <Link
              href="/proposals/upload-folder"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
            >
              Upload Folder
            </Link>
            <Link
              href="/proposals/delete"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
            >
              Delete
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <ModeToggle />
            <FaucetButton />
            <WalletConnect />
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <ModeToggle />
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/proposals/upload"
              className="block text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Upload File
            </Link>
            <Link
              href="/proposals/upload-folder"
              className="block text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Upload Folder
            </Link>
            <Link
              href="/proposals/delete"
              className="block text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Delete
            </Link>
            <div className="flex items-center space-x-2">
              <FaucetButton />
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
