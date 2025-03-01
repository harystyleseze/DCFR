import React, { useState } from "react";
import { Button } from "./ui/button";
import { useWallet } from "../hooks/useWallet";
import { shortenAddress } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function WalletConnect() {
  const {
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    isCorrectNetwork,
  } = useWallet();

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button variant="destructive" onClick={connect}>
          {error}
        </Button>
      </div>
    );
  }

  if (address && !isCorrectNetwork) {
    return (
      <Button variant="outline" className="text-yellow-600" onClick={connect}>
        Switch to Autonomys Network
      </Button>
    );
  }

  if (address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{shortenAddress(address)}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={disconnect}
            className="text-red-600 cursor-pointer"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={connect} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
