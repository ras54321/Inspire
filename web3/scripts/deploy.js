const hre = require("hardhat");

async function main() {
  console.log("Deploying SocialMediaDapp...");

  // Get the contract factory
  const SocialMediaDapp = await hre.ethers.getContractFactory("SocialMediaDapp");

  // Deploy the contract
  const socialMediaDapp = await SocialMediaDapp.deploy();

  // Wait for deployment to complete
  await socialMediaDapp.deployed();

  console.log("SocialMediaDapp deployed to:", socialMediaDapp.address);
  console.log("Network:", hre.network.name);
  
  // Get the transaction receipt for more details
  const receipt = await socialMediaDapp.deployTransaction.wait();
  console.log("Transaction hash:", receipt.transactionHash);

  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${socialMediaDapp.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
