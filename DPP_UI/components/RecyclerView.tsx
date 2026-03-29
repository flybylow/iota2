"use client";

import { DPP, DPP_STATUS } from "@/lib/types";
import MetadataSection from "./MetadataSection";
import styles from "./DPPApp.module.css";

interface Props {
  currentDPP: DPP | null;
  verifying: boolean;
  onVerifyAndUnlock: () => void;
  onReset: () => void;
}

export default function RecyclerView({
  currentDPP, verifying, onVerifyAndUnlock, onReset,
}: Props) {
  return (
    <div>
      <h2 className={styles.sectionTitle} style={{ color: "#d97706" }}>
        Verify & Unlock
      </h2>

      {!currentDPP ? (
        <div className={styles.emptyState}>
          <div className={styles.emoji}>Scan</div>
          <p>Scan incoming product DPP</p>
          <p className={styles.emptyHint}>
            (Select a product in Consumer tab first)
          </p>
        </div>
      ) : currentDPP.status !== DPP_STATUS.END_OF_LIFE &&
        currentDPP.status !== DPP_STATUS.RECYCLED ? (
        <div className={styles.emptyState}>
          <div className={styles.emoji}>Waiting</div>
          <p>Product still in use</p>
          <p className={styles.emptyHint}>
            Consumer hasn&apos;t marked End of Life yet
          </p>
        </div>
      ) : currentDPP.status === DPP_STATUS.RECYCLED ? (
        <div className={styles.centeredView}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>Done</div>
          <h3 style={{ color: "#d97706", marginBottom: "16px" }}>Recycling Verified</h3>
          <div
            className={styles.verifiedCard}
            style={{ border: "1px solid rgba(217, 119, 6, 0.35)" }}
          >
            <p
              className={styles.releasedTo}
              style={{ color: "#fb923c", fontWeight: 600, marginBottom: 0 }}
            >
              ${currentDPP.originalReward.toFixed(2)} released to consumer
            </p>
          </div>
          <a
            href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.explorerLink}
            style={{ marginTop: "8px" }}
          >
            View on IOTA Explorer →
          </a>
          <button
            onClick={onReset}
            className={styles.resetBtn}
            style={{ marginTop: "20px" }}
          >
            Scan Next Item
          </button>
        </div>
      ) : (
        <>
          <div className={styles.detailsCard}>
            <p className={styles.manufacturerLabel}>MANUFACTURER CLAIMS:</p>
            <p className={styles.materialText}>{currentDPP.material}</p>
            <div className={styles.recyclerDetails}>
              <div className={styles.recyclerDetailRow}>
                <span>GTIN</span>
                <span className={styles.monoValue}>{currentDPP.gtin}</span>
              </div>
              <div className={styles.recyclerDetailRow}>
                <span>DPP ID</span>
                <span className={styles.dppIdValue}>
                  {currentDPP.id.slice(0, 12)}...
                </span>
              </div>
              <div className={styles.recyclerDetailRowLast}>
                <span>Locked Reward</span>
                <span style={{ color: "#d97706", fontWeight: 600 }}>
                  ${currentDPP.lockedReward.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <MetadataSection dpp={currentDPP} />

          <a
            href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.explorerLink}
            style={{ marginBottom: "20px" }}
          >
            View on IOTA Explorer →
          </a>

          <button
            type="button"
            onClick={onVerifyAndUnlock}
            disabled={verifying}
            className={styles.primaryBtn}
            style={{
              background: verifying
                ? "#64748b"
                : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              cursor: verifying ? "not-allowed" : "pointer",
              opacity: verifying ? 0.7 : 1,
            }}
          >
            {verifying && <span className={styles.spinner} />}
            {verifying
              ? "Verifying on blockchain..."
              : `Verify & Unlock $${currentDPP.lockedReward.toFixed(2)}`}
          </button>
        </>
      )}
    </div>
  );
}
