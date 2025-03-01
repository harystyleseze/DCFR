const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "tAI3");

    // Deploy FileDAO
    const FileDAO = await hre.ethers.getContractFactory("FileDAO");
    console.log("Deploying FileDAO...");
    const fileDAO = await FileDAO.deploy();
    await fileDAO.waitForDeployment();

    const address = await fileDAO.getAddress();
    console.log("FileDAO deployed to:", address);

    // Get network information
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network:", network.name, "(chainId:", network.chainId, ")");

    // Wait for confirmations and verify if on Autonomys network
    if (network.chainId === 490000) {
      console.log("Waiting for block confirmations...");
      const CONFIRMATIONS = 5;
      await fileDAO.deployTransaction.wait(CONFIRMATIONS);

      try {
        console.log("Verifying contract on Blockscout...");
        await hre.run("verify:verify", {
          address: address,
          constructorArguments: [],
          network: "autonomys",
        });
        console.log("Contract verified successfully");
      } catch (error) {
        console.log("Verification failed:", error.message);
      }
    }

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("Network: Autonomys EVM");
    console.log("Contract Address:", address);
    console.log("Deployer Address:", deployer.address);
    console.log("Block Explorer:", process.env.BLOCKSCOUT_URL);
    console.log("\nVerify Contract URL:");
    console.log(`${process.env.BLOCKSCOUT_URL}address/${address}#code`);
  } catch (error) {
    console.error("\nError during deployment:");
    console.error(error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
