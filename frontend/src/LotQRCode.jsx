import { QRCodeSVG } from "qrcode.react";

/**
 * Affiche un QR code encodant l'URL publique de traçabilité d'un lot.
 * Scanner le QR (ou ouvrir l'URL) charge l'app avec ?lot=<batchId>,
 * ce qui déclenche automatiquement la traçabilité côté consommateur.
 */
export default function LotQRCode({ batchId }) {
  if (!batchId) return null;

  // origin = http://localhost:5173 en dev, ou l'URL de déploiement en prod.
  const url = `${window.location.origin}/?lot=${encodeURIComponent(batchId)}`;

  return (
    <div className="qr-box">
      <QRCodeSVG value={url} size={132} level="M" />
      <div className="qr-meta">
        <span className="qr-label">QR de traçabilité — {batchId}</span>
        <span className="qr-url mono">{url}</span>
        <span className="hint">
          À imprimer sur l'étiquette du lot. Le consommateur scanne et voit le parcours complet.
        </span>
      </div>
    </div>
  );
}
