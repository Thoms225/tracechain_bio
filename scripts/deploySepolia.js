const { ethers } = require("hardhat");

/**
 * Déploiement sur un réseau public (Sepolia).
 *
 * Différence clé avec le déploiement local : ici il n'existe qu'UN seul compte
 * (celui de la PRIVATE_KEY du .env). On lui attribue donc les quatre rôles, afin
 * qu'un unique wallet puisse incarner successivement producteur, coopérative et
 * distributeur pendant la démo.
 *
 * Lancement :
 *   npx hardhat run scripts/deploySepolia.js --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Déploiement avec le compte :", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Solde :", ethers.formatEther(balance), "ETH");
  if (balance === 0n) {
    throw new Error(
      "Solde nul sur Sepolia. Alimente ce compte via un faucet Sepolia avant de déployer."
    );
  }

  const TraceChain = await ethers.getContractFactory("TraceChain");
  const traceChain = await TraceChain.deploy();
  await traceChain.waitForDeployment();
  const address = await traceChain.getAddress();

  const PRODUCER_ROLE = await traceChain.PRODUCER_ROLE();
  const COOP_ROLE = await traceChain.COOP_ROLE();
  const DISTRIBUTOR_ROLE = await traceChain.DISTRIBUTOR_ROLE();

  // On attend chaque transaction (réseau public = blocs plus lents qu'en local).
  console.log("Attribution des rôles au compte déployeur…");
  await (await traceChain.grantRole(PRODUCER_ROLE, deployer.address)).wait();
  await (await traceChain.grantRole(COOP_ROLE, deployer.address)).wait();
  await (await traceChain.grantRole(DISTRIBUTOR_ROLE, deployer.address)).wait();

  console.log("======================================================");
  console.log("TraceChain déployé sur SEPOLIA");
  console.log("Adresse du contrat :", address);
  console.log("Compte (4 rôles)   :", deployer.address);
  console.log("Etherscan          : https://sepolia.etherscan.io/address/" + address);
  console.log("======================================================");
  console.log(">> Copie l'adresse du contrat dans frontend/src/contractInfo.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});