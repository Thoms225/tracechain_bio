import { useState } from "react";
import { getSignedContract, readableError } from "./contract";

export default function ProducerPanel() {
  // --- Enregistrer un produit ---
  const [pId, setPId] = useState("");
  const [pType, setPType] = useState("");
  const [pVariety, setPVariety] = useState("");
  const [pOrigin, setPOrigin] = useState("");

  // --- Certification ---
  const [certId, setCertId] = useState("");
  const [cert, setCert] = useState("");

  // --- Récolte ---
  const [harvestId, setHarvestId] = useState("");

  const [status, setStatus] = useState(null); // { kind: "ok"|"err"|"pending", msg }

  async function run(action) {
    setStatus({ kind: "pending", msg: "Transaction en cours… confirme dans MetaMask." });
    try {
      const contract = await getSignedContract();
      const tx = await action(contract);
      await tx.wait(); // on attend que la transaction soit minée
      setStatus({ kind: "ok", msg: "Transaction confirmée et inscrite sur la blockchain." });
    } catch (e) {
      setStatus({ kind: "err", msg: readableError(e) });
    }
  }

  return (
    <section className="card">
      <span className="eyebrow">Espace producteur</span>
      <h3 className="panel-title">Enregistrer et certifier mes produits</h3>

      {status && <div className={"alert alert-" + status.kind}>{status.msg}</div>}

      {/* 1. Enregistrer un produit */}
      <fieldset className="block">
        <legend>1 · Nouveau produit</legend>
        <div className="grid">
          <input placeholder="Identifiant (ex: PROD-001)" value={pId} onChange={(e) => setPId(e.target.value)} />
          <input placeholder="Type (ex: Tomate)" value={pType} onChange={(e) => setPType(e.target.value)} />
          <input placeholder="Variété (ex: Coeur de boeuf)" value={pVariety} onChange={(e) => setPVariety(e.target.value)} />
          <input placeholder="Origine (ex: Parcelle A12, Nemours)" value={pOrigin} onChange={(e) => setPOrigin(e.target.value)} />
        </div>
        <button
          className="btn"
          disabled={!pId || !pType}
          onClick={() => run((c) => c.registerProduct(pId, pType, pVariety, pOrigin))}
        >
          Enregistrer le produit
        </button>
      </fieldset>

      {/* 2. Ajouter une certification */}
      <fieldset className="block">
        <legend>2 · Ajouter une certification</legend>
        <div className="grid">
          <input placeholder="Identifiant produit (ex: PROD-001)" value={certId} onChange={(e) => setCertId(e.target.value)} />
          <input placeholder="Certification (ex: AB - FR-BIO-01)" value={cert} onChange={(e) => setCert(e.target.value)} />
        </div>
        <button
          className="btn"
          disabled={!certId || !cert}
          onClick={() => run((c) => c.addCertification(certId, cert))}
        >
          Ajouter la certification
        </button>
      </fieldset>

      {/* 3. Marquer la récolte */}
      <fieldset className="block">
        <legend>3 · Marquer comme récolté</legend>
        <div className="grid">
          <input placeholder="Identifiant produit (ex: PROD-001)" value={harvestId} onChange={(e) => setHarvestId(e.target.value)} />
        </div>
        <button
          className="btn"
          disabled={!harvestId}
          onClick={() => run((c) => c.markHarvested(harvestId))}
        >
          Marquer récolté
        </button>
      </fieldset>
    </section>
  );
}
