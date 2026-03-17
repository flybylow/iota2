# Blockchain Integration Guide

This app is **TypeScript-ready** for blockchain integration. All storage operations are abstracted in `lib/storage.ts` for easy swapping.

## Current Architecture ✅

```
┌─────────────────┐
│  UI Component   │
│ (TShirtDPP.tsx) │
└────────┬────────┘
         │
         │ calls storage functions
         ↓
┌─────────────────┐
│ Storage Service │
│  (storage.ts)   │  ← localStorage (current)
└─────────────────┘
         │
         ↓
┌─────────────────┐
│   localStorage  │  ← Browser storage
└─────────────────┘
```

## Future Blockchain Architecture 🔜

```
┌─────────────────┐
│  UI Component   │
│ (TShirtDPP.tsx) │  ← NO CHANGES NEEDED
└────────┬────────┘
         │
         │ same function calls
         ↓
┌─────────────────┐
│ Storage Service │
│  (storage.ts)   │  ← Swap to blockchain calls
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  IOTA Testnet   │  ← Real blockchain
└─────────────────┘
```

## How to Swap (30 minutes)

### 1. Install Dependencies (if not already)
```bash
npm install @iota/dapp-kit @iota/iota-sdk @tanstack/react-query
```

### 2. Deploy Contract
```bash
cd ../tshirt_dpp
iota client publish --gas-budget 100000000
# Save the Package ID
```

### 3. Add Wallet Provider

Create `app/providers.tsx`:
```typescript
'use client';

import { IotaClientProvider, WalletProvider } from '@iota/dapp-kit';
import { getFullnodeUrl } from '@iota/iota-sdk/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}
```

Update `app/layout.tsx`:
```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 4. Update Storage Service

Replace `lib/storage.ts` functions with blockchain calls:

**Current:**
```typescript
export async function createDPP(
  material: string,
  lockedReward: number,
  manufacturer: string
): Promise<TransactionResult> {
  // localStorage logic
  const dpp = { /* create object */ };
  saveDPP(dpp);
  return { success: true };
}
```

**Blockchain version:**
```typescript
import { useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';

const PACKAGE_ID = 'YOUR_DEPLOYED_PACKAGE_ID';

export async function createDPP(
  material: string,
  lockedReward: number,
  manufacturerCap: string,
  signAndExecute: Function
): Promise<TransactionResult> {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_dpp::create_and_transfer_dpp`,
    arguments: [
      tx.object(manufacturerCap),
      tx.pure.string(material),
      tx.pure.u64(lockedReward),
      tx.pure.address(recipient),
    ],
  });

  return new Promise((resolve) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          resolve({ success: true, transactionId: result.digest });
        },
        onError: (error) => {
          resolve({ success: false, error: error.message });
        },
      }
    );
  });
}
```

### 5. Update Component

In `components/TShirtDPP.tsx`, add wallet connection:

```typescript
import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';

// Inside component:
const currentAccount = useCurrentAccount();
const { mutate: signAndExecute } = useSignAndExecuteTransaction();

// Pass to storage functions:
await storage.createDPP(material, lockedReward, adminCapId, signAndExecute);
```

## Type Safety ✅

All TypeScript types in `lib/types.ts` are designed to match the Move contract:

| TypeScript Type | Move Struct | Status |
|----------------|-------------|--------|
| `TShirtDPP` | `TShirtDPP` | ✅ Matches |
| `DPPStatus` | Status constants | ✅ Matches |
| `DPPCreatedEvent` | `DPPCreated` event | ✅ Matches |
| `EndOfLifeMarkedEvent` | `EndOfLifeMarked` event | ✅ Matches |
| `RewardClaimedEvent` | `RewardClaimed` event | ✅ Matches |

## Testing Checklist

- [ ] Deploy Move contract to testnet
- [ ] Add wallet provider
- [ ] Update storage.ts with blockchain calls
- [ ] Test wallet connection
- [ ] Test createDPP transaction
- [ ] Test markEndOfLife transaction
- [ ] Test verifyAndUnlock transaction
- [ ] Verify events are emitted
- [ ] Check IOTA Explorer for transactions

## Benefits of Current Approach

✅ **Works immediately** - No blockchain setup needed for demos  
✅ **Data persists** - Uses localStorage  
✅ **Type-safe** - Full TypeScript interfaces  
✅ **Easy to swap** - Abstracted storage layer  
✅ **Same UI/UX** - Component doesn't change  
✅ **Production-ready structure** - Professional architecture  

## See Also

Check `scholarflow-ui` for a complete blockchain integration example.
