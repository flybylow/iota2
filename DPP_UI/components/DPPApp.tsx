"use client";

import React, { useState, useEffect, useRef } from "react";
import { DPP as DPPType, DPP_STATUS, TextileMetadata, User } from "@/lib/types";
import * as storage from "@/lib/storage-blockchain";
import { DEFAULT_METADATA } from "@/lib/metadata-storage";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  ConnectButton,
} from "@iota/dapp-kit";
import styles from "./DPPApp.module.css";
import ManufacturerView from "./ManufacturerView";
import RegistryView from "./RegistryView";
import ConsumerView from "./ConsumerView";
import RecyclerView from "./RecyclerView";

interface Tab {
  id: User;
  label: string;
  color: string;
}

const tabs: Tab[] = [
  { id: "manufacturer", label: "Manufacturer", color: "#2563eb" },
  { id: "consumer", label: "Consumer", color: "#059669" },
  { id: "recycler", label: "Recycler", color: "#d97706" },
];

const DPPApp = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [activeTab, setActiveTab] = useState<User>("manufacturer");
  const [currentDPP, setCurrentDPP] = useState<DPPType | null>(null);
  const [allDPPs, setAllDPPs] = useState<DPPType[]>([]);

  const [gtin, setGtin] = useState("");
  const [material, setMaterial] = useState("100% Organic Cotton");
  const [lockedReward, setLockedReward] = useState(5);
  const [metadata, setMetadata] = useState<TextileMetadata>({ ...DEFAULT_METADATA });
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [usePTB, setUsePTB] = useState(true);

  const [lookupGtin, setLookupGtin] = useState("");
  const [consumerRewardAddress, setConsumerRewardAddress] = useState("");

  const [creating, setCreating] = useState(false);
  const [marking, setMarking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [looking, setLooking] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferAddress, setTransferAddress] = useState("");

  const [postPtbQrGtin, setPostPtbQrGtin] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [openingConsumerFromQr, setOpeningConsumerFromQr] = useState(false);
  const urlGtinHandled = useRef(false);

  useEffect(() => {
    if (currentAccount?.address && !consumerRewardAddress) {
      setConsumerRewardAddress(currentAccount.address);
    }
  }, [currentAccount?.address]);

  useEffect(() => {
    void loadDPPs();
  }, [currentAccount]);

  useEffect(() => {
    if (!postPtbQrGtin) {
      setQrDataUrl(null);
      return;
    }
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?gtin=${encodeURIComponent(postPtbQrGtin)}`
        : "";
    if (!url) return;

    let cancelled = false;
    import("qrcode")
      .then((QR) =>
        QR.default.toDataURL(url, {
          width: 240,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        }),
      )
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [postPtbQrGtin]);

  useEffect(() => {
    if (urlGtinHandled.current || typeof window === "undefined") return;
    const g = new URLSearchParams(window.location.search).get("gtin");
    if (!g?.trim()) return;
    urlGtinHandled.current = true;

    void (async () => {
      const dpp = await storage.getDPPByGTIN(g.trim());
      if (dpp) {
        setLookupGtin(g.trim());
        setCurrentDPP(dpp);
        setActiveTab("consumer");
      }
    })();
  }, []);

  async function loadDPPs() {
    if (!currentAccount) return;
    const dpps = await storage.getDPPsByOwner(currentAccount.address);
    setAllDPPs(dpps);
    if (currentDPP) {
      const updated = dpps.find((d) => d.id === currentDPP.id);
      if (updated) setCurrentDPP(updated);
    }
  }

  function generateGTIN() {
    const prefix = "012345";
    const item = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const checkDigit = Math.floor(Math.random() * 10);
    setGtin(`${prefix}${item}${checkDigit}`);
  }

  async function handleOpenConsumerFromQr() {
    if (!postPtbQrGtin?.trim()) return;
    setOpeningConsumerFromQr(true);
    try {
      let dpp = await storage.getDPPByGTIN(postPtbQrGtin.trim());
      if (!dpp) {
        await new Promise((r) => setTimeout(r, 1500));
        dpp = await storage.getDPPByGTIN(postPtbQrGtin.trim());
      }
      if (dpp) {
        setLookupGtin(postPtbQrGtin.trim());
        setCurrentDPP(dpp);
        setActiveTab("consumer");
      } else {
        alert(
          "Could not load this passport from the registry yet. Wait a few seconds and try again.",
        );
      }
    } finally {
      setOpeningConsumerFromQr(false);
    }
  }

  async function handleCreateDPP() {
    if (!currentAccount) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!gtin.trim()) {
      alert("Please enter a GTIN (product identifier)");
      return;
    }

    setCreating(true);
    const gtinUsed = gtin.trim();
    const result = usePTB
      ? await storage.createDPPWithPTB(
          gtin,
          material,
          metadata.countryOfManufacture,
          metadata.otherMetadata,
          lockedReward,
          currentAccount.address,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signAndExecute as any,
        )
      : await storage.createDPP(
          gtin,
          material,
          metadata.countryOfManufacture,
          metadata.otherMetadata,
          lockedReward,
          currentAccount.address,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signAndExecute as any,
        );

    if (result.success) {
      if (usePTB) setPostPtbQrGtin(gtinUsed);
      setGtin("");
      setMetadata({ ...DEFAULT_METADATA });
      setTimeout(async () => {
        const dpps = await storage.getDPPsByOwner(currentAccount.address);
        setAllDPPs(dpps);
        const active = dpps.find((d) => d.status === DPP_STATUS.ACTIVE);
        setCurrentDPP(active ?? dpps[0] ?? null);
      }, 2000);
    } else {
      alert("Failed to create DPP: " + result.error);
    }
    setCreating(false);
  }

  async function handleLookupGTIN() {
    if (!lookupGtin.trim()) {
      alert("Please enter a GTIN to lookup");
      return;
    }
    setLooking(true);
    const dpp = await storage.getDPPByGTIN(lookupGtin);
    if (dpp) {
      setCurrentDPP(dpp);
      setActiveTab("consumer");
    } else {
      alert("GTIN not found in registry: " + lookupGtin);
    }
    setLooking(false);
  }

  async function handleMarkEndOfLife() {
    if (!currentDPP || !currentAccount) return;
    setMarking(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await storage.markEndOfLife(currentDPP.id, signAndExecute as any);
    if (result.success) setTimeout(loadDPPs, 2000);
    else alert("Failed to mark end of life: " + result.error);
    setMarking(false);
  }

  async function handleTransferOwnership() {
    if (!currentDPP || !currentAccount) return;

    if (!transferAddress.trim()) {
      alert("Please enter the recipient address to transfer ownership.");
      return;
    }

    setTransferring(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await storage.transferOwnership(currentDPP.id, transferAddress.trim(), signAndExecute as any);

    if (result.success) {
      alert(`Ownership transferred to ${transferAddress.trim()}`);
      setTransferAddress("");
      setTimeout(async () => {
        await loadDPPs();
        const updated = await storage.getDPPById(currentDPP.id);
        if (updated && currentAccount && updated.consumer === currentAccount.address) {
          setCurrentDPP(updated);
        } else {
          // Clear selection if the connected wallet is no longer the owner
          setCurrentDPP(null);
        }
      }, 2000);
    } else {
      alert("Failed to transfer ownership: " + result.error);
    }

    setTransferring(false);
  }

  async function handleVerifyAndUnlock() {
    if (!currentDPP || !currentAccount) return;
    setVerifying(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await storage.verifyAndUnlock(currentDPP.id, signAndExecute as any);
    if (result.success) setTimeout(loadDPPs, 2000);
    else alert("Failed to verify and unlock: " + result.error);
    setVerifying(false);
  }

  function handleReset() {
    setCurrentDPP(null);
    setGtin("");
    setLookupGtin("");
    setPostPtbQrGtin(null);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerTitles}>
            <h1 className={styles.title}>Textile Tracer</h1>
            <p className={styles.subtitle}>
              MasterZ × IOTA Hackathon · Tabulas ·
            </p>
          </div>
          <div className={styles.walletSection}>
            <div className={`${styles.walletRow} ${styles.compactWalletTriggers}`}>
              <button
                type="button"
                onClick={() => setActiveTab("registry")}
                className={styles.registryBtn}
                style={{
                  border:
                    activeTab === "registry" ? "1px solid #8b5cf6" : "1px solid #334155",
                  background: activeTab === "registry" ? "#8b5cf620" : "transparent",
                  color: activeTab === "registry" ? "#8b5cf6" : "#94a3b8",
                }}
              >
                Wardrobe
              </button>
              <ConnectButton size="md" />
            </div>
            {currentAccount && (
              <div className={styles.connectedAddress}>
                Connected: {currentAccount.address.slice(0, 8)}...
                {currentAccount.address.slice(-6)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={styles.tabBtn}
            style={{
              border: activeTab === tab.id ? `2px solid ${tab.color}` : "2px solid #334155",
              background: activeTab === tab.id ? `${tab.color}20` : "transparent",
              color: activeTab === tab.id ? tab.color : "#94a3b8",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {activeTab === "manufacturer" && (
          <ManufacturerView
            gtin={gtin}
            setGtin={setGtin}
            material={material}
            setMaterial={setMaterial}
            metadata={metadata}
            setMetadata={setMetadata}
            metadataOpen={metadataOpen}
            setMetadataOpen={setMetadataOpen}
            lockedReward={lockedReward}
            setLockedReward={setLockedReward}
            usePTB={usePTB}
            setUsePTB={setUsePTB}
            creating={creating}
            onCreateDPP={handleCreateDPP}
            onGenerateGTIN={generateGTIN}
            postPtbQrGtin={postPtbQrGtin}
            qrDataUrl={qrDataUrl}
            openingConsumerFromQr={openingConsumerFromQr}
            onDismissPostQr={() => setPostPtbQrGtin(null)}
            onOpenConsumerFromQr={() => void handleOpenConsumerFromQr()}
          />
        )}
        {activeTab === "registry" && (
          <RegistryView
            lookupGtin={lookupGtin}
            setLookupGtin={setLookupGtin}
            looking={looking}
            allDPPs={allDPPs}
            onLookup={handleLookupGTIN}
            onSelectDPP={(dpp) => {
              setCurrentDPP(dpp);
              setActiveTab("consumer");
            }}
          />
        )}
        {activeTab === "consumer" && (
          <ConsumerView
            currentDPP={currentDPP}
            allDPPs={allDPPs}
            onSelectDPP={setCurrentDPP}
            consumerRewardAddress={consumerRewardAddress}
            setConsumerRewardAddress={setConsumerRewardAddress}
            walletAddress={currentAccount?.address}
            marking={marking}
            transferring={transferring}
            transferAddress={transferAddress}
            setTransferAddress={setTransferAddress}
            onTransferOwnership={handleTransferOwnership}
            onMarkEndOfLife={handleMarkEndOfLife}
            onReset={handleReset}
            onGoToRecycler={() => setActiveTab("recycler")}
          />
        )}
        {activeTab === "recycler" && (
          <RecyclerView
            currentDPP={currentDPP}
            verifying={verifying}
            onVerifyAndUnlock={handleVerifyAndUnlock}
            onReset={handleReset}
          />
        )}
      </div>

      <div className={styles.footer}>
        <p>
          <a
            href="https://www.masterzblockchain.com/en/masterz-iota"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Built for MasterZ × IOTA Hackathon
          </a>
        </p>
      </div>
    </div>
  );
};

export default DPPApp;
