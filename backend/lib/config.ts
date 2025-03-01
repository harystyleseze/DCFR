export const config = {
  autoDrive: {
    apiKey: process.env.NEXT_PUBLIC_AUTO_DRIVE_API_KEY || "",
    network: "taurus" as const,
  },
  contract: {
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
    network: {
      chainId: 490000,
      name: "Autonomys EVM",
      rpcUrl: "https://auto-evm-0.taurus.subspace.network/ws",
      blockExplorer: "https://blockscout.taurus.autonomys.xyz/",
    },
  },
  faucet: {
    address: "0x2296dbb90C714c1355Ff9cbcB70D5AB29060b454",
  },
};
