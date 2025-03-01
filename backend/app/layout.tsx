import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decentralized Collaborative File Repository DAO",
  description:
    "Decentralized Collaborative File Repository with DAO governance",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}

import "./globals.css";
