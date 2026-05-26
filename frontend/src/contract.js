import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./contractInfo";

/**
 * Retourne une instance du contrat connectée au SIGNER (compte MetaMask actif).
 * À utiliser pour toute action qui MODIFIE l'état (registerProduct, createBatch...),
 * car ces opérations doivent être signées et envoyées comme transactions.
 */
export async function getSignedContract() {
  if (!window.ethereum) throw new Error("MetaMask non détecté.");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, ABI, signer);
}

/**
 * Retourne une instance en LECTURE SEULE (provider, pas de signer).
 * À utiliser pour getProduct / getBatch / lecture d'events : pas de signature,
 * pas de frais, pas de pop-up MetaMask.
 */
export async function getReadContract() {
  if (!window.ethereum) throw new Error("MetaMask non détecté.");
  const provider = new BrowserProvider(window.ethereum);
  return new Contract(CONTRACT_ADDRESS, ABI, provider);
}

/**
 * Traduit une erreur de transaction en message lisible pour l'utilisateur.
 * Les "require(...)" du contrat remontent dans error.reason via ethers v6.
 */
export function readableError(e) {
  return e?.reason || e?.shortMessage || e?.message || "Transaction échouée.";
}