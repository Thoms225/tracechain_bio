import { useState } from "react";
import { getSignedContract, readableError } from "./contract";

export default function DistributorPanel() {
  const [batchId, setBatchId] = useState("");
  const [status, setStatus] = useState(null);

  async function confirm() {
    setStatus({ kind: "pending", msg: "Transaction en cours… confirme dans MetaMask." });
    try {
      const contract = await getSignedContract();
      const tx = await contract.confirmReception(batchId);
      await tx.wait();
      setStatus({ kind: "ok", msg: "Réception confirmée. Le lot est marqué « reçu » sur la blockchain." });
    } catch (e) {
      setStatus({ kind: "err", msg: readableError(e) });
    }
  }

  return (
    <section className="card">
      <span className="eyebrow">Espace distributeur</span>
      <h3 className="panel-title">Confirmer la réception des lots</h3>

      {status && <div className={"alert alert-" + status.kind}>{status.msg}</div>}

      <fieldset className="block">
        <legend>Réception d'un lot</legend>
        <div className="grid">
          <input placeholder="Identifiant du lot (ex: LOT-001)" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
        </div>
        <button className="btn" disabled={!batchId} onClick={confirm}>
          Confirmer la réception
        </button>
        <p className="hint">
          Seul le distributeur désigné lors du transfert peut confirmer, et seulement si le lot
          est en transit.
        </p>
      </fieldset>
    </section>
  );
}
