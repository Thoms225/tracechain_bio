const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TraceChain", function () {
  let traceChain;
  let admin, producer, coop, distributor, autre;
  let PRODUCER_ROLE, COOP_ROLE, DISTRIBUTOR_ROLE;

  beforeEach(async function () {
    [admin, producer, coop, distributor, autre] = await ethers.getSigners();

    const TraceChain = await ethers.getContractFactory("TraceChain");
    traceChain = await TraceChain.deploy();
    await traceChain.waitForDeployment();

    // Les constantes de rôle sont lues directement depuis le contrat.
    PRODUCER_ROLE = await traceChain.PRODUCER_ROLE();
    COOP_ROLE = await traceChain.COOP_ROLE();
    DISTRIBUTOR_ROLE = await traceChain.DISTRIBUTOR_ROLE();

    // L'admin (déployeur) attribue les rôles métier.
    await traceChain.grantRole(PRODUCER_ROLE, producer.address);
    await traceChain.grantRole(COOP_ROLE, coop.address);
    await traceChain.grantRole(DISTRIBUTOR_ROLE, distributor.address);
  });

  it("permet a un producteur d'enregistrer un produit", async function () {
    await expect(
      traceChain
        .connect(producer)
        .registerProduct("PROD-001", "Tomate", "Coeur de boeuf", "Parcelle A12, Nemours")
    ).to.emit(traceChain, "ProductRegistered");

    const p = await traceChain.getProduct("PROD-001");
    expect(p.producer).to.equal(producer.address);
    expect(p.productType).to.equal("Tomate");
    expect(p.status).to.equal(0n); // ProductStatus.Planted
  });

  it("refuse l'enregistrement par une adresse sans le role producteur", async function () {
    await expect(
      traceChain
        .connect(autre)
        .registerProduct("PROD-002", "Carotte", "Nantaise", "Parcelle B3")
    ).to.be.reverted; // AccessControl : adresse non autorisée
  });

  it("deroule le parcours complet producteur -> coop -> distributeur", async function () {
    await traceChain
      .connect(producer)
      .registerProduct("PROD-001", "Tomate", "Coeur de boeuf", "Parcelle A12");
    await traceChain.connect(producer).addCertification("PROD-001", "AB - FR-BIO-01");
    await traceChain.connect(producer).markHarvested("PROD-001");

    await traceChain.connect(coop).createBatch("LOT-001", ["PROD-001"]);
    await traceChain.connect(coop).addQualityCheck("LOT-001", "Visuel OK, pesticides 0");
    await traceChain.connect(coop).initiateTransfer("LOT-001", distributor.address);

    await traceChain.connect(distributor).confirmReception("LOT-001");

    const b = await traceChain.getBatch("LOT-001");
    expect(b.status).to.equal(2n); // BatchStatus.Received
    expect(b.distributor).to.equal(distributor.address);
    expect(b.productIds.length).to.equal(1);
    expect(b.qualityCheck).to.equal("Visuel OK, pesticides 0");
  });

  it("empeche une adresse non destinataire de confirmer la reception", async function () {
    await traceChain
      .connect(producer)
      .registerProduct("PROD-001", "Tomate", "CdB", "Parcelle A12");
    await traceChain.connect(coop).createBatch("LOT-001", ["PROD-001"]);
    await traceChain.connect(coop).initiateTransfer("LOT-001", distributor.address);

    // 'autre' n'a pas le role distributeur -> rejeté par onlyRole.
    await expect(traceChain.connect(autre).confirmReception("LOT-001")).to.be.reverted;
  });

  it("refuse de creer un lot avec un produit inexistant", async function () {
    await expect(
      traceChain.connect(coop).createBatch("LOT-002", ["PROD-INEXISTANT"])
    ).to.be.revertedWith("Produit du lot introuvable");
  });
}); 