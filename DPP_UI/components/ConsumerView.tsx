"use client";

import { DPP, DPP_STATUS } from "@/lib/types";
import MetadataSection from "./MetadataSection";
import styles from "./DPPApp.module.css";

interface Props {
  currentDPP: DPP | null;
  consumerRewardAddress: string;
  setConsumerRewardAddress: (v: string) => void;
  walletAddress: string | undefined;
  marking: boolean;
  transferring: boolean;
  transferAddress: string;
  setTransferAddress: (v: string) => void;
  onTransferOwnership: () => void;
  onMarkEndOfLife: () => void;
  onReset: () => void;
  onGoToRecycler: () => void;
}

function getStatusLabel(status: number) {
  if (status === DPP_STATUS.ACTIVE) return "Active";
  if (status === DPP_STATUS.END_OF_LIFE) return "End of Life";
  if (status === DPP_STATUS.RECYCLED) return "Recycled";
  return "Unknown";
}

export default function ConsumerView({
  currentDPP,
  consumerRewardAddress,
  setConsumerRewardAddress,
  walletAddress,
  marking,
  transferring,
  transferAddress,
  setTransferAddress,
  onTransferOwnership,
  onMarkEndOfLife,
  onReset,
  onGoToRecycler,
}: Props) {
  return (
    <div>
      <h2 className={styles.sectionTitle} style={{ color: "#059669" }}>
        My Product
      </h2>

      {!currentDPP ? (
        <div className={styles.emptyState}>
          <div className={styles.emoji}>📱</div>
          <p>No product selected</p>
          <p className={styles.emptyHint}>
            Create one in Manufacturer tab or lookup by GTIN in Wardrobe
          </p>
        </div>
      ) : currentDPP.status === DPP_STATUS.RECYCLED ? (
        <div className={styles.centeredView}>
          <div className={styles.viewEmojiLarge}>Reward Claimed!</div>
          <h3 style={{ color: "#22c55e", marginBottom: "8px" }}>Reward Claimed!</h3>
          <p className={styles.recycledReward}>${currentDPP.originalReward.toFixed(2)}</p>
          <p className={styles.recycledSentTo}>Sent to consumer wallet</p>
          <a
            href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.explorerLink}
            style={{ marginTop: "12px" }}
          >
            View on IOTA Explorer →
          </a>
        </div>
      ) : (
        <>
          <div className={styles.detailsCard}>
            <div className={styles.detailText}>
              <div className={styles.detailRow}>
                <span>GTIN</span>
                <span className={styles.monoValue}>{currentDPP.gtin}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Material</span>
                <span className={styles.lightValue}>{currentDPP.material}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Status</span>
                <span className={styles.lightValue}>{getStatusLabel(currentDPP.status)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Current Owner</span>
                <span className={styles.monoValue}>
                  {currentDPP.consumer ? currentDPP.consumer : "Not set"}
                </span>
              </div>
              <div className={styles.detailRowLast}>
                <span>Recycling Reward</span>
                <span className={styles.rewardValue}>${currentDPP.lockedReward.toFixed(2)}</span>
              </div>
              {currentDPP.status === DPP_STATUS.ACTIVE && (
                <p className={styles.rewardFollowHint}>Bring to recycling point to claim</p>
              )}
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

          {currentDPP.status === DPP_STATUS.ACTIVE && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.addressLabel}>Your wallet address (for reward payout)</label>
                <p className={styles.addressHint}>
                  The recycler will use this address to pay you. When you Mark End of Life, your
                  connected wallet is recorded on the product.
                </p>
                <input
                  type="text"
                  value={consumerRewardAddress}
                  onChange={(e) => setConsumerRewardAddress(e.target.value)}
                  placeholder="0x..."
                  className={styles.addressInput}
                />
                {walletAddress && (
                  <button
                    type="button"
                    onClick={() => setConsumerRewardAddress(walletAddress)}
                    className={styles.useWalletBtn}
                  >
                    Use my connected wallet
                  </button>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.addressLabel}>Transfer ownership to</label>
                <p className={styles.addressHint}>
                  Enter an address to transfer ownership of the product. You must be the current
                  owner and product status must be Active.
                </p>
                <input
                  type="text"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  placeholder="0x..."
                  className={styles.addressInput}
                />
                <button
                  type="button"
                  onClick={onTransferOwnership}
                  disabled={
                    transferring ||
                    !walletAddress ||
                    !currentDPP ||
                    currentDPP.consumer !== walletAddress
                  }
                  className={styles.primaryBtn}
                  style={{
                    background:
                      transferring ||
                      !walletAddress ||
                      !currentDPP ||
                      currentDPP.consumer !== walletAddress
                        ? "#64748b"
                        : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    cursor:
                      transferring ||
                      !walletAddress ||
                      !currentDPP ||
                      currentDPP.consumer !== walletAddress
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      transferring ||
                      !walletAddress ||
                      !currentDPP ||
                      currentDPP.consumer !== walletAddress
                        ? 0.7
                        : 1,
                    marginTop: "8px",
                  }}
                >
                  {transferring && <span className={styles.spinner} />}
                  {transferring ? "Transferring..." : "Transfer Ownership"}
                </button>
                {(!walletAddress || !currentDPP || currentDPP.consumer !== walletAddress) && (
                  <p className={styles.addressHint}>
                    Transfer is only available when your connected wallet is the current owner.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onMarkEndOfLife}
                disabled={marking}
                className={styles.primaryBtn}
                style={{
                  background: marking
                    ? "#64748b"
                    : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  cursor: marking ? "not-allowed" : "pointer",
                  opacity: marking ? 0.7 : 1,
                }}
              >
                {marking && <span className={styles.spinner} />}
                {marking ? "Processing..." : "Mark End of Life"}
              </button>
            </>
          )}

          {currentDPP.status === DPP_STATUS.END_OF_LIFE && (
            <button type="button" onClick={onGoToRecycler} className={styles.eolToRecyclerBtn}>
              <p className={styles.eolToRecyclerTitle}>Awaiting Recycler Confirmation</p>
              <p className={styles.eolToRecyclerHint}>Bring product to a recycling point</p>
            </button>
          )}

          <button type="button" onClick={onReset} className={styles.resetBtn}>
            Clear Selection
          </button>
        </>
      )}
    </div>
  );
}
