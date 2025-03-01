import { useEffect, useState } from "react";
import { ContractService } from "@/lib/contract";
import { BrowserProvider } from "ethers";

export function useMembership(address: string | null) {
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      if (address && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const contractService = new ContractService();
          await contractService.initialize(provider);
          const memberStatus = await contractService.isMember(address);
          setIsMember(memberStatus);
        } catch (error) {
          console.error("Error checking membership:", error);
          setIsMember(false);
        }
      }
    };

    checkMembership();
  }, [address]);

  return { isMember };
}
