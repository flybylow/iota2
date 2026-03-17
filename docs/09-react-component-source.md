# React Component Source Code

## File: TShirtEscrow.jsx

This document contains the complete source code for the T-Shirt Escrow React component. This is the actual working prototype shown in the demo.

---

## Full Component Code

```jsx
import React, { useState } from 'react';

const TShirtEscrow = () => {
  const [activeTab, setActiveTab] = useState('producer');
  
  // Mock DPP state (would be blockchain in production)
  const [dpp, setDpp] = useState(null);
  const [consumerWallet, setConsumerWallet] = useState('');
  const [endOfLifeMarked, setEndOfLifeMarked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Producer form state
  const [material, setMaterial] = useState('100% Organic Cotton');
  const [lockedValue, setLockedValue] = useState(2);

  const createDPP = () => {
    setDpp({
      id: 'DPP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      material,
      lockedValue,
      producer: 'EcoThreads Belgium',
      createdAt: new Date().toISOString(),
    });
    setEndOfLifeMarked(false);
    setUnlocked(false);
    setConsumerWallet('');
  };

  const markEndOfLife = () => {
    if (consumerWallet.trim()) {
      setEndOfLifeMarked(true);
    }
  };

  const confirmRecycle = () => {
    setUnlocked(true);
  };

  const resetDemo = () => {
    setDpp(null);
    setEndOfLifeMarked(false);
    setUnlocked(false);
    setConsumerWallet('');
  };

  const tabs = [
    { id: 'producer', label: '🏭 Producer', color: '#2563eb' },
    { id: 'consumer', label: '👤 Consumer', color: '#059669' },
    { id: 'recycler', label: '♻️ Recycler', color: '#d97706' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#f8fafc',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          👕 T-Shirt Recycling Escrow
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Lock value • Verify material • Reward recycling
        </p>
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
          background: dpp ? '#22c55e20' : '#64748b20',
          color: dpp ? '#22c55e' : '#64748b',
        }}>
          {dpp ? '✓ DPP Created' : '○ No DPP'}
        </span>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px',
          background: endOfLifeMarked ? '#22c55e20' : '#64748b20',
          color: endOfLifeMarked ? '#22c55e' : '#64748b',
        }}>
          {endOfLifeMarked ? '✓ End of Life' : '○ In Use'}
        </span>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px',
          background: unlocked ? '#22c55e20' : '#64748b20',
          color: unlocked ? '#22c55e' : '#64748b',
        }}>
          {unlocked ? '✓ Value Unlocked' : '○ Value Locked'}
        </span>
      </div>

      {/* Content Card */}
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        background: '#1e293b',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #334155',
      }}>
        
        {/* PRODUCER VIEW */}
        {activeTab === 'producer' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#2563eb' }}>
              🏭 Lock Value into T-Shirt
            </h2>
            
            {!dpp ? (
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
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    Recycling Reward (€)
                  </label>
                  <input
                    type="number"
                    value={lockedValue}
                    onChange={(e) => setLockedValue(Number(e.target.value))}
                    min="0.5"
                    max="10"
                    step="0.5"
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
                  onClick={createDPP}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  🔒 Lock Value & Create DPP
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                {/* Big QR Code */}
                <div style={{
                  width: '220px',
                  height: '220px',
                  margin: '0 auto 32px',
                  background: 'white',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ color: '#1e293b', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '8px' }}>📱</div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      padding: '0 12px',
                    }}>
                      {dpp.id}
                    </div>
                  </div>
                </div>

                {/* Material & Value */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: '1px solid #334155',
                  fontSize: '15px',
                }}>
                  <span style={{ color: '#94a3b8' }}>Material</span>
                  <span style={{ color: '#f8fafc', fontWeight: '500' }}>{dpp.material}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: '1px solid #334155',
                  fontSize: '15px',
                }}>
                  <span style={{ color: '#94a3b8' }}>Locked Value</span>
                  <span style={{ color: '#22c55e', fontWeight: '600' }}>€{dpp.lockedValue.toFixed(2)} 🔒</span>
                </div>

                <button
                  onClick={resetDemo}
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
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#059669' }}>
              👤 My T-Shirt
            </h2>
            
            {!dpp ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p>Scan a DPP QR code to view t-shirt</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  (Create one in Producer tab first)
                </p>
              </div>
            ) : unlocked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '64px', 
                  marginBottom: '16px',
                  animation: 'pulse 2s infinite',
                }}>
                  🎉
                </div>
                <h3 style={{ color: '#22c55e', marginBottom: '8px' }}>
                  Value Claimed!
                </h3>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#22c55e',
                  marginBottom: '16px',
                }}>
                  €{dpp.lockedValue.toFixed(2)}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Sent to your wallet
                </p>
                <p style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginTop: '8px',
                  wordBreak: 'break-all',
                }}>
                  {consumerWallet}
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
                      <span style={{ color: '#f8fafc' }}>{dpp.material}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <span>Producer</span>
                      <span style={{ color: '#f8fafc' }}>{dpp.producer}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span>Recycling Reward</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>€{dpp.lockedValue.toFixed(2)} 🔒</span>
                    </div>
                  </div>
                </div>

                {!endOfLifeMarked ? (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '20px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                        💰 €{dpp.lockedValue.toFixed(2)} waiting for you
                      </p>
                      <p style={{ fontSize: '12px', opacity: 0.9 }}>
                        Bring to recycling point to claim
                      </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                        Your Wallet Address (to receive reward)
                      </label>
                      <input
                        type="text"
                        value={consumerWallet}
                        onChange={(e) => setConsumerWallet(e.target.value)}
                        placeholder="0x..."
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid #334155',
                          background: '#0f172a',
                          color: '#f8fafc',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <button
                      onClick={markEndOfLife}
                      disabled={!consumerWallet.trim()}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: consumerWallet.trim() 
                          ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                          : '#334155',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: consumerWallet.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      🏁 Mark End of Life
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

        {/* RECYCLER VIEW */}
        {activeTab === 'recycler' && (
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#d97706' }}>
              ♻️ Verify & Unlock
            </h2>
            
            {!dpp ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p>Scan incoming t-shirt DPP</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  (Create one in Producer tab first)
                </p>
              </div>
            ) : !endOfLifeMarked ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>T-shirt still in use</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Consumer hasn't marked End of Life yet
                </p>
              </div>
            ) : unlocked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: '#22c55e', marginBottom: '16px' }}>
                  Recycling Verified
                </h3>
                <div style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                }}>
                  <p style={{ color: '#94a3b8', marginBottom: '8px' }}>
                    €{dpp.lockedValue.toFixed(2)} released to:
                  </p>
                  <p style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px',
                    color: '#22c55e',
                    wordBreak: 'break-all',
                  }}>
                    {consumerWallet}
                  </p>
                </div>
                <button
                  onClick={resetDemo}
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
                    PRODUCER CLAIMS:
                  </p>
                  <p style={{ 
                    fontSize: '24px', 
                    fontWeight: '700',
                    marginBottom: '16px',
                  }}>
                    {dpp.material}
                  </p>
                  
                  <div style={{ 
                    borderTop: '1px solid #334155', 
                    paddingTop: '16px',
                    fontSize: '14px',
                    color: '#94a3b8',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>DPP ID</span>
                      <span style={{ fontFamily: 'monospace', color: '#f8fafc' }}>{dpp.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Producer</span>
                      <span style={{ color: '#f8fafc' }}>{dpp.producer}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Consumer Wallet</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#f8fafc' }}>
                        {consumerWallet.slice(0, 8)}...
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Locked Value</span>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>€{dpp.lockedValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={confirmRecycle}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                >
                  ✓ Confirm Material & Unlock €{dpp.lockedValue.toFixed(2)}
                </button>

                <button
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #ef4444',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ⚠️ Flag Material Mismatch
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

export default TShirtEscrow;
```

---

## Usage

### As Standalone File

```bash
# Save as: src/components/TShirtEscrow.jsx
# Import in your page:

import TShirtEscrow from '@/components/TShirtEscrow';

export default function Home() {
  return <TShirtEscrow />;
}
```

### As Inline Component

Copy the entire component code directly into your page file for quick testing.

---

## Customization Tips

### Change Colors

```javascript
// Update tab colors
const tabs = [
  { id: 'producer', label: '🏭 Producer', color: '#YOUR_COLOR' },
  // ...
];
```

### Change Default Values

```javascript
// Change default material and value
const [material, setMaterial] = useState('100% Cotton');
const [lockedValue, setLockedValue] = useState(5);
```

### Add More Materials

```jsx
<select>
  <option value="100% Linen">100% Linen</option>
  <option value="100% Wool">100% Wool</option>
  {/* Add more */}
</select>
```

---

*This component is the foundation for the IOTA-integrated version documented in other files.*
