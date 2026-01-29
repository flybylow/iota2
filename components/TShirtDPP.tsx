'use client';

import React, { useState, useEffect } from 'react';
import { TShirtDPP as DPPType, DPP_STATUS } from '@/lib/types';
import * as storage from '@/lib/storage-blockchain';
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from '@iota/dapp-kit';

interface Tab {
  id: 'manufacturer' | 'consumer' | 'recycler';
  label: string;
  color: string;
}

const TShirtDPP = () => {
  // Wallet connection
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [activeTab, setActiveTab] = useState<'manufacturer' | 'consumer' | 'recycler'>('manufacturer');
  
  // Current DPP being viewed
  const [currentDPP, setCurrentDPP] = useState<DPPType | null>(null);
  const [allDPPs, setAllDPPs] = useState<DPPType[]>([]);
  
  // Debug: Log when currentDPP changes
  useEffect(() => {
    console.log('📌 currentDPP changed:', currentDPP ? {
      id: currentDPP.id.slice(0, 10) + '...',
      status: currentDPP.status,
      material: currentDPP.material,
      reward: currentDPP.lockedReward
    } : 'null');
  }, [currentDPP]);
  
  // Form state
  const [consumerWallet, setConsumerWallet] = useState('');
  const [material, setMaterial] = useState('100% Organic Cotton');
  const [lockedReward, setLockedReward] = useState(5);
  
  // Loading states
  const [creating, setCreating] = useState(false);
  const [marking, setMarking] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Load DPPs from storage on mount
  useEffect(() => {
    loadDPPs();
    console.log('═══════════════════════════════════════');
    console.log('🎬 T-SHIRT DPP APP INITIALIZED');
    console.log('═══════════════════════════════════════');
    console.log('App Version: IOTA Blockchain');
    console.log('TypeScript: ✅ Properly structured');
    console.log('Storage: IOTA Testnet 🚀');
    console.log('Wallet:', currentAccount?.address || 'Not connected');
    console.log('Status: Ready for blockchain transactions ✅');
    console.log('═══════════════════════════════════════\n');
  }, [currentAccount]);

  async function loadDPPs() {
    if (!currentAccount) return;
    
    const dpps = await storage.getDPPsByOwner(currentAccount.address);
    setAllDPPs(dpps);
    
    // If we have a current DPP, refresh it
    if (currentDPP) {
      const updated = dpps.find(d => d.id === currentDPP.id);
      if (updated) {
        setCurrentDPP(updated);
      }
    }
  }

  const handleTabChange = (tabId: 'manufacturer' | 'consumer' | 'recycler') => {
    console.log('🔄 TAB CHANGE:', activeTab, '→', tabId);
    setActiveTab(tabId);
  };

  async function handleCreateDPP() {
    if (!currentAccount) {
      alert('Please connect your wallet first!');
      return;
    }
    
    console.log('═══════════════════════════════════════');
    console.log('🏭 MANUFACTURER: CREATE DPP');
    console.log('═══════════════════════════════════════');
    console.log('Input:');
    console.log('  Material:', material);
    console.log('  Locked Reward: $', lockedReward.toFixed(2));
    console.log('  Recipient:', currentAccount.address);
    
    setCreating(true);
    
    const result = await storage.createDPP(
      material,
      lockedReward,
      currentAccount.address,
      signAndExecute
    );
    
    if (result.success) {
      console.log('Output:');
      console.log('  Transaction ID:', result.transactionId);
      console.log('  Status: DPP Created Successfully ✅');
      console.log('  View on Explorer: https://explorer.iota.org/txblock/' + result.transactionId + '?network=testnet');
      console.log('═══════════════════════════════════════\n');
      
      // Query all DPPs owned by user and show the newly created ACTIVE one
      setTimeout(async () => {
        console.log('🔍 Fetching your DPPs from blockchain...');
        const dpps = await storage.getDPPsByOwner(currentAccount.address);
        setAllDPPs(dpps);
        
        if (dpps.length > 0) {
          // Find the first ACTIVE DPP (status = 0) - this will be the newly created one
          const activeDPP = dpps.find(dpp => dpp.status === DPP_STATUS.ACTIVE);
          
          if (activeDPP) {
            setCurrentDPP(activeDPP);
            console.log('✅ Displaying newly created DPP:', activeDPP.id);
          } else {
            // Fallback: show the first DPP
            setCurrentDPP(dpps[0]);
            console.log('✅ No active DPP, showing first DPP:', dpps[0].id);
          }
        } else {
          console.log('⚠️ No DPPs found for your wallet yet');
        }
      }, 2000); // Wait 2 seconds for blockchain to index
    } else {
      console.error('Error:', result.error);
      alert('Failed to create DPP: ' + result.error);
    }
    
    setCreating(false);
  }

  async function handleMarkEndOfLife() {
    if (!currentDPP || !currentAccount) return;
    
    console.log('═══════════════════════════════════════');
    console.log('👤 CONSUMER: MARK END OF LIFE');
    console.log('═══════════════════════════════════════');
    console.log('Input:');
    console.log('  DPP ID:', currentDPP.id);
    console.log('  Consumer Wallet:', currentAccount.address);
    
    setMarking(true);
    
    const result = await storage.markEndOfLife(currentDPP.id, signAndExecute);
    
    if (result.success) {
      console.log('Output:');
      console.log('  Transaction ID:', result.transactionId);
      console.log('  Status: End of Life Marked ✅');
      console.log('  View on Explorer: https://explorer.iota.org/txblock/' + result.transactionId + '?network=testnet');
      console.log('═══════════════════════════════════════\n');
      
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
    
    console.log('═══════════════════════════════════════');
    console.log('♻️ RECYCLER: VERIFY & UNLOCK');
    console.log('═══════════════════════════════════════');
    console.log('Input:');
    console.log('  DPP ID:', currentDPP.id);
    console.log('  Material:', currentDPP.material);
    console.log('  Reward: $', currentDPP.lockedReward.toFixed(2));
    
    setVerifying(true);
    
    const result = await storage.verifyAndUnlock(currentDPP.id, signAndExecute);
    
    if (result.success) {
      console.log('Output:');
      console.log('  Transaction ID:', result.transactionId);
      console.log('  Status: Reward Unlocked ✅');
      console.log('  View on Explorer: https://explorer.iota.org/txblock/' + result.transactionId + '?network=testnet');
      console.log('═══════════════════════════════════════\n');
      
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
    console.log('🔄 RESET DEMO');
    storage.clearAllData();
    setCurrentDPP(null);
    setAllDPPs([]);
    setConsumerWallet('');
  }

  function useMyWallet() {
    if (!currentAccount) {
      alert('Please connect your wallet first!');
      return;
    }
    console.log('👛 Using your wallet:', currentAccount.address);
    setConsumerWallet(currentAccount.address);
  }

  // State for showing all t-shirts overview
  const [showAllTShirts, setShowAllTShirts] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'eol' | 'recycled'>('all');
  
  const tabs: Tab[] = [
    { id: 'manufacturer', label: '🏭 Manufacturer', color: '#2563eb' },
    { id: 'consumer', label: '👤 Consumer', color: '#059669' },
    { id: 'recycler', label: '♻️ Recycler', color: '#d97706' },
  ];

  const getStatusLabel = (status: number) => {
    switch (status) {
      case DPP_STATUS.ACTIVE: return '🟢 Active';
      case DPP_STATUS.END_OF_LIFE: return '🟡 End of Life';
      case DPP_STATUS.RECYCLED: return '✅ Recycled';
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
              👕 T-Shirt Digital Product Passport
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Track products • Verify materials • Unlock recycling rewards
            </p>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
              🚀 IOTA Testnet • Blockchain Connected
            </p>
          </div>
          <div>
            <ConnectButton />
          </div>
        </div>
        {currentAccount && (
          <div style={{ 
            textAlign: 'center',
            padding: '8px 16px',
            background: '#22c55e20',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#22c55e',
            fontFamily: 'monospace'
          }}>
            ✅ Connected: {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        justifyContent: 'center',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
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

      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px',
        fontSize: '12px',
      }}>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px',
          background: currentDPP ? '#22c55e20' : '#64748b20',
          color: currentDPP ? '#22c55e' : '#64748b',
        }}>
          {currentDPP ? '✓ DPP Selected' : '○ No DPP'}
        </span>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px',
          background: currentDPP?.status === DPP_STATUS.END_OF_LIFE || currentDPP?.status === DPP_STATUS.RECYCLED ? '#22c55e20' : '#64748b20',
          color: currentDPP?.status === DPP_STATUS.END_OF_LIFE || currentDPP?.status === DPP_STATUS.RECYCLED ? '#22c55e' : '#64748b',
        }}>
          {currentDPP?.status === DPP_STATUS.END_OF_LIFE || currentDPP?.status === DPP_STATUS.RECYCLED ? '✓ End of Life' : '○ Active'}
        </span>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px',
          background: currentDPP?.status === DPP_STATUS.RECYCLED ? '#22c55e20' : '#64748b20',
          color: currentDPP?.status === DPP_STATUS.RECYCLED ? '#22c55e' : '#64748b',
        }}>
          {currentDPP?.status === DPP_STATUS.RECYCLED ? '✓ Recycled' : '○ Not Recycled'}
        </span>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px',
          background: allDPPs.length > 0 ? '#3b82f620' : '#64748b20',
          color: allDPPs.length > 0 ? '#3b82f6' : '#64748b',
        }}>
          {allDPPs.length} DPP{allDPPs.length !== 1 ? 's' : ''} in storage
        </span>
      </div>

      {/* Content Card */}
      <div style={{
        maxWidth: (activeTab === 'consumer' && showAllTShirts) ? '1400px' : '400px',
        margin: '0 auto',
        background: '#1e293b',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #334155',
      }}>
        
        {/* MANUFACTURER VIEW */}
        {activeTab === 'manufacturer' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#2563eb' }}>
              🏭 Create Digital Product Passport
            </h2>
            
            {!currentDPP || currentDPP.status === DPP_STATUS.RECYCLED ? (
              <>
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
                  disabled={creating}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: creating ? '#64748b' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? '⏳ Creating...' : '🔒 Create DPP & Lock Reward'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                {console.log('🖼️ Rendering QR code view for DPP:', currentDPP.id)}
                <div style={{
                  width: '220px',
                  height: '220px',
                  margin: '0 auto 32px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img 
                    src="/qr-code.png" 
                    alt="DPP QR Code"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '11px', 
                  color: '#94a3b8',
                  marginBottom: '24px',
                  wordBreak: 'break-all',
                }}>
                  ID: {currentDPP.id.slice(0, 20)}...
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: '1px solid #334155',
                  fontSize: '15px',
                }}>
                  <span style={{ color: '#94a3b8' }}>Material</span>
                  <span style={{ color: '#f8fafc', fontWeight: '500' }}>{currentDPP.material}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: '1px solid #334155',
                  fontSize: '15px',
                }}>
                  <span style={{ color: '#94a3b8' }}>Locked Reward</span>
                  <span style={{ color: '#22c55e', fontWeight: '600' }}>
                    ${currentDPP.lockedReward.toFixed(2)} 🔒
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: '1px solid #334155',
                  fontSize: '15px',
                }}>
                  <span style={{ color: '#94a3b8' }}>Status</span>
                  <span style={{ color: '#f8fafc', fontWeight: '500' }}>
                    {getStatusLabel(currentDPP.status)}
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Reset Demo
                </button>
              </div>
            )}
          </div>
        )}

        {/* CONSUMER VIEW */}
        {activeTab === 'consumer' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', color: '#059669', margin: 0, marginBottom: '4px' }}>
                  {showAllTShirts ? '👕 All My T-Shirts' : '👤 My T-Shirt'}
                </h2>
                {showAllTShirts && allDPPs.length > 0 && (() => {
                  const totalClaimed = allDPPs
                    .filter(dpp => dpp.status === DPP_STATUS.RECYCLED)
                    .reduce((sum, dpp) => sum + (dpp.originalReward || 0), 0);
                  
                  if (totalClaimed > 0) {
                    return (
                      <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <span>Total claimed:</span>
                        <span style={{
                          color: '#22c55e',
                          fontWeight: '600',
                          fontSize: '12px',
                        }}>
                          ${totalClaimed.toFixed(2)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <button
                onClick={() => setShowAllTShirts(!showAllTShirts)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #059669',
                  background: showAllTShirts ? '#059669' : 'transparent',
                  color: showAllTShirts ? '#fff' : '#059669',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
              >
                {showAllTShirts ? '← Single View' : `📊 View All (${allDPPs.length})`}
              </button>
            </div>
            
            {showAllTShirts ? (
              // ALL T-SHIRTS VIEW
              <div>
                {/* Filter Buttons */}
                {currentAccount && allDPPs.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px', 
                    marginBottom: '20px',
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {[
                      { id: 'all', label: 'All', count: allDPPs.length },
                      { id: 'active', label: 'Active', count: allDPPs.filter(d => d.status === DPP_STATUS.ACTIVE).length },
                      { id: 'eol', label: 'End of Life', count: allDPPs.filter(d => d.status === DPP_STATUS.END_OF_LIFE).length },
                      { id: 'recycled', label: 'Recycled', count: allDPPs.filter(d => d.status === DPP_STATUS.RECYCLED).length },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id as any)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${statusFilter === filter.id ? '#059669' : 'rgba(148, 163, 184, 0.3)'}`,
                          background: statusFilter === filter.id ? 'rgba(5, 150, 105, 0.15)' : 'transparent',
                          color: statusFilter === filter.id ? '#059669' : '#94a3b8',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: statusFilter === filter.id ? '600' : '400',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {filter.label} <span style={{ opacity: 0.6 }}>({filter.count})</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {!currentAccount ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <p>👛 Connect your wallet to view your t-shirts</p>
                  </div>
                ) : allDPPs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👕</div>
                    <p>No t-shirts in your collection yet</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Go to Manufacturer tab to create one!
                    </p>
                  </div>
                ) : (() => {
                  const filteredDPPs = allDPPs.filter(dpp => {
                    if (statusFilter === 'all') return true;
                    if (statusFilter === 'active') return dpp.status === DPP_STATUS.ACTIVE;
                    if (statusFilter === 'eol') return dpp.status === DPP_STATUS.END_OF_LIFE;
                    if (statusFilter === 'recycled') return dpp.status === DPP_STATUS.RECYCLED;
                    return true;
                  });
                  
                  if (filteredDPPs.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                        <p style={{ fontSize: '14px' }}>No t-shirts match this filter</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: '24px',
                    }}>
                      {filteredDPPs.map((dpp) => (
                      <div
                        key={dpp.id}
                        onClick={() => {
                          setCurrentDPP(dpp);
                          setShowAllTShirts(false);
                          console.log('📌 Selected DPP:', dpp.id);
                        }}
                        style={{
                          background: 'rgba(15, 23, 42, 0.4)',
                          backdropFilter: 'blur(8px)',
                          border: `1px solid ${
                            dpp.status === DPP_STATUS.ACTIVE ? 'rgba(34, 197, 94, 0.3)' :
                            dpp.status === DPP_STATUS.END_OF_LIFE ? 'rgba(245, 158, 11, 0.3)' : 
                            'rgba(139, 92, 246, 0.25)'
                          }`,
                          borderRadius: '12px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          const hoverBorder = dpp.status === DPP_STATUS.ACTIVE ? 'rgba(34, 197, 94, 0.5)' :
                                            dpp.status === DPP_STATUS.END_OF_LIFE ? 'rgba(245, 158, 11, 0.5)' : 
                                            'rgba(139, 92, 246, 0.4)';
                          e.currentTarget.style.borderColor = hoverBorder;
                          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          const baseBorder = dpp.status === DPP_STATUS.ACTIVE ? 'rgba(34, 197, 94, 0.3)' :
                                           dpp.status === DPP_STATUS.END_OF_LIFE ? 'rgba(245, 158, 11, 0.3)' : 
                                           'rgba(139, 92, 246, 0.25)';
                          e.currentTarget.style.borderColor = baseBorder;
                          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Status Badge - Minimal */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          fontSize: '9px',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          background: dpp.status === DPP_STATUS.ACTIVE ? 'rgba(34, 197, 94, 0.15)' :
                                      dpp.status === DPP_STATUS.END_OF_LIFE ? 'rgba(245, 158, 11, 0.15)' : 
                                      'rgba(139, 92, 246, 0.15)',
                          border: `1px solid ${
                            dpp.status === DPP_STATUS.ACTIVE ? 'rgba(34, 197, 94, 0.3)' :
                            dpp.status === DPP_STATUS.END_OF_LIFE ? 'rgba(245, 158, 11, 0.3)' :
                            'rgba(139, 92, 246, 0.3)'
                          }`,
                          color: dpp.status === DPP_STATUS.ACTIVE ? '#22c55e' :
                                 dpp.status === DPP_STATUS.END_OF_LIFE ? '#f59e0b' : '#8b5cf6',
                          fontWeight: '500',
                        }}>
                          {dpp.status === DPP_STATUS.ACTIVE ? '✓' : 
                           dpp.status === DPP_STATUS.END_OF_LIFE ? '⏳' : '♻️'}
                        </div>

                        {/* T-Shirt Visual - Minimal */}
                        <div style={{
                          textAlign: 'center',
                          marginBottom: '16px',
                          fontSize: '64px',
                          opacity: dpp.status === DPP_STATUS.RECYCLED ? 0.5 : 0.9,
                          filter: dpp.status === DPP_STATUS.RECYCLED ? 'grayscale(70%)' : 'none',
                        }}>
                          👕
                        </div>

                        {/* DPP Info - Minimal */}
                        <div style={{
                          background: dpp.status === DPP_STATUS.ACTIVE
                            ? 'rgba(34, 197, 94, 0.1)'
                            : dpp.status === DPP_STATUS.END_OF_LIFE
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(139, 92, 246, 0.1)',
                          border: `1px solid ${
                            dpp.status === DPP_STATUS.ACTIVE ? 'rgba(34, 197, 94, 0.2)' :
                            dpp.status === DPP_STATUS.END_OF_LIFE ? 'rgba(245, 158, 11, 0.2)' :
                            'rgba(139, 92, 246, 0.2)'
                          }`,
                          borderRadius: '6px',
                          padding: '10px',
                          marginBottom: '12px',
                          fontSize: '11px',
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            marginBottom: '4px', 
                            fontSize: '13px',
                            color: '#f8fafc',
                          }}>
                            {dpp.material}
                          </div>
                          <div style={{ 
                            fontSize: '10px',
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                          }}>
                            {dpp.id.slice(0, 8)}...{dpp.id.slice(-4)}
                          </div>
                        </div>

                        {/* Age and Dates */}
                        <div style={{
                          fontSize: '10px',
                          color: '#64748b',
                          marginBottom: '12px',
                          paddingBottom: '10px',
                          borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                        }}>
                          {(() => {
                            const now = Date.now();
                            const ageMs = now - dpp.createdAt;
                            const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
                            const ageMonths = Math.floor(ageDays / 30);
                            const ageYears = Math.floor(ageDays / 365);
                            
                            let ageText = '';
                            if (ageYears > 0) ageText = `${ageYears}y old`;
                            else if (ageMonths > 0) ageText = `${ageMonths}mo old`;
                            else if (ageDays > 0) ageText = `${ageDays}d old`;
                            else ageText = 'New';
                            
                            return (
                              <div>
                                <div style={{ marginBottom: '3px' }}>
                                  <span style={{ opacity: 0.7 }}>Age:</span> {ageText}
                                </div>
                                {dpp.endOfLifeAt && (
                                  <div style={{ opacity: 0.7 }}>
                                    EOL: {new Date(dpp.endOfLifeAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Reward Display */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                        }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Reward
                          </span>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: dpp.status === DPP_STATUS.RECYCLED ? '#64748b' : '#22c55e',
                          }}>
                            ${dpp.status === DPP_STATUS.RECYCLED 
                              ? (dpp.originalReward || 0).toFixed(2) 
                              : dpp.lockedReward.toFixed(2)}
                          </span>
                        </div>

                        {dpp.status === DPP_STATUS.RECYCLED && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '11px',
                            color: '#8b5cf6',
                            textAlign: 'center',
                            fontWeight: '600',
                          }}>
                            ✅ Claimed
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              // SINGLE T-SHIRT VIEW (original)
              <div>
                {!currentDPP ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p>Scan a DPP QR code to view t-shirt</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  (Create one in Manufacturer tab first)
                </p>
              </div>
            ) : currentDPP.status === DPP_STATUS.RECYCLED ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ color: '#22c55e', marginBottom: '8px' }}>Reward Claimed!</h3>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#22c55e',
                  marginBottom: '16px',
                }}>
                  ${currentDPP.originalReward.toFixed(2)}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sent to your wallet</p>
                <p style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginTop: '8px',
                  wordBreak: 'break-all',
                }}>
                  {currentDPP.consumer}
                </p>
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
                      <span>Material</span>
                      <span style={{ color: '#f8fafc' }}>{currentDPP.material}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <span>Manufacturer</span>
                      <span style={{ color: '#f8fafc' }}>{currentDPP.manufacturer}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span>Recycling Reward</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>${currentDPP.lockedReward.toFixed(2)} 🔒</span>
                    </div>
                  </div>
                </div>

                {currentDPP.status !== DPP_STATUS.END_OF_LIFE ? (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '20px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                        💰 ${currentDPP.lockedReward.toFixed(2)} waiting for you
                      </p>
                      <p style={{ fontSize: '12px', opacity: 0.9 }}>
                        Bring to recycling point to claim
                      </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                        Your Wallet Address (to receive reward)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={consumerWallet}
                          onChange={(e) => setConsumerWallet(e.target.value)}
                          placeholder="0x..."
                          style={{
                            width: '100%',
                            padding: '14px',
                            paddingRight: '140px',
                            borderRadius: '12px',
                            border: '1px solid #334155',
                            background: '#0f172a',
                            color: '#f8fafc',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          onClick={useMyWallet}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: '#1e293b',
                            color: '#94a3b8',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                        >
                          Use My Wallet
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleMarkEndOfLife}
                      disabled={!consumerWallet.trim() || marking}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: consumerWallet.trim() && !marking
                          ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                          : '#334155',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: consumerWallet.trim() && !marking ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {marking ? '⏳ Marking...' : '🏁 Mark End of Life'}
                    </button>
                  </>
                ) : (
                  <div style={{
                    background: '#d9770620',
                    border: '1px solid #d97706',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                  }}>
                    <p style={{ color: '#d97706', fontWeight: '600', marginBottom: '4px' }}>
                      ⏳ Awaiting Recycler Confirmation
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Bring t-shirt to a recycling point
                    </p>
                  </div>
                )}
              </>
            )}
              </div>
            )}
          </div>
        )}

        {/* RECYCLER VIEW */}
        {activeTab === 'recycler' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#d97706' }}>
              ♻️ Verify & Unlock
            </h2>
            
            {!currentDPP ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p>Scan incoming t-shirt DPP</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  (Create one in Manufacturer tab first)
                </p>
              </div>
            ) : currentDPP.status !== DPP_STATUS.END_OF_LIFE && currentDPP.status !== DPP_STATUS.RECYCLED ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>T-shirt still in use</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Consumer hasn&apos;t marked End of Life yet
                </p>
              </div>
            ) : currentDPP.status === DPP_STATUS.RECYCLED ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: '#22c55e', marginBottom: '16px' }}>Recycling Verified</h3>
                <div style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                }}>
                  <p style={{ color: '#94a3b8', marginBottom: '8px' }}>
                    ${currentDPP.originalReward.toFixed(2)} released to:
                  </p>
                  <p style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px',
                    color: '#22c55e',
                    wordBreak: 'break-all',
                  }}>
                    {currentDPP.consumer}
                  </p>
                </div>
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
                      <span>DPP ID</span>
                      <span style={{ fontFamily: 'monospace', color: '#f8fafc', fontSize: '11px' }}>
                        {currentDPP.id.slice(0, 12)}...
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Manufacturer</span>
                      <span style={{ color: '#f8fafc' }}>{currentDPP.manufacturer}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Consumer Wallet</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#f8fafc' }}>
                        {currentDPP.consumer ? currentDPP.consumer.slice(0, 8) + '...' : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Locked Reward</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>${currentDPP.lockedReward.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleVerifyAndUnlock}
                  disabled={verifying}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: verifying ? '#64748b' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: verifying ? 'not-allowed' : 'pointer',
                  }}
                >
                  {verifying ? '⏳ Verifying...' : `✓ Verify Material & Unlock $${currentDPP.lockedReward.toFixed(2)}`}
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
        <p>Built for MasterZ × IOTA Hackathon</p>
        <p style={{ marginTop: '4px' }}>Tabulas • Circular Economy Infrastructure</p>
      </div>
    </div>
  );
};

export default TShirtDPP;
