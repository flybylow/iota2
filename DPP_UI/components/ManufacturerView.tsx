"use client";

import React from "react";
import { TextileMetadata } from "@/lib/types";
import styles from "./DPPApp.module.css";

interface Props {
  gtin: string;
  setGtin: (v: string) => void;
  material: string;
  setMaterial: (v: string) => void;
  metadata: TextileMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<TextileMetadata>>;
  metadataOpen: boolean;
  setMetadataOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lockedReward: number;
  setLockedReward: (v: number) => void;
  usePTB: boolean;
  setUsePTB: (v: boolean) => void;
  creating: boolean;
  onCreateDPP: () => void;
  onGenerateGTIN: () => void;
  postPtbQrGtin: string | null;
  qrDataUrl: string | null;
  openingConsumerFromQr: boolean;
  onDismissPostQr: () => void;
  onOpenConsumerFromQr: () => void;
}

export default function ManufacturerView({
  gtin,
  setGtin,
  material,
  setMaterial,
  metadata,
  setMetadata,
  metadataOpen,
  setMetadataOpen,
  lockedReward,
  setLockedReward,
  usePTB,
  setUsePTB,
  creating,
  onCreateDPP,
  onGenerateGTIN,
  postPtbQrGtin,
  qrDataUrl,
  openingConsumerFromQr,
  onDismissPostQr,
  onOpenConsumerFromQr,
}: Props) {
  if (postPtbQrGtin) {
    return (
      <div className={styles.qrSuccessCard}>
        <div className={styles.qrSuccessTitle}>DPP created & indexed</div>
        <button
          type="button"
          onClick={onOpenConsumerFromQr}
          disabled={openingConsumerFromQr}
          className={styles.qrImageBtn}
          title="Open Consumer view for this GTIN"
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR code — click to open Consumer passport"
              width={220}
              height={220}
            />
          ) : (
            <div className={styles.qrPlaceholder}>Generating QR…</div>
          )}
        </button>
        <p className={styles.qrHint}>Click the QR to open the Consumer view (same as scanning it).</p>
        <div className={styles.qrUrl}>
          {typeof window !== "undefined"
            ? `${window.location.origin}${window.location.pathname}?gtin=${encodeURIComponent(postPtbQrGtin)}`
            : `?gtin=${encodeURIComponent(postPtbQrGtin)}`}
        </div>
        <div className={styles.qrActions}>
          <button type="button" onClick={onDismissPostQr} className={styles.createAnotherBtn}>
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className={styles.sectionTitle} style={{ color: "#2563eb" }}>
        Create Digital Product Passport
      </h2>

      <div
        className={styles.ptbToggle}
        style={{
          background: usePTB ? "rgba(37, 99, 235, 0.12)" : "#33415520",
          border: `1px solid ${usePTB ? "#2563eb" : "#334155"}`,
        }}
      >
        <label className={styles.ptbLabel}>
          <input
            type="checkbox"
            checked={usePTB}
            onChange={(e) => setUsePTB(e.target.checked)}
            className={styles.ptbCheckbox}
            style={{ accentColor: "#2563eb" }}
          />
          <div>
            <div
              className={styles.ptbTitle}
              style={{ color: usePTB ? "#2563eb" : "#94a3b8" }}
            >
              Use PTB (Atomic Transaction)
            </div>
            <div className={styles.ptbHint} style={{ color: usePTB ? "#60a5fa" : "#64748b" }}>
              {usePTB ? "Create + Index in one transaction" : "Create only (no registry)"}
            </div>
          </div>
        </label>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>GTIN (Product Identifier)</label>
        <div className={styles.gtinRow}>
          <input
            type="text"
            value={gtin}
            onChange={(e) => setGtin(e.target.value)}
            placeholder="Enter GTIN..."
            className={styles.inputMono}
          />
          <button type="button" onClick={onGenerateGTIN} className={styles.generateBtn}>
            Generate
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Material Composition</label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className={styles.select}
        >
          <option value="100% Organic Cotton">100% Organic Cotton</option>
          <option value="100% Cotton">100% Cotton</option>
          <option value="Cotton/Polyester Blend">Cotton/Polyester Blend</option>
          <option value="100% Polyester">100% Polyester</option>
          <option value="Recycled Materials">Recycled Materials</option>
        </select>
      </div>

      <div className={styles.expandableSection}>
        <div
          className={styles.expandableHeader}
          onClick={() => setMetadataOpen((v) => !v)}
        >
          <span className={styles.expandableHeaderText}>Product Details</span>
          <span
            className={`${styles.expandableChevron} ${metadataOpen ? styles.expandableChevronOpen : ""}`}
          >
            ▼
          </span>
        </div>
        {metadataOpen && (
          <div className={styles.expandableBody}>
            <div>
              <label className={styles.formLabel}>Country of Manufacture</label>
              <input
                type="text"
                value={metadata.countryOfManufacture}
                onChange={(e) =>
                  setMetadata((m) => ({ ...m, countryOfManufacture: e.target.value }))
                }
                placeholder="e.g. Portugal"
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.formLabel}>Other Metadata</label>
              <textarea
                value={metadata.otherMetadata}
                onChange={(e) =>
                  setMetadata((m) => ({ ...m, otherMetadata: e.target.value }))
                }
                placeholder="e.g. Recycling Instructions, Chemical Composition etc."
                rows={3}
                className={styles.input}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label className={styles.formLabel}>Recycling Reward ($)</label>
        <input
          type="number"
          value={lockedReward}
          onChange={(e) => setLockedReward(Number(e.target.value))}
          min={1}
          max={20}
          step={1}
          className={styles.input}
        />
      </div>

      <button
        type="button"
        onClick={onCreateDPP}
        disabled={creating || !gtin.trim()}
        className={styles.primaryBtn}
        style={{
          background:
            creating || !gtin.trim()
              ? "#64748b"
              : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          cursor: creating || !gtin.trim() ? "not-allowed" : "pointer",
          opacity: creating ? 0.7 : 1,
        }}
      >
        {creating && <span className={styles.spinner} />}
        {creating
          ? "Creating on blockchain..."
          : usePTB
            ? "Create DPP + Index (PTB)"
            : "Create DPP"}
      </button>
    </div>
  );
}
