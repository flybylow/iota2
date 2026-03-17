# DPP UI - Workshop II

Digital Product Passport frontend with **Registry lookup**, **PTB support**, and **Table-based indexing**.

**Full startup (from zero to running UI):** [docs/DPP_STARTUP.md](../docs/DPP_STARTUP.md)  
**Current deployment IDs:** [DPP_core/DEPLOYED.md](../DPP_core/DEPLOYED.md)

## Features

- **PTB Mode**: Atomic create + index in one transaction
- **Registry Lookup**: Find DPPs by GTIN
- **Wallet Integration**: IOTA dapp-kit

## Prerequisites

DPP_core must be deployed to testnet and the Registry created. You need the Package ID, AdminCap, ManufacturerCap, RecyclerCap, and Registry ID in `.env.local`. See [docs/DPP_STARTUP.md](../docs/DPP_STARTUP.md) or [DPP_core/DEPLOYED.md](../DPP_core/DEPLOYED.md).

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in the values from your DPP_core deployment (or copy the block from [DPP_core/DEPLOYED.md](../DPP_core/DEPLOYED.md) if using this repo’s deployment):

```bash
cp .env.local.example .env.local
```

Required environment variables:

```
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_ADMIN_CAP_ID=0x...
NEXT_PUBLIC_MANUFACTURER_CAP_ID=0x...
NEXT_PUBLIC_RECYCLER_CAP_ID=0x...
NEXT_PUBLIC_REGISTRY_ID=0x...
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

```
DPP_UI/
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page
│   ├── providers.tsx   # IOTA wallet providers
│   └── globals.css     # Global styles
├── components/
│   └── DPPApp.tsx      # Main application component
├── lib/
│   ├── types.ts        # TypeScript interfaces
│   └── storage-blockchain.ts  # Blockchain interaction layer
└── public/
```

## Workshop II Concepts

### PTB (Programmable Transaction Block)

The UI demonstrates atomic transactions with PTB:

```typescript
// Step 1: Create DPP and capture ID
const [dppId] = tx.moveCall({
  target: `${PACKAGE_ID}::dpp::create_return_id`,
  arguments: [...],
});

// Step 2: Index in registry (same transaction)
tx.moveCall({
  target: `${PACKAGE_ID}::registry::index_dpp`,
  arguments: [registry, gtin, dppId, owner, adminCap],
});
```

### Registry Lookup

The registry uses `Table<String, ID>` for GTIN -> DPP ID mapping:

```typescript
// Query DPPIndexed events to find DPP by GTIN
const events = await client.queryEvents({
  query: { MoveEventType: `${PACKAGE_ID}::registry::DPPIndexed` },
});
```

## Tabs

1. **Manufacturer** - Create DPPs with PTB toggle
2. **Registry** - Lookup DPPs by GTIN, view owned DPPs
3. **Consumer** - View product details, mark end of life
4. **Recycler** - Verify recycling, unlock rewards

## Deployment

### Vercel

```bash
npm run build
vercel deploy
```

Remember to set environment variables in Vercel dashboard.
