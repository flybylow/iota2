# React Component Implementation

## Current State: Mock Prototype

The existing component (`TShirtEscrow`) is a **fully functional UX prototype** with mocked blockchain state. Perfect for:
- User testing
- Pitch demonstrations
- Hackathon presentation
- UX validation

---

## Tech Stack

```
Framework:     React (functional components)
Styling:       Inline styles (portable, no dependencies)
State:         React useState hooks
Future:        Next.js + IOTA SDK + TypeScript
```

---

## Component Structure

```
TShirtEscrow (root component)
│
├── State Management
│   ├── activeTab (producer/consumer/recycler)
│   ├── dpp (current DPP object or null)
│   ├── consumerWallet (string)
│   ├── endOfLifeMarked (boolean)
│   ├── unlocked (boolean)
│   ├── material (selected material)
│   └── lockedValue (euro amount)
│
├── Functions
│   ├── createDPP() - Creates mock DPP object
│   ├── markEndOfLife() - Consumer marks EOL
│   ├── confirmRecycle() - Recycler unlocks value
│   └── resetDemo() - Reset to initial state
│
└── UI Structure
    ├── Header (title + subtitle)
    ├── Tab Navigation (3 actor types)
    ├── Status Bar (3 status indicators)
    └── Content Card
        ├── ProducerView
        │   ├── Material dropdown
        │   ├── Value input
        │   ├── Create button
        │   └── QR code display
        ├── ConsumerView
        │   ├── DPP info card
        │   ├── Wallet input
        │   ├── Mark EOL button
        │   └── Success screen
        └── RecyclerView
            ├── Material claim display
            ├── Verify button
            ├── Flag button
            └── Confirmation screen
```

---

## Key State Variables

### `activeTab`
```javascript
const [activeTab, setActiveTab] = useState('producer');
// Values: 'producer' | 'consumer' | 'recycler'
```

Controls which user perspective is shown.

### `dpp`
```javascript
const [dpp, setDpp] = useState(null);
// Shape: { id, material, lockedValue, producer, createdAt }
```

The core Digital Product Passport object. `null` = no DPP created yet.

### `endOfLifeMarked`
```javascript
const [endOfLifeMarked, setEndOfLifeMarked] = useState(false);
```

Consumer has marked the t-shirt for recycling.

### `unlocked`
```javascript
const [unlocked, setUnlocked] = useState(false);
```

Recycler has verified and released funds.

---

## Core Functions

### `createDPP()`

**Trigger:** Producer clicks "Lock Value & Create DPP"

```javascript
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
```

**Future (IOTA integration):**

```typescript
const createDPP = async () => {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_escrow::create_dpp`,
    arguments: [
      tx.pure(material),
      tx.splitCoins(tx.gas, [tx.pure(lockedValue * 1_000_000_000)]),
    ],
  });
  const result = await signAndExecuteTransaction({ transactionBlock: tx });
  setDpp({ id: result.objectId, material, lockedValue, ... });
};
```

### `markEndOfLife()`

**Trigger:** Consumer clicks "Mark End of Life"

```javascript
const markEndOfLife = () => {
  if (consumerWallet.trim()) {
    setEndOfLifeMarked(true);
  }
};
```

**Future (IOTA integration):**

```typescript
const markEndOfLife = async () => {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_escrow::mark_end_of_life`,
    arguments: [tx.object(dpp.id)],
  });
  await signAndExecuteTransaction({ transactionBlock: tx });
  setEndOfLifeMarked(true);
};
```

### `confirmRecycle()`

**Trigger:** Recycler clicks "Confirm Material & Unlock"

```javascript
const confirmRecycle = () => {
  setUnlocked(true);
};
```

**Future (IOTA integration):**

```typescript
const confirmRecycle = async () => {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_escrow::verify_and_unlock`,
    arguments: [tx.object(dpp.id)],
  });
  await signAndExecuteTransaction({ transactionBlock: tx });
  setUnlocked(true);
};
```

---

## Styling Architecture

### Design System

```javascript
// Colors
const colors = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  cardBg: '#1e293b',
  inputBg: '#0f172a',
  border: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Actor colors
  producer: '#2563eb',
  consumer: '#059669',
  recycler: '#d97706',
  
  // Status colors
  success: '#22c55e',
  error: '#ef4444',
};
```

### Key UI Patterns

**1. Tabs**
- Horizontal flex layout
- Border highlight for active tab
- Colored background tint matching actor
- Smooth transition (0.2s ease)

**2. Status Indicators**
- Small pill badges
- Icon prefix (✓ or ○)
- Color-coded (green = active, grey = inactive)

**3. Content Card**
- Max width 400px, centered
- Dark background (#1e293b)
- Rounded corners (20px)
- Subtle border

**4. Buttons**
- Full width
- 16px vertical padding
- Gradient backgrounds for primary actions
- Disabled state (grey background, no pointer)

**5. Input Fields**
- Dark background (#0f172a)
- Monospace font for addresses
- 14px padding
- Rounded corners (12px)

---

## Responsive Design Considerations

Current implementation is desktop-focused. For mobile:

```css
@media (max-width: 640px) {
  /* Stack tabs vertically */
  .tabs { flex-direction: column; }
  
  /* Reduce card padding */
  .card { padding: 20px; }
  
  /* Smaller QR code */
  .qr-code { width: 180px; height: 180px; }
  
  /* Increase touch targets */
  button { min-height: 48px; }
}
```

---

## Integration with IOTA

### Dependencies to Add

```bash
npm install @iota/iota-sdk
npm install @iota/wallet-adapter-react
npm install qrcode.react
npm install @yudiel/react-qr-scanner
```

### Wallet Provider Setup

```tsx
// _app.tsx
import { WalletProvider } from '@iota/wallet-adapter-react';

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
```

### Hook Usage

```tsx
import { useWallet } from '@iota/wallet-adapter-react';

const TShirtEscrow = () => {
  const { connected, signAndExecuteTransaction } = useWallet();
  
  // Replace mock functions with blockchain calls
  // ...
};
```

---

## Testing Strategy

### Current (Mock Version)
1. Click through producer flow
2. Switch to consumer tab
3. Mark end of life
4. Switch to recycler tab
5. Confirm recycling
6. Verify success state

### Future (IOTA Version)
1. Connect test wallet
2. Get test IOTA from faucet
3. Create DPP transaction
4. Verify on explorer
5. Complete full cycle
6. Check final balances

---

## File Location

The React component should be saved as:

```
src/
  components/
    TShirtEscrow.tsx  (or .jsx)
```

Imported in pages:

```tsx
// pages/index.tsx
import TShirtEscrow from '@/components/TShirtEscrow';

export default function Home() {
  return <TShirtEscrow />;
}
```

---

*For deployment instructions, see `06-deployment-guide.md`*  
*For demo script, see `07-demo-script.md`*
