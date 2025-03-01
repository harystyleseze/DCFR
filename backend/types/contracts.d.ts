declare module "*.json" {
  const value: {
    abi: {
      inputs: {
        internalType: string;
        name: string;
        type: string;
      }[];
      name: string;
      outputs?: {
        internalType: string;
        name: string;
        type: string;
      }[];
      stateMutability: string;
      type: string;
    }[];
  };
  export default value;
}
