// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TraceChain
 * @notice Traçabilité de produits agricoles bio, de la parcelle au consommateur.
 *         Parcours : Producteur -> Coopérative -> Distributeur, lecture publique
 *         pour le consommateur (scan QR -> lecture on-chain).
 *
 * Rôles (gérés via OpenZeppelin AccessControl) :
 *  - DEFAULT_ADMIN_ROLE : le déployeur. Attribue les rôles métier.
 *  - PRODUCER_ROLE      : enregistre les produits, ajoute certifications, marque la récolte.
 *  - COOP_ROLE          : crée des lots, ajoute des contrôles qualité, initie les transferts.
 *  - DISTRIBUTOR_ROLE   : confirme la réception des lots.
 */
contract TraceChain is AccessControl {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant COOP_ROLE = keccak256("COOP_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    enum ProductStatus { Planted, Harvested, Batched }
    enum BatchStatus { Created, InTransit, Received }

    struct Product {
        string id;            // ex: "PROD-001"
        address producer;     // adresse du producteur
        string productType;   // ex: "Tomate"
        string variety;       // ex: "Coeur de boeuf"
        string origin;        // ex: "Parcelle A12, Nemours"
        string certification; // ex: "AB - FR-BIO-01" (vide tant que non ajoutée)
        ProductStatus status;
        uint256 createdAt;
        bool exists;
    }

    struct Batch {
        string id;            // ex: "LOT-001"
        address coop;         // coopérative ayant créé le lot
        string[] productIds;  // produits regroupés dans ce lot
        string qualityCheck;  // ex: "Visuel OK, pesticides 0" (vide au début)
        address distributor;  // destinataire prévu (0x0 tant qu'aucun transfert)
        BatchStatus status;
        uint256 createdAt;
        bool exists;
    }

    mapping(string => Product) private products;
    mapping(string => Batch) private batches;

    event ProductRegistered(string indexed productId, address indexed producer, string productType, uint256 timestamp);
    event CertificationAdded(string indexed productId, string certification, uint256 timestamp);
    event ProductHarvested(string indexed productId, uint256 timestamp);
    event BatchCreated(string indexed batchId, address indexed coop, uint256 productCount, uint256 timestamp);
    event QualityCheckAdded(string indexed batchId, string qualityCheck, uint256 timestamp);
    event TransferInitiated(string indexed batchId, address indexed coop, address indexed distributor, uint256 timestamp);
    event TransferConfirmed(string indexed batchId, address indexed distributor, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ----------------------------- PRODUCTEUR -----------------------------

    function registerProduct(
        string calldata productId,
        string calldata productType,
        string calldata variety,
        string calldata origin
    ) external onlyRole(PRODUCER_ROLE) {
        require(!products[productId].exists, "Produit deja enregistre");
        products[productId] = Product({
            id: productId,
            producer: msg.sender,
            productType: productType,
            variety: variety,
            origin: origin,
            certification: "",
            status: ProductStatus.Planted,
            createdAt: block.timestamp,
            exists: true
        });
        emit ProductRegistered(productId, msg.sender, productType, block.timestamp);
    }

    function addCertification(string calldata productId, string calldata certification)
        external
        onlyRole(PRODUCER_ROLE)
    {
        require(products[productId].exists, "Produit introuvable");
        require(products[productId].producer == msg.sender, "Pas le producteur de ce produit");
        products[productId].certification = certification;
        emit CertificationAdded(productId, certification, block.timestamp);
    }

    function markHarvested(string calldata productId) external onlyRole(PRODUCER_ROLE) {
        require(products[productId].exists, "Produit introuvable");
        require(products[productId].producer == msg.sender, "Pas le producteur de ce produit");
        products[productId].status = ProductStatus.Harvested;
        emit ProductHarvested(productId, block.timestamp);
    }

    // ---------------------------- COOPERATIVE -----------------------------

    function createBatch(string calldata batchId, string[] calldata productIds)
        external
        onlyRole(COOP_ROLE)
    {
        require(!batches[batchId].exists, "Lot deja existant");
        require(productIds.length > 0, "Lot vide");
        for (uint256 i = 0; i < productIds.length; i++) {
            require(products[productIds[i]].exists, "Produit du lot introuvable");
            products[productIds[i]].status = ProductStatus.Batched;
        }
        batches[batchId] = Batch({
            id: batchId,
            coop: msg.sender,
            productIds: productIds,
            qualityCheck: "",
            distributor: address(0),
            status: BatchStatus.Created,
            createdAt: block.timestamp,
            exists: true
        });
        emit BatchCreated(batchId, msg.sender, productIds.length, block.timestamp);
    }

    function addQualityCheck(string calldata batchId, string calldata qualityCheck)
        external
        onlyRole(COOP_ROLE)
    {
        require(batches[batchId].exists, "Lot introuvable");
        require(batches[batchId].coop == msg.sender, "Pas la coop de ce lot");
        batches[batchId].qualityCheck = qualityCheck;
        emit QualityCheckAdded(batchId, qualityCheck, block.timestamp);
    }

    function initiateTransfer(string calldata batchId, address distributor)
        external
        onlyRole(COOP_ROLE)
    {
        require(batches[batchId].exists, "Lot introuvable");
        require(batches[batchId].coop == msg.sender, "Pas la coop de ce lot");
        require(hasRole(DISTRIBUTOR_ROLE, distributor), "Destinataire non distributeur");
        require(batches[batchId].status == BatchStatus.Created, "Transfert deja initie");
        batches[batchId].distributor = distributor;
        batches[batchId].status = BatchStatus.InTransit;
        emit TransferInitiated(batchId, msg.sender, distributor, block.timestamp);
    }

    // ---------------------------- DISTRIBUTEUR ----------------------------

    function confirmReception(string calldata batchId) external onlyRole(DISTRIBUTOR_ROLE) {
        require(batches[batchId].exists, "Lot introuvable");
        require(batches[batchId].distributor == msg.sender, "Pas le destinataire de ce lot");
        require(batches[batchId].status == BatchStatus.InTransit, "Lot pas en transit");
        batches[batchId].status = BatchStatus.Received;
        emit TransferConfirmed(batchId, msg.sender, block.timestamp);
    }

    // ------------------------- LECTURE (PUBLIQUE) -------------------------

    function getProduct(string calldata productId) external view returns (Product memory) {
        require(products[productId].exists, "Produit introuvable");
        return products[productId];
    }

    function getBatch(string calldata batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "Lot introuvable");
        return batches[batchId];
    }
}
