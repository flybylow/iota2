"use client";

import { DPP, DPP_STATUS, User } from "@/lib/types";
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
      status === DPP_STATUS.ACTIVE ? "#22c55e20"
      : status === DPP_STATUS.END_OF_LIFE ? "#f59e0b20"
      : "#8b5cf620",
    color:
      status === DPP_STATUS.ACTIVE ? "#22c55e"
      : status === DPP_STATUS.END_OF_LIFE ? "#f59e0b"
      : "#8b5cf6",
  };
}

export default function RegistryView({
  lookupGtin, setLookupGtin, looking, allDPPs, onLookup, onSelectDPP,
}: Props) {
  return (
    <div>
      <h2 className={styles.sectionTitle} style={{ color: "#8b5cf6" }}>
        Registry Lookup
      </h2>

      <div className={styles.infoBox}>
        <div className={styles.infoBoxLabel}>Workshop II Feature</div>
        <div className={styles.infoBoxText}>
          The Registry is a <strong>shared object</strong> with a{" "}
          <strong>Table&lt;String, ID&gt;</strong> mapping GTINs to DPP IDs.
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Lookup DPP by GTIN</label>
        <input
          type="text"
          value={lookupGtin}
          onChange={(e) => setLookupGtin(e.target.value)}
          placeholder="Enter GTIN to lookup..."
          className={styles.lookupInput}
        />
        <button
          onClick={onLookup}
          disabled={looking || !lookupGtin.trim()}
          className={styles.secondaryBtn}
          style={{
            background:
              looking || !lookupGtin.trim()
                ? "#64748b"
                : "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
            cursor: looking || !lookupGtin.trim() ? "not-allowed" : "pointer",
          }}
        >
          {looking ? "Searching..." : "Lookup in Registry"}
        </button>
      </div>

      {allDPPs.length > 0 && (
        <div className={styles.dppsList}>
          <div className={styles.dppsCountLabel}>
            Your DPPs ({allDPPs.length})
          </div>
          {allDPPs.map((dpp) => (
            <div
              key={dpp.id}
              onClick={() => onSelectDPP(dpp)}
              className={styles.dppItem}
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
