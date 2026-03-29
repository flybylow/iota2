import { TextileMetadata } from "./types";

const KEY_PREFIX = "dpp_metadata_";

export function saveMetadata(gtin: string, metadata: TextileMetadata): void {
  try {
    localStorage.setItem(KEY_PREFIX + gtin, JSON.stringify(metadata));
  } catch {
    // localStorage unavailable (SSR or private mode)
  }
}

export function loadMetadata(gtin: string): TextileMetadata | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + gtin);
    return raw ? (JSON.parse(raw) as TextileMetadata) : null;
  } catch {
    return null;
  }
}

export const DEFAULT_METADATA: TextileMetadata = {
  countryOfManufacture: "China",
  otherMetadata: "",
};