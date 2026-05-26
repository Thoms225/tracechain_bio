import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./contractInfo";
import ProducerPanel from "./ProducerPanel";
import CoopPanel from "./CoopPanel";
import DistributorPanel from "./DistributorPanel";
import ConsumerView from "./ConsumerView";
import "./App.css";

const EXPECTED_CHAIN_ID = 11155111n; // chainId de Sepolia

export default function App() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [roles, setRoles] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function connect() {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask n'est pas détecté. Installe l'extension puis recharge la page.");
      return;
    }
    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setAccount(address);
      setChainId(network.chainId);

      if (network.chainId === EXPECTED_CHAIN_ID) {
        await loadRoles(provider, address);
      } else {
        setRoles(null);
      }
    } catch (e) {
      setError(e.shortMessage || e.message || "Connexion refusée.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles(provider, address) {
    const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
    const [adminRole, producerRole, coopRole, distributorRole] = await Promise.all([
      contract.DEFAULT_ADMIN_ROLE(),
      contract.PRODUCER_ROLE(),
      contract.COOP_ROLE(),
      contract.DISTRIBUTOR_ROLE(),
    ]);
    const [isAdmin, isProducer, isCoop, isDistributor] = await Promise.all([
      contract.hasRole(adminRole, address),
      contract.hasRole(producerRole, address),
      contract.hasRole(coopRole, address),
      contract.hasRole(distributorRole, address),
    ]);
    setRoles({ isAdmin, isProducer, isCoop, isDistributor });
  }

  useEffect(() => {
    if (!window.ethereum) return;
    const reload = () => window.location.reload();
    window.ethereum.on("accountsChanged", reload);
    window.ethereum.on("chainChanged", reload);
    return () => {
      window.ethereum.removeListener("accountsChanged", reload);
      window.ethereum.removeListener("chainChanged", reload);
    };
  }, []);

  const wrongNetwork = account && chainId !== EXPECTED_CHAIN_ID;
  const noRole =
    roles && !roles.isAdmin && !roles.isProducer && !roles.isCoop && !roles.isDistributor;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◇</span>
          <div>
            <h1>TraceChain</h1>
            <p className="tagline">Traçabilité bio, de la parcelle au consommateur</p>
          </div>
        </div>
        {account ? (
          <div className="account-pill" title={account}>
            {account.slice(0, 6)}…{account.slice(-4)}
          </div>
        ) : (
          <button className="btn" onClick={connect} disabled={loading}>
            {loading ? "Connexion…" : "Connecter MetaMask"}
          </button>
        )}
      </header>

      <main className="content">
        {error && <div className="alert alert-err">{error}</div>}

        {!account && (
          <section className="card hero">
            <h2>Connecte ton portefeuille pour commencer</h2>
            <p>
              Cette interface lit les rôles directement sur la blockchain. Connecte un compte
              de test importé dans MetaMask pour voir quel acteur de la filière tu incarnes.
            </p>
          </section>
        )}

        {wrongNetwork && (
          <div className="alert alert-warn">
            Mauvais réseau (chainId&nbsp;{chainId?.toString()}). Bascule MetaMask sur le réseau
            «&nbsp;Hardhat Local&nbsp;» (chainId&nbsp;31337).
          </div>
        )}

        {account && !wrongNetwork && roles && (
          <>
            <section className="card">
              <span className="eyebrow">Compte connecté</span>
              <p className="mono address">{account}</p>
              <h3>Rôles détectés on-chain</h3>
              <div className="badges">
                <RoleBadge active={roles.isAdmin} label="Admin" />
                <RoleBadge active={roles.isProducer} label="Producteur" />
                <RoleBadge active={roles.isCoop} label="Coopérative" />
                <RoleBadge active={roles.isDistributor} label="Distributeur" />
              </div>
              {noRole && (
                <p className="muted">
                  Ce compte ne porte aucun rôle. Importe l'un des comptes #0 à #3 affichés par ton
                  nœud Hardhat (ce sont eux qui ont reçu les rôles au déploiement).
                </p>
              )}
            </section>

            {roles.isProducer && <ProducerPanel />}
            {roles.isCoop && <CoopPanel />}
            {roles.isDistributor && <DistributorPanel />}
          </>
        )}

        {/* La vérification consommateur est publique : toujours visible. */}
        {account && !wrongNetwork && <ConsumerView />}
      </main>

      <footer className="footer">
        Prototype — PTT Mastère Spécialisé Blockchain Strategy
      </footer>
    </div>
  );
}

function RoleBadge({ active, label }) {
  return (
    <span className={"badge " + (active ? "badge-on" : "badge-off")}>
      <span className="dot" />
      {label}
    </span>
  );
}

