# T-Shirt Digital Product Passport UI

A fully TypeScript-structured UI for the T-Shirt DPP (Digital Product Passport) system, ready for IOTA blockchain integration.

## Overview

This UI demonstrates the complete lifecycle of a Digital Product Passport for t-shirts:

- **Manufacturer**: Creates DPPs with material information and locked recycling rewards
- **Consumer**: Views product information and marks end-of-life for recycling
- **Recycler**: Verifies materials and unlocks rewards for consumers

## Features

- 🏭 **Manufacturer DPP creation** with locked rewards
- 👤 **Consumer product tracking** and end-of-life marking  
- ♻️ **Recycler verification** and reward unlocking
- 📱 **Mock QR code system** for product tracking
- 💾 **localStorage persistence** - data survives page refreshes
- 🎨 **Modern, responsive UI** with IOTA branding
- 📘 **Full TypeScript** - Type-safe with proper interfaces
- 🔄 **Blockchain-ready architecture** - Easy to swap localStorage for IOTA

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Architecture

**Current: localStorage (Production-Ready)**
```
UI Component → Storage Service → localStorage
     ↓              ↓
  (same)    (easy to swap)
```

**Future: IOTA Blockchain (30 min swap)**
```
UI Component → Storage Service → IOTA Testnet
     ↓              ↓
  (no changes)  (swap functions)
```

See `BLOCKCHAIN_INTEGRATION.md` for swap guide.

## Project Structure

```
tshirt-dpp-ui/
├── app/
│   ├── page.tsx                    # Main page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   └── TShirtDPP.tsx              # Main UI component
├── lib/
│   ├── types.ts                   # TypeScript types (matches Move contract)
│   └── storage.ts                 # Storage service (localStorage → blockchain ready)
├── BLOCKCHAIN_INTEGRATION.md      # Guide to swap to IOTA
└── package.json
```

## Key Files

- **`lib/types.ts`** - TypeScript interfaces matching Move smart contract structures
- **`lib/storage.ts`** - Storage abstraction layer (currently localStorage, ready for blockchain)
- **`components/TShirtDPP.tsx`** - UI component (doesn't need to change when swapping storage)

## Smart Contract

This UI connects to the `tshirt_dpp` Move smart contract located in `../tshirt_dpp/`.

## Built With

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- IOTA SDK (for future blockchain integration)

## Hackathon

Built for **MasterZ × IOTA Hackathon** by **Tabulas**

Theme: Circular Economy Infrastructure
