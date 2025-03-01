import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { config } from "./config";
import FaucetABI from "./contracts/Faucet.json";

const FAUCET_ADDRESS = config.faucet.address;
const FAUCET_ABI = FaucetABI.abi;

export class FaucetService {
  private contract: ethers.Contract | null = null;
  private provider: BrowserProvider | null = null;

  async initialize(provider: BrowserProvider) {
    try {
      this.provider = provider;
      const signer = await provider.getSigner();
      this.contract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);

      // Verify contract is accessible
      const code = await provider.getCode(FAUCET_ADDRESS);
      if (code === "0x") {
        throw new Error("No contract deployed at the specified address");
      }
    } catch (error: any) {
      console.error("Initialization error:", error);
      throw new Error(`Failed to initialize contract: ${error.message}`);
    }
  }

  async requestTokens() {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const signer = await this.provider!.getSigner();
      const address = await signer.getAddress();
      console.log("Requesting tokens for address:", address);

      const tx = await this.contract.requestTokens(address);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      return true;
    } catch (error: any) {
      console.error("Request tokens error:", error);

      // Handle known error types
      if (error.data === "0xe783a481") {
        throw new Error(
          "Please wait for the cooldown period to end before requesting tokens again"
        );
      } else if (error.data === "0x9f0d572f") {
        throw new Error("Faucet is empty. Please try again later");
      } else if (error.data === "0xf4b3d060") {
        throw new Error("Failed to send tokens. Please try again");
      }

      throw new Error(`Failed to request tokens: ${error.message}`);
    }
  }

  async getNextAccessTime(address: string) {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      console.log("Checking next access time for:", address);
      const nextTime = await this.contract.nextAccessTime(address);
      console.log("Next access time response:", nextTime);

      // Handle the case where nextTime might be undefined or null
      if (!nextTime) return "0";

      return nextTime.toString();
    } catch (error: any) {
      console.error("Get next access time error:", error);
      // Return 0 to indicate no cooldown if there's an error
      return "0";
    }
  }

  async getWithdrawalAmount() {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      console.log("Getting withdrawal amount");
      const amount = await this.contract.withdrawalAmount();
      console.log("Withdrawal amount response:", amount);

      // Handle the case where amount might be undefined or null
      if (!amount) return "0";

      return amount.toString();
    } catch (error: any) {
      console.error("Get withdrawal amount error:", error);
      // Return 0 if there's an error
      return "0";
    }
  }
}
