"use client";

import { DPP, DPP_STATUS } from "@/lib/types";
import styles from "./DPPApp.module.css";

interface Props {
  lookupGtin: string;
  setLookupGtin: (v: string) => void;
  looking: boolean;
  allDPPs: DPP[];
  onLookup: () => void;
  onSelectDPP: (dpp: DPP) => void;
}

function getStatusLabel(status: number) {
  if (status === DPP_STATUS.ACTIVE) return "Active";
  if (status === DPP_STATUS.END_OF_LIFE) return "End of Life";
  if (status === DPP_STATUS.RECYCLED) return "Recycled";
  return "Unknown";
}

function getStatusBadgeStyle(status: number) {
  return {
    background:
      status === DPP_STATUS.ACTIVE
        ? "#22c55e20"
        : status === DPP_STATUS.END_OF_LIFE
          ? "#f59e0b20"
          : "#8b5cf620",
    color:
      status === DPP_STATUS.ACTIVE
        ? "#22c55e"
        : status === DPP_STATUS.END_OF_LIFE
          ? "#f59e0b"
          : "#8b5cf6",
  };
}

export default function RegistryView({
  lookupGtin,
  setLookupGtin,
  looking,
  allDPPs,
  onLookup,
  onSelectDPP,
}: Props) {
  return (
    <div>
      <div className={styles.wardrobeHero}>
        <div className={styles.wardrobeHeroBg} aria-hidden />
        <div className={styles.wardrobeHeroOverlay} aria-hidden />
        <div className={styles.wardrobeHeroInner}>
          <h2 className={styles.wardrobeHeroTitle}>Wardrobe lookup</h2>
          <p className={styles.wardrobeHeroSubtitle}>Find a passport by the GTIN on the label.</p>

          <div className={styles.wardrobeInfoCard}>
            <div className={styles.wardrobeInfoLabel}>Wardrobe (GTIN → DPP)</div>
            <div className={styles.wardrobeInfoText}>
              On-chain, a <strong>shared registry</strong> holds a{" "}
              <strong>Table&lt;String, ID&gt;</strong> mapping GTINs to DPP IDs — your digital
              wardrobe.
            </div>
          </div>

          <div>
            <label className={styles.wardrobeLookupLabel}>Lookup DPP by GTIN</label>
            <input
              type="text"
              value={lookupGtin}
              onChange={(e) => setLookupGtin(e.target.value)}
              placeholder="Enter GTIN to lookup..."
              className={styles.wardrobeLookupInput}
            />
            <button
              type="button"
              onClick={onLookup}
              disabled={looking || !lookupGtin.trim()}
              className={styles.wardrobeLookupBtn}
            >
              {looking ? "Searching..." : "Lookup in Wardrobe"}
            </button>
          </div>
        </div>
      </div>

      {allDPPs.length > 0 && (
        <div className={styles.dppsList}>
          <div className={styles.dppsCountLabel}>Your DPPs ({allDPPs.length})</div>
          {allDPPs.map((dpp) => (
            <div
              key={dpp.id}
              onClick={() => onSelectDPP(dpp)}
              className={styles.dppItem}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectDPP(dpp);
              }}
            >
              <div className={styles.dppItemRow}>
                <div>
                  <div className={styles.dppGtin}>GTIN: {dpp.gtin}</div>
                  <div className={styles.dppMaterial}>{dpp.material}</div>
                </div>
                <div
                  className={styles.statusBadge}
                  style={getStatusBadgeStyle(dpp.status)}
                >
                  {getStatusLabel(dpp.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
