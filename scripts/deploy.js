import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy StubZKVerifier
  const StubZKVerifier = await hre.ethers.getContractFactory("StubZKVerifier");
  const verifier = await StubZKVerifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("StubZKVerifier deployed to:", verifierAddress);

  // Deploy ZKRollupPayments
  const ZKRollupPayments = await hre.ethers.getContractFactory("ZKRollupPayments");
  const rollup = await ZKRollupPayments.deploy(verifierAddress, deployer.address);
  await rollup.waitForDeployment();
  const rollupAddress = await rollup.getAddress();
  console.log("ZKRollupPayments deployed to:", rollupAddress);

  // Add the deployer as a relayer
  const tx = await rollup.addRelayer(deployer.address);
  await tx.wait();
  console.log("Deployer added as relayer");

  // Save addresses to deployments/addresses.json
  const addresses = {
    StubZKVerifier: verifierAddress,
    ZKRollupPayments: rollupAddress
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Addresses saved to deployments/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
