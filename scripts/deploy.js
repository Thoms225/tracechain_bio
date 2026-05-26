const { ethers } = require("hardhat");

/**
 * Déploie TraceChain et attribue les rôles métier aux comptes de test
 * fournis par le noeud Hardhat local.
 *
 *   compte #0 -> Admin (déployeur)
 *   compte #1 -> Producteur
 *   compte #2 -> Coopérative
 *   compte #3 -> Distributeur
 *
 * Lancement (avec un noeud `npx hardhat node` déjà démarré dans un autre terminal) :
 *   npx hardhat run scripts/deploy.js --network localhost
 */
async function main() {
  const [admin, producer, coop, distributor] = await ethers.getSigners();

  const TraceChain = await ethers.getContractFactory("TraceChain");
  const traceChain = await TraceChain.deploy();
  await traceChain.waitForDeployment();
  const address = await traceChain.getAddress();

  const PRODUCER_ROLE = await traceChain.PRODUCER_ROLE();
  const COOP_ROLE = await traceChain.COOP_ROLE();
  const DISTRIBUTOR_ROLE = await traceChain.DISTRIBUTOR_ROLE();

  await (await traceChain.grantRole(PRODUCER_ROLE, producer.address)).wait();
  await (await traceChain.grantRole(COOP_ROLE, coop.address)).wait();
  await (await traceChain.grantRole(DISTRIBUTOR_ROLE, distributor.address)).wait();

  console.log("======================================================");
  console.log("TraceChain deploye a l'adresse : ", address);
  console.log("------------------------------------------------------");
  console.log("Admin        (compte #0) :", admin.address);
  console.log("Producteur   (compte #1) :", producer.address);
  console.log("Cooperative  (compte #2) :", coop.address);
  console.log("Distributeur (compte #3) :", distributor.address);
  console.log("======================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});