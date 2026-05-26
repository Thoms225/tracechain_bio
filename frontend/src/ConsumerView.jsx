import { useState, useEffect, useCallback } from "react";
import { getReadContract, readableError } from "./contract";

const PRODUCT_STATUS = ["Planté", "Récolté", "Mis en lot"];
const BATCH_STATUS = ["Créé", "En transit", "Reçu"];

function fmt(ts) {
  return new Date(Number(ts) * 1000).toLocaleString("fr-FR");
}

function shortAddr(a) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export default function ConsumerView() {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState(null);
  const [products, setProducts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // useCallback : la fonction accepte un id explicite pour pouvoir être
  // appelée soit par le bouton (avec l'état batchId), soit automatiquement
  // au chargement (avec l'id lu dans l'URL).
  const search = useCallback(async (id) => {
    const target = (id ?? batchId).trim();
    if (!target) return;

    setError(null);
    setBatch(null);
    setProducts([]);
    setTimeline([]);
    setLoading(true);
    try {
      const contract = await getReadContract();

      const b = await contract.getBatch(target);
      const productList = [];
      for (const pid of b.productIds) {
        productList.push(await contract.getProduct(pid));
      }

      const events = [];
      for (const pid of b.productIds) {
        const reg = await contract.queryFilter(contract.filters.ProductRegistered(pid));
        reg.forEach((e) =>
          events.push({ ts: e.args.timestamp, label: `Produit ${pid} enregistré (${e.args.productType})` })
        );
        const cert = await contract.queryFilter(contract.filters.CertificationAdded(pid));
        cert.forEach((e) =>
          events.push({ ts: e.args.timestamp, label: `Certification ajoutée à ${pid} : ${e.args.certification}` })
        );
        const harv = await contract.queryFilter(contract.filters.ProductHarvested(pid));
        harv.forEach((e) =>
          events.push({ ts: e.args.timestamp, label: `Produit ${pid} récolté` })
        );
      }

      const created = await contract.queryFilter(contract.filters.BatchCreated(target));
      created.forEach((e) =>
        events.push({ ts: e.args.timestamp, label: `Lot ${target} créé (${e.args.productCount} produit·s)` })
      );
      const qc = await contract.queryFilter(contract.filters.QualityCheckAdded(target));
      qc.forEach((e) =>
        events.push({ ts: e.args.timestamp, label: `Contrôle qualité : ${e.args.qualityCheck}` })
      );
      const transfer = await contract.queryFilter(contract.filters.TransferInitiated(target));
      transfer.forEach((e) =>
        events.push({ ts: e.args.timestamp, label: `Transfert initié vers ${shortAddr(e.args.distributor)}` })
      );
      const confirmed = await contract.queryFilter(contract.filters.TransferConfirmed(target));
      confirmed.forEach((e) =>
        events.push({ ts: e.args.timestamp, label: `Réception confirmée par ${shortAddr(e.args.distributor)}` })
      );

      events.sort((a, b) => Number(a.ts) - Number(b.ts));

      setBatch(b);
      setProducts(productList);
      setTimeline(events);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  // Au chargement : si l'URL contient ?lot=XXX (cas du scan QR),
  // on pré-remplit le champ et on lance la traçabilité automatiquement.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lot = params.get("lot");
    if (lot) {
      setBatchId(lot);
      search(lot);
    }
    // volontairement exécuté une seule fois au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="card">
      <span className="eyebrow">Vérification consommateur</span>
      <h3 className="panel-title">Tracer un lot, du champ au rayon</h3>
      <p className="muted" style={{ marginTop: "-6px", marginBottom: "16px" }}>
        Simule le scan d'un QR code : saisis l'identifiant d'un lot pour afficher son parcours
        complet, lu directement sur la blockchain.
      </p>

      <div className="grid" style={{ gridTemplateColumns: "1fr auto" }}>
        <input placeholder="Identifiant du lot (ex: LOT-001)" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
        <button className="btn" disabled={!batchId || loading} onClick={() => search()}>
          {loading ? "Lecture…" : "Tracer"}
        </button>
      </div>

      {error && <div className="alert alert-err" style={{ marginTop: "14px" }}>{error}</div>}

      {batch && (
        <div className="trace-result">
          <div className="trace-head">
            <div>
              <span className="trace-id">{batch.id}</span>
              <span className={"status-chip status-" + Number(batch.status)}>
                {BATCH_STATUS[Number(batch.status)]}
              </span>
            </div>
            <span className="muted">Coopérative : <span className="mono">{shortAddr(batch.coop)}</span></span>
          </div>

          {batch.qualityCheck && (
            <p className="qc-line">✓ Contrôle qualité : {batch.qualityCheck}</p>
          )}

          <h4 className="sub">Produits du lot</h4>
          <div className="product-list">
            {products.map((p) => (
              <div className="product-item" key={p.id}>
                <strong>{p.productType}</strong> — {p.variety || "variété n.c."}
                <div className="muted">
                  {p.origin || "origine n.c."} · {PRODUCT_STATUS[Number(p.status)]}
                  {p.certification ? ` · ${p.certification}` : " · non certifié"}
                </div>
              </div>
            ))}
          </div>

          <h4 className="sub">Parcours (on-chain)</h4>
          <ol className="timeline">
            {timeline.map((ev, i) => (
              <li key={i}>
                <span className="t-time">{fmt(ev.ts)}</span>
                <span className="t-label">{ev.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
