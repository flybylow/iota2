'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DPP as DPPType, DPP_STATUS } from '@/lib/types';
import * as storage from '@/lib/storage-blockchain';
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from '@iota/dapp-kit';

interface Tab {
  id: 'manufacturer' | 'consumer' | 'recycler' | 'wardrobe';
  label: string;
  color: string;
}

type StorageSignAndExecute = Parameters<typeof storage.createDPPWithPTB>[4];

const DPPApp = () => {
  // Wallet connection
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const signTx = signAndExecute as unknown as StorageSignAndExecute;

  const [activeTab, setActiveTab] = useState<'manufacturer' | 'consumer' | 'recycler' | 'wardrobe'>('manufacturer');

  // Current DPP being viewed
  const [currentDPP, setCurrentDPP] = useState<DPPType | null>(null);
  const [allDPPs, setAllDPPs] = useState<DPPType[]>([]);

  // Form state
  const [gtin, setGtin] = useState('');
  const [material, setMaterial] = useState('100% Organic Cotton');
  const [lockedReward, setLockedReward] = useState(5);
  const [lookupGtin, setLookupGtin] = useState('');
  // Consumer: wallet address for reward payout (recycler uses this to pay the customer)
  const [consumerRewardAddress, setConsumerRewardAddress] = useState('');

  // Loading states
  const [creating, setCreating] = useState(false);
  const [marking, setMarking] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [looking, setLooking] = useState(false);

  // PTB mode toggle
  const [usePTB, setUsePTB] = useState(true);

  // After PTB create + index: show QR linking to ?gtin= for demos
  const [postPtbQrGtin, setPostPtbQrGtin] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [openingConsumerFromQr, setOpeningConsumerFromQr] = useState(false);
  const urlGtinHandled = useRef(false);

  // Load DPPs from storage on mount
  useEffect(() => {
    loadDPPs();
    console.log('========================================');
    console.log('DPP APP INITIALIZED');
    console.log('========================================');
    console.log('Features: Registry + PTB + Tables');
    console.log('Network: IOTA Testnet');
    console.log('Wallet:', currentAccount?.address || 'Not connected');
    console.log('========================================\n');
  }, [currentAccount]);

  // Pre-fill consumer reward address when wallet connects
  useEffect(() => {
    if (currentAccount?.address && !consumerRewardAddress) {
      setConsumerRewardAddress(currentAccount.address);
    }
  }, [currentAccount?.address]);

  // Generate QR data URL for the share link (client-only)
  useEffect(() => {
    if (!postPtbQrGtin) {
      setQrDataUrl(null);
      return;
    }
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?gtin=${encodeURIComponent(postPtbQrGtin)}`
        : '';
    if (!url) return;

    let cancelled = false;
    import('qrcode')
      .then((QR) =>
        QR.default.toDataURL(url, {
          width: 240,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
        })
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

  // Open app from QR: ?gtin=... → registry lookup → consumer view
  useEffect(() => {
    if (urlGtinHandled.current || typeof window === 'undefined') return;
    const g = new URLSearchParams(window.location.search).get('gtin');
    if (!g?.trim()) return;
    urlGtinHandled.current = true;

    (async () => {
      const dpp = await storage.getDPPByGTIN(g.trim());
      if (dpp) {
        setLookupGtin(g.trim());
        setCurrentDPP(dpp);
        setActiveTab('consumer');
      }
    })();
  }, []);

  async function loadDPPs() {
    if (!currentAccount) return;

    const dpps = await storage.getDPPsByOwner(currentAccount.address);
    setAllDPPs(dpps);

    if (currentDPP) {
      const updated = dpps.find(d => d.id === currentDPP.id);
      if (updated) {
        setCurrentDPP(updated);
      }
    }
  }

  // Generate a random GTIN
  function generateGTIN() {
    const prefix = '012345'; // Example company prefix
    const item = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const checkDigit = Math.floor(Math.random() * 10);
    setGtin(`${prefix}${item}${checkDigit}`);
  }

  async function handleCreateDPP() {
    if (!currentAccount) {
      alert('Please connect your wallet first!');
      return;
    }

    if (!gtin.trim()) {
      alert('Please enter a GTIN (product identifier)');
      return;
    }

    console.log('========================================');
    console.log('MANUFACTURER: CREATE DPP', usePTB ? '(PTB)' : '(Simple)');
    console.log('========================================');
    console.log('GTIN:', gtin);
    console.log('Material:', material);
    console.log('Locked Reward: $', lockedReward.toFixed(2));
    console.log('Recipient:', currentAccount.address);

    setCreating(true);

    let result;
    if (usePTB) {
      // Use PTB - atomic create + index
      result = await storage.createDPPWithPTB(
        gtin,
        material,
        lockedReward,
        currentAccount.address,
        signTx
      );
      console.log('PTB Result - Indexed:', result.indexed);
    } else {
      // Simple create (no registry indexing)
      result = await storage.createDPP(
        gtin,
        material,
        lockedReward,
        currentAccount.address,
        signTx
      );
    }

    if (result.success) {
      const gtinUsed = gtin.trim();
      console.log('Transaction ID:', result.transactionId);
      console.log('DPP ID:', result.dppId);
      console.log('Explorer: https://explorer.iota.org/txblock/' + result.transactionId + '?network=testnet');
      console.log('========================================\n');

      if (usePTB) {
        setPostPtbQrGtin(gtinUsed);
      }

      // Refresh DPPs
      setTimeout(async () => {
        const dpps = await storage.getDPPsByOwner(currentAccount.address);
        setAllDPPs(dpps);

        if (dpps.length > 0) {
          const activeDPP = dpps.find(dpp => dpp.status === DPP_STATUS.ACTIVE);
          if (activeDPP) {
            setCurrentDPP(activeDPP);
          } else {
            setCurrentDPP(dpps[0]);
          }
        }
      }, 2000);

      setGtin('');
    } else {
      console.error('Error:', result.error);
      alert('Failed to create DPP: ' + result.error);
    }

    setCreating(false);
  }

  /** Open Consumer tab with this GTIN — same path as scanning the QR (?gtin=). */
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
        setActiveTab('consumer');
      } else {
        alert('Could not load this passport from the registry yet. Wait a few seconds and try again.');
      }
    } finally {
      setOpeningConsumerFromQr(false);
    }
  }

  async function handleLookupGTIN() {
    if (!lookupGtin.trim()) {
      alert('Please enter a GTIN to lookup');
      return;
    }

    console.log('========================================');
    console.log('REGISTRY LOOKUP:', lookupGtin);
    console.log('========================================');

    setLooking(true);

    const dpp = await storage.getDPPByGTIN(lookupGtin);

    if (dpp) {
      console.log('Found DPP:', dpp.id);
      console.log('Material:', dpp.material);
      console.log('Status:', dpp.status);
      setCurrentDPP(dpp);
      setActiveTab('consumer');
    } else {
      console.log('GTIN not found in registry');
      alert('GTIN not found in registry: ' + lookupGtin);
    }

    setLooking(false);
  }

  async function handleMarkEndOfLife() {
    if (!currentDPP || !currentAccount) return;

    console.log('========================================');
    console.log('CONSUMER: MARK END OF LIFE');
    console.log('========================================');
    console.log('DPP ID:', currentDPP.id);

    setMarking(true);

    const result = await storage.markEndOfLife(currentDPP.id, signTx as Parameters<typeof storage.markEndOfLife>[1]);

    if (result.success) {
      console.log('Transaction ID:', result.transactionId);
      console.log('========================================\n');

      setTimeout(() => {
        loadDPPs();
      }, 2000);
    } else {
      console.error('Error:', result.error);
      alert('Failed to mark end of life: ' + result.error);
    }

    setMarking(false);
  }

  async function handleVerifyAndUnlock() {
    if (!currentDPP || !currentAccount) return;

    console.log('========================================');
    console.log('RECYCLER: VERIFY & UNLOCK');
    console.log('========================================');
    console.log('DPP ID:', currentDPP.id);
    console.log('Reward: $', currentDPP.lockedReward.toFixed(2));

    setVerifying(true);

    const result = await storage.verifyAndUnlock(currentDPP.id, signTx as Parameters<typeof storage.verifyAndUnlock>[1]);

    if (result.success) {
      console.log('Transaction ID:', result.transactionId);
      console.log('========================================\n');

      setTimeout(() => {
        loadDPPs();
      }, 2000);
    } else {
      console.error('Error:', result.error);
      alert('Failed to verify and unlock: ' + result.error);
    }

    setVerifying(false);
  }

  function handleReset() {
    console.log('RESET');
    setCurrentDPP(null);
    setGtin('');
    setLookupGtin('');
  }

  const tabs: Tab[] = [
    { id: 'manufacturer', label: 'Manufacturer', color: '#2563eb' },
    { id: 'consumer', label: 'Consumer', color: '#059669' },
    { id: 'recycler', label: 'Recycler', color: '#d97706' },
  ];

  const getStatusLabel = (status: number) => {
    switch (status) {
      case DPP_STATUS.ACTIVE: return 'Active';
      case DPP_STATUS.END_OF_LIFE: return 'End of Life';
      case DPP_STATUS.RECYCLED: return 'Recycled';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#f8fafc',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Digital Product Passport
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Tabulas · MasterZ × IOTA Hackathon
            </p>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
              IOTA Testnet
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', width: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('wardrobe')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: activeTab === 'wardrobe' ? '2px solid #8b5cf6' : '2px solid #334155',
                  background: activeTab === 'wardrobe' ? '#8b5cf620' : 'transparent',
                  color: activeTab === 'wardrobe' ? '#8b5cf6' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
              >
                Wardrobe
              </button>
              <ConnectButton />
            </div>
            {currentAccount && (
              <div style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '12px',
                color: '#f8fafc',
                fontFamily: 'monospace',
              }}>
                Connected: {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid #334155',
              background: activeTab === tab.id ? `${tab.color}20` : 'transparent',
              color: activeTab === tab.id ? tab.color : '#94a3b8',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        background: '#1e293b',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #334155',
      }}>

        {/* MANUFACTURER VIEW */}
        {activeTab === 'manufacturer' && (
          <div>
            {!postPtbQrGtin ? (
              <>
                <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#2563eb' }}>
                  Create Digital Product Passport
                </h2>

                {/* PTB Toggle */}
                <div style={{
                  marginBottom: '20px',
                  padding: '12px',
                  background: usePTB ? 'rgba(37, 99, 235, 0.12)' : '#33415520',
                  border: `1px solid ${usePTB ? '#2563eb' : '#334155'}`,
                  borderRadius: '8px',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={usePTB}
                      onChange={(e) => setUsePTB(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: usePTB ? '#2563eb' : '#94a3b8' }}>
                        Use PTB (Atomic Transaction)
                      </div>
                      <div style={{ fontSize: '11px', color: usePTB ? '#60a5fa' : '#64748b' }}>
                        {usePTB ? 'Create + Index in one transaction' : 'Create only (no registry)'}
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    GTIN (Product Identifier)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={gtin}
                      onChange={(e) => setGtin(e.target.value)}
                      placeholder="Enter GTIN..."
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        background: '#0f172a',
                        color: '#f8fafc',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      onClick={generateGTIN}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        background: '#1e293b',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    Material Composition
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontSize: '16px',
                    }}
                  >
                    <option value="100% Organic Cotton">100% Organic Cotton</option>
                    <option value="100% Cotton">100% Cotton</option>
                    <option value="Cotton/Polyester Blend">Cotton/Polyester Blend</option>
                    <option value="100% Polyester">100% Polyester</option>
                    <option value="Recycled Materials">Recycled Materials</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    Recycling Reward ($)
                  </label>
                  <input
                    type="number"
                    value={lockedReward}
                    onChange={(e) => setLockedReward(Number(e.target.value))}
                    min={1}
                    max={20}
                    step={1}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={handleCreateDPP}
                  disabled={creating || !gtin.trim()}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: creating || !gtin.trim()
                      ? '#64748b'
                      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: creating || !gtin.trim() ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.7 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {creating && (
                    <span style={{
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                      marginRight: '8px',
                      verticalAlign: 'middle',
                    }} />
                  )}
                  {creating
                    ? 'Creating on blockchain...'
                    : usePTB
                      ? 'Create DPP + Index (PTB)'
                      : 'Create DPP'}
                </button>
              </>
            ) : (
              <div
                style={{
                  padding: '20px',
                  background: '#0f172a',
                  borderRadius: '16px',
                  border: '1px solid #334155',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', marginBottom: '16px' }}>
                  DPP created & indexed
                </div>
                <button
                  type="button"
                  onClick={() => void handleOpenConsumerFromQr()}
                  disabled={openingConsumerFromQr}
                  title="Open Consumer view for this GTIN"
                  style={{
                    display: 'inline-block',
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    border: '2px solid #059669',
                    cursor: openingConsumerFromQr ? 'wait' : 'pointer',
                    lineHeight: 0,
                  }}
                >
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="QR code — click to open Consumer passport" width={220} height={220} />
                  ) : (
                    <div
                      style={{
                        width: 220,
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '13px',
                      }}
                    >
                      Generating QR…
                    </div>
                  )}
                </button>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
                  Click the QR to open the Consumer view (same as scanning it).
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    marginBottom: '12px',
                    textAlign: 'left',
                  }}
                >
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}${window.location.pathname}?gtin=${encodeURIComponent(postPtbQrGtin)}`
                    : `?gtin=${encodeURIComponent(postPtbQrGtin)}`}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPostPtbQrGtin(null)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Create another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WARDROBE (registry lookup) */}
        {activeTab === 'wardrobe' && (
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '24px',
                border: '1px solid #334155',
                minHeight: '380px',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(/wardrobe.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.82) 45%, rgba(15,23,42,0.92) 100%)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
                <h2 style={{ fontSize: '22px', marginBottom: '8px', color: '#e9d5ff', fontWeight: '700' }}>
                  Wardrobe lookup
                </h2>
                <p style={{ fontSize: '13px', color: '#c4b5fd', marginBottom: '20px', opacity: 0.95 }}>
                  Find a passport by the GTIN on the label.
                </p>

                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#c4b5fd', marginBottom: '8px' }}>
                    Wardrobe (GTIN → DPP)
                  </div>
                  <div style={{ fontSize: '14px', color: '#f8fafc', lineHeight: 1.5 }}>
                    On-chain, a <strong>shared registry</strong> holds a <strong>Table&lt;String, ID&gt;</strong> mapping GTINs to DPP IDs — your digital wardrobe.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#e2e8f0', marginBottom: '8px' }}>
                    Lookup DPP by GTIN
                  </label>
                  <input
                    type="text"
                    value={lookupGtin}
                    onChange={(e) => setLookupGtin(e.target.value)}
                    placeholder="Enter GTIN to lookup..."
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(148, 163, 184, 0.4)',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      marginBottom: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleLookupGTIN}
                    disabled={looking || !lookupGtin.trim()}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background:
                        looking || !lookupGtin.trim()
                          ? '#64748b'
                          : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: looking || !lookupGtin.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {looking ? 'Searching...' : 'Lookup in Wardrobe'}
                  </button>
                </div>
              </div>
            </div>

            {/* Show owned DPPs */}
            {allDPPs.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>
                  Your DPPs ({allDPPs.length})
                </div>
                {allDPPs.map(dpp => (
                  <div
                    key={dpp.id}
                    onClick={() => {
                      setCurrentDPP(dpp);
                      setActiveTab('consumer');
                    }}
                    style={{
                      padding: '12px',
                      background: '#0f172a',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#f8fafc', fontFamily: 'monospace' }}>
                          GTIN: {dpp.gtin}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {dpp.material}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: dpp.status === DPP_STATUS.ACTIVE ? '#22c55e20' :
                          dpp.status === DPP_STATUS.END_OF_LIFE ? '#f59e0b20' : '#8b5cf620',
                        color: dpp.status === DPP_STATUS.ACTIVE ? '#22c55e' :
                          dpp.status === DPP_STATUS.END_OF_LIFE ? '#f59e0b' : '#8b5cf6',
                      }}>
                        {getStatusLabel(dpp.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONSUMER VIEW */}
        {activeTab === 'consumer' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#059669' }}>
              My Product
            </h2>

            {!currentDPP ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                <p>No product selected</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Create one in Manufacturer tab or lookup by GTIN in Wardrobe
                </p>
              </div>
            ) : currentDPP.status === DPP_STATUS.RECYCLED ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>Reward Claimed!</div>
                <h3 style={{ color: '#22c55e', marginBottom: '8px' }}>Reward Claimed!</h3>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#22c55e',
                  marginBottom: '16px',
                }}>
                  ${currentDPP.originalReward.toFixed(2)}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sent to consumer wallet</p>
                <a
                  href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '12px', fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
                >
                  View on IOTA Explorer →
                </a>
              </div>
            ) : (
              <>
                <div style={{
                  background: '#0f172a',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <span>GTIN</span>
                      <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{currentDPP.gtin}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <span>Material</span>
                      <span style={{ color: '#f8fafc' }}>{currentDPP.material}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <span>Status</span>
                      <span style={{ color: '#f8fafc' }}>{getStatusLabel(currentDPP.status)}</span>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Recycling Reward</span>
                        <span style={{ color: '#22c55e', fontWeight: '600' }}>${currentDPP.lockedReward.toFixed(2)}</span>
                      </div>
                      {currentDPP.status === DPP_STATUS.ACTIVE && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                          Bring to recycling point to claim
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#64748b',
                    textDecoration: 'none',
                  }}
                >
                  View on IOTA Explorer →
                </a>

                {currentDPP.status === DPP_STATUS.ACTIVE && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                        Your wallet address (for reward payout)
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                        The recycler will use this address to pay you. When you Mark End of Life, your connected wallet is recorded on the product.
                      </p>
                      <input
                        type="text"
                        value={consumerRewardAddress}
                        onChange={(e) => setConsumerRewardAddress(e.target.value)}
                        placeholder="0x..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                          background: '#0f172a',
                          color: '#f8fafc',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                        }}
                      />
                      {currentAccount?.address && (
                        <button
                          type="button"
                          onClick={() => setConsumerRewardAddress(currentAccount.address)}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #334155',
                            background: 'transparent',
                            color: '#059669',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Use my connected wallet
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleMarkEndOfLife}
                      disabled={marking}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: marking
                          ? '#64748b'
                          : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: marking ? 'not-allowed' : 'pointer',
                        opacity: marking ? 0.7 : 1,
                      }}
                    >
                      {marking && (
                        <span style={{
                          display: 'inline-block',
                          width: '14px',
                          height: '14px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                          marginRight: '8px',
                          verticalAlign: 'middle',
                        }} />
                      )}
                      {marking ? 'Processing...' : 'Mark End of Life'}
                    </button>
                  </>
                )}

                {currentDPP.status === DPP_STATUS.END_OF_LIFE && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('recycler')}
                    title="Open Recycler — verify & unlock"
                    style={{
                      width: '100%',
                      background: 'rgba(5, 150, 105, 0.12)',
                      border: '1px solid #059669',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                    }}
                  >
                    <p style={{ color: '#059669', fontWeight: '600', margin: '0 0 4px 0' }}>
                      Awaiting Recycler Confirmation
                    </p>
                    <p style={{ fontSize: '12px', color: '#6ee7b7', margin: 0 }}>
                      Bring product to a recycling point
                    </p>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Selection
                </button>
              </>
            )}
          </div>
        )}

        {/* RECYCLER VIEW */}
        {activeTab === 'recycler' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#d97706' }}>
              Verify & Unlock
            </h2>

            {!currentDPP ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>Scan</div>
                <p>Scan incoming product DPP</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  (Select a product in Consumer tab first)
                </p>
              </div>
            ) : currentDPP.status !== DPP_STATUS.END_OF_LIFE && currentDPP.status !== DPP_STATUS.RECYCLED ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>Waiting</div>
                <p>Product still in use</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Consumer hasn&apos;t marked End of Life yet
                </p>
              </div>
            ) : currentDPP.status === DPP_STATUS.RECYCLED ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>Done</div>
                <h3 style={{ color: '#d97706', marginBottom: '16px' }}>Recycling Verified</h3>
                <div style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  border: '1px solid rgba(217, 119, 6, 0.35)',
                }}>
                  <p style={{ color: '#fb923c', marginBottom: '0', fontWeight: '600' }}>
                    ${currentDPP.originalReward.toFixed(2)} released to consumer
                  </p>
                </div>
                <a
                  href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: '8px', fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
                >
                  View on IOTA Explorer →
                </a>
                <button
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Scan Next Item
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  background: '#0f172a',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}>
                  <p style={{ fontSize: '12px', color: '#d97706', marginBottom: '12px' }}>
                    MANUFACTURER CLAIMS:
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                    {currentDPP.material}
                  </p>

                  <div style={{
                    borderTop: '1px solid #334155',
                    paddingTop: '16px',
                    fontSize: '14px',
                    color: '#94a3b8',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>GTIN</span>
                      <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>
                        {currentDPP.gtin}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>DPP ID</span>
                      <span style={{ fontFamily: 'monospace', color: '#f8fafc', fontSize: '11px' }}>
                        {currentDPP.id.slice(0, 12)}...
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Locked Reward</span>
                      <span style={{ color: '#d97706', fontWeight: '600' }}>${currentDPP.lockedReward.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://explorer.iota.org/object/${currentDPP.id}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#64748b',
                    textDecoration: 'none',
                  }}
                >
                  View on IOTA Explorer →
                </a>

                <button
                  onClick={handleVerifyAndUnlock}
                  disabled={verifying}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: verifying ? '#64748b' : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: verifying ? 'not-allowed' : 'pointer',
                    opacity: verifying ? 0.7 : 1,
                  }}
                >
                  {verifying && (
                    <span style={{
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                      marginRight: '8px',
                      verticalAlign: 'middle',
                    }} />
                  )}
                  {verifying ? 'Verifying on blockchain...' : `Verify & Unlock $${currentDPP.lockedReward.toFixed(2)}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '12px',
        color: '#64748b',
      }}>
        <p>Built for MasterZ x IOTA Hackathon</p>
      </div>
    </div>
  );
};

export default DPPApp;
