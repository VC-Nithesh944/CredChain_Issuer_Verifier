const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();

  const contractAddress = await credentialRegistry.getAddress();
  console.log("CredentialRegistry deployed to:", contractAddress);

  // Register deployer as the first issuer
  const tx = await credentialRegistry.registerIssuer(deployer.address);
  await tx.wait();
  console.log("Registered deployer as an issuer");

  // Save contract config
  const contractConfig = {
    address: contractAddress,
    abi: credentialRegistry.interface.formatJson()
  };

  const configString = JSON.stringify(contractConfig, null, 2);

  const backendPath = path.join(__dirname, "../../backend/contractConfig.json");
  const issuerPath = path.join(__dirname, "../../issuer-portal/src/contractConfig.json");

  // Ensure directories exist
  fs.mkdirSync(path.dirname(backendPath), { recursive: true });
  fs.mkdirSync(path.dirname(issuerPath), { recursive: true });

  fs.writeFileSync(backendPath, configString);
  fs.writeFileSync(issuerPath, configString);

  console.log("Contract config saved to backend and issuer-portal");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
