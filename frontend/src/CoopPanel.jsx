import { useState } from "react";
import { BrowserProvider } from "ethers";
import { getSignedContract, readableError } from "./contract";
import LotQRCode from "./LotQRCode";

export default function CoopPanel() {
  // Créer un lot
  const [batchId, setBatchId] = useState("");
  const [productIds, setProductIds] = useState(""); // saisie : "PROD-001, PROD-002"

  // Contrôle qualité
  const [qcBatchId, setQcBatchId] = useState("");
  const [qc, setQc] = useState("");

  // Transfert
  const [trBatchId, setTrBatchId] = useState("");
  const [distributor, setDistributor] = useState("");

  const [status, setStatus] = useState(null);
  // Dernier lot créé avec succès -> on affiche son QR de traçabilité.
  const [createdBatch, setCreatedBatch] = useState(null);

  async function run(action) {
    setStatus({ kind: "pending", msg: "Transaction en cours… confirme dans MetaMask." });
    try {
      const contract = await getSignedContract();
      const tx = await action(contract);
      await tx.wait();
      setStatus({ kind: "ok", msg: "Transaction confirmée et inscrite sur la blockchain." });
      return true;
    } catch (e) {
      setStatus({ kind: "err", msg: readableError(e) });
      return false;
    }
  }

  async function createBatch() {
    const ok = await run((c) => c.createBatch(batchId, parseIds(productIds)));
    if (ok) setCreatedBatch(batchId); // affiche le QR seulement si la création a réussi
  }

  async function useMyAddress() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setDistributor(await signer.getAddress());
    } catch (e) {
      setStatus({ kind: "err", msg: readableError(e) });
    }
  }

  function parseIds(raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  return (
    <section className="card">
      <span className="eyebrow">Espace coopérative</span>
      <h3 className="panel-title">Constituer des lots et organiser les transferts</h3>

      {status && <div className={"alert alert-" + status.kind}>{status.msg}</div>}

      <fieldset className="block">
        <legend>1 · Créer un lot</legend>
        <div className="grid">
          <input placeholder="Identifiant du lot (ex: LOT-001)" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
          <input placeholder="Produits, séparés par des virgules (ex: PROD-001, PROD-002)" value={productIds} onChange={(e) => setProductIds(e.target.value)} />
        </div>
        <button className="btn" disabled={!batchId || !productIds} onClick={createBatch}>
          Créer le lot
        </button>

        {createdBatch && <LotQRCode batchId={createdBatch} />}
      </fieldset>

      <fieldset className="block">
        <legend>2 · Ajouter un contrôle qualité</legend>
        <div className="grid">
          <input placeholder="Identifiant du lot (ex: LOT-001)" value={qcBatchId} onChange={(e) => setQcBatchId(e.target.value)} />
          <input placeholder="Contrôle (ex: Visuel OK, pesticides 0)" value={qc} onChange={(e) => setQc(e.target.value)} />
        </div>
        <button
          className="btn"
          disabled={!qcBatchId || !qc}
          onClick={() => run((c) => c.addQualityCheck(qcBatchId, qc))}
        >
          Enregistrer le contrôle
        </button>
      </fieldset>

      <fieldset className="block">
        <legend>3 · Transférer vers un distributeur</legend>
        <div className="grid">
          <input placeholder="Identifiant du lot (ex: LOT-001)" value={trBatchId} onChange={(e) => setTrBatchId(e.target.value)} />
          <input placeholder="Adresse du distributeur (0x...)" value={distributor} onChange={(e) => setDistributor(e.target.value)} />
        </div>
        <div className="row-actions">
          <button
            className="btn"
            disabled={!trBatchId || !distributor}
            onClick={() => run((c) => c.initiateTransfer(trBatchId, distributor))}
          >
            Initier le transfert
          </button>
          <button className="btn-ghost" type="button" onClick={useMyAddress}>
            Utiliser mon adresse
          </button>
        </div>
        <p className="hint">
          Le destinataire doit posséder le rôle distributeur. En démo, le compte connecté
          porte généralement aussi ce rôle : « Utiliser mon adresse » le renseigne pour toi.
        </p>
      </fieldset>
    </section>
  );
}
