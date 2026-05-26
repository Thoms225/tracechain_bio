require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ quiet: true });

// La clé privée est stockée SANS le préfixe 0x dans le .env (format PresaleVault).
// On le rajoute ici pour qu'ethers/Hardhat l'accepte.
const PRIVATE_KEY = process.env.PRIVATE_KEY ? "0x" + process.env.PRIVATE_KEY : "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    // Réseau de test public Ethereum.
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};