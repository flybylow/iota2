import { DPP } from "@/lib/types";
import styles from "./DPPApp.module.css";

export default function MetadataSection({ dpp }: { dpp: DPP }) {
  if (!dpp.countryOfManufacture && !dpp.otherMetadata) return null;
  return (
    <div className={styles.metadataSection}>
      <div className={styles.metadataSectionTitle}>Product Details</div>
      {dpp.countryOfManufacture && (
        <div className={styles.metadataRow}>
          <span>Country of Manufacture</span>
          <span className={styles.metadataValue}>
            {dpp.countryOfManufacture}
          </span>
        </div>
      )}
      {dpp.otherMetadata && (
        <div className={styles.metadataRow}>
          <span>Other Metadata</span>
          <span className={styles.metadataValue}>{dpp.otherMetadata}</span>
        </div>
      )}
    </div>
  );
}