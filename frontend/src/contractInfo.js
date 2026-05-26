// Adresse du contrat déployé sur ta blockchain locale Hardhat.
// C'est l'adresse renvoyée par scripts/deploy.js (premier contrat d'un nœud neuf).
// Si tu redéploies sur une chaîne déjà utilisée, cette adresse peut changer :
// dans ce cas, remplace-la par la nouvelle valeur affichée par le script.
export const CONTRACT_ADDRESS = "0x152F9caFf20b70531d648EBf90C9236D143290da";

// ABI exacte du contrat TraceChain (générée à la compilation, ne pas modifier à la main).
export const ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "AccessControlBadConfirmation", "type": "error" },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "bytes32", "name": "neededRole", "type": "bytes32" }
    ],
    "name": "AccessControlUnauthorizedAccount", "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "coop", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "productCount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "BatchCreated", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "productId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "certification", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CertificationAdded", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "productId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ProductHarvested", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "productId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "producer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "productType", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ProductRegistered", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "qualityCheck", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "QualityCheckAdded", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32" }
    ],
    "name": "RoleAdminChanged", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "account", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "RoleGranted", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "account", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "RoleRevoked", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "distributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TransferConfirmed", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "batchId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "coop", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "distributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TransferInitiated", "type": "event"
  },
  {
    "inputs": [], "name": "COOP_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "DISTRIBUTOR_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [], "name": "PRODUCER_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "productId", "type": "string" },
      { "internalType": "string", "name": "certification", "type": "string" }
    ],
    "name": "addCertification", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "batchId", "type": "string" },
      { "internalType": "string", "name": "qualityCheck", "type": "string" }
    ],
    "name": "addQualityCheck", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "batchId", "type": "string" }],
    "name": "confirmReception", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "batchId", "type": "string" },
      { "internalType": "string[]", "name": "productIds", "type": "string[]" }
    ],
    "name": "createBatch", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "batchId", "type": "string" }],
    "name": "getBatch",
    "outputs": [{
      "components": [
        { "internalType": "string", "name": "id", "type": "string" },
        { "internalType": "address", "name": "coop", "type": "address" },
        { "internalType": "string[]", "name": "productIds", "type": "string[]" },
        { "internalType": "string", "name": "qualityCheck", "type": "string" },
        { "internalType": "address", "name": "distributor", "type": "address" },
        { "internalType": "enum TraceChain.BatchStatus", "name": "status", "type": "uint8" },
        { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
        { "internalType": "bool", "name": "exists", "type": "bool" }
      ],
      "internalType": "struct TraceChain.Batch", "name": "", "type": "tuple"
    }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "productId", "type": "string" }],
    "name": "getProduct",
    "outputs": [{
      "components": [
        { "internalType": "string", "name": "id", "type": "string" },
        { "internalType": "address", "name": "producer", "type": "address" },
        { "internalType": "string", "name": "productType", "type": "string" },
        { "internalType": "string", "name": "variety", "type": "string" },
        { "internalType": "string", "name": "origin", "type": "string" },
        { "internalType": "string", "name": "certification", "type": "string" },
        { "internalType": "enum TraceChain.ProductStatus", "name": "status", "type": "uint8" },
        { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
        { "internalType": "bool", "name": "exists", "type": "bool" }
      ],
      "internalType": "struct TraceChain.Product", "name": "", "type": "tuple"
    }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }],
    "name": "getRoleAdmin",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "hasRole",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "batchId", "type": "string" },
      { "internalType": "address", "name": "distributor", "type": "address" }
    ],
    "name": "initiateTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "productId", "type": "string" }],
    "name": "markHarvested", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "productId", "type": "string" },
      { "internalType": "string", "name": "productType", "type": "string" },
      { "internalType": "string", "name": "variety", "type": "string" },
      { "internalType": "string", "name": "origin", "type": "string" }
    ],
    "name": "registerProduct", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "callerConfirmation", "type": "address" }
    ],
    "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
    "name": "supportsInterface",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view", "type": "function"
  }
];