# Textile Tracer (IOTA2 Hackathon Submission)

From factory → closet → recycling bin: **every step cryptographically proven**.

This repo is a monorepo from multiple workshops. **For the hackathon submission, the source-of-truth is:**

- `DPP_core/` — IOTA Move smart contracts (Digital Product Passport + registry + roles/caps)
- `DPP_UI/` — Next.js frontend that drives the end-to-end lifecycle (manufacturer → consumer → recycler)

Documentation lives in `docs/` (start at `docs/README.md`).

---

## Problem

The EU generates massive textile waste and recycling rates remain low. Digital Product Passports (DPPs) will become mandatory, but a DPP is only useful if its claims are **verifiable**.

Without cryptographic verification:
- Manufacturers can greenwash.
- Consumers can’t validate sustainability claims.
- Recyclers can’t reliably confirm material composition and provenance.

---

## Solution (what we built)

**Textile Tracer** implements a verifiable DPP lifecycle on IOTA:

- **Manufacturer** creates a DPP on-chain, signs product metadata, and locks a recycling reward.
- **Consumer** scans a QR / looks up the DPP, views verified metadata, adds their address, and marks end-of-life.
- **Recycler** verifies recycling/material (visual check in the prototype), signs verification on-chain.
- **Reward** releases automatically after verification (escrow pattern).

Why IOTA: **feeless transactions** (critical at per-product scale), notarization-friendly design, and no intermediary required.

---

## Key features

- **Immutable audit trail**: each lifecycle step is a signed on-chain action with timestamp + tx id.
- **Registry-based lookup**: find a product by an external identifier (e.g., GTIN) via on-chain indexing.
- **Incentive escrow**: reward locked at creation and released after recycler verification.
- **Role-based actions**: manufacturer/recycler permissions via on-chain caps (admin/manufacturer/recycler).

---

## System architecture (high level)

**On-chain (`DPP_core/`)**
- DPP object holds product metadata + state transitions (prototype fields; can evolve to EU DPP requirements).
- Registry indexes DPPs for fast lookup (e.g., GTIN → DPP id).
- Capability objects (caps) authorize actor actions (manufacturer/recycler/admin).
- Reward/escrow pattern ties verification to payout.

**Off-chain UI (`DPP_UI/`)**
- Next.js app using IOTA wallet integration for signing.
- Provides flows/tabs for **Manufacturer**, **Registry**, **Consumer**, **Recycler**.
- Reads/writes on-chain state and renders a verifiable history for the product lifecycle.

---

## Live demo & media

- **Demo URL**: *(add link)*
- **Demo video**: *(add link)*
- **Slides**: *(add link)*

---

## Setup & installation (local)

### Prerequisites

- Node.js + npm (for `DPP_UI/`)
- IOTA wallet (for signing transactions)
- A deployed `DPP_core` package + created registry on the target network

If you already have deployment IDs, see: `DPP_core/DEPLOYED.md`  
For full “from zero” instructions, see: `docs/DPP_STARTUP.md`

### Run the UI

```bash
cd DPP_UI
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`

### Configure environment variables

Edit `DPP_UI/.env.local` and set (at minimum):
- `NEXT_PUBLIC_PACKAGE_ID`
- `NEXT_PUBLIC_REGISTRY_ID`
- capability object IDs (admin / manufacturer / recycler) as required by your deployment

The canonical list is documented in `DPP_UI/README.md`.

---

## Repository map (what to look at)

- `DPP_core/` — hackathon Move package
- `DPP_UI/` — hackathon UI
- `docs/` — documentation hub (index at `docs/README.md`)

Other folders are workshop experiments / exercises and are not required to understand or run the hackathon demo.

---

## Team / contact

- **Team**: Tabulas (MasterZ × IOTA Hackathon)
- **Contact**: *(add email or handle)*

