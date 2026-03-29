# Deployment Guide

## Local Development Setup

### Prerequisites

```bash
node >= 18
npm >= 9
git
```

### Quick Start (Mock Version)

```bash
# Create Next.js project
npx create-next-app@latest tshirt-escrow
cd tshirt-escrow

# Copy component
# Place TShirtEscrow component in src/components/

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

---

## IOTA Integration Setup

### Install Dependencies

```bash
# Core IOTA packages
npm install @iota/iota-sdk @iota/wallet-adapter-react

# QR code functionality
npm install qrcode.react @yudiel/react-qr-scanner

# TypeScript types (if using TS)
npm install -D @types/qrcode.react
```

### Environment Variables

Create `.env.local`:

```bash
# Network configuration
NEXT_PUBLIC_IOTA_NETWORK=testnet
NEXT_PUBLIC_IOTA_RPC_URL=https://api.testnet.iota.org

# Contract address (after deployment)
NEXT_PUBLIC_PACKAGE_ID=0x...

# Optional: Analytics, monitoring
NEXT_PUBLIC_ANALYTICS_ID=...
```

---

## Smart Contract Deployment

### Install IOTA CLI

```bash
# Install from source
cargo install --git https://github.com/iotaledger/iota.git iota

# Verify installation
iota --version
```

### Create Move Project

```bash
# Create new Move package
mkdir tshirt-escrow-contract
cd tshirt-escrow-contract
iota move new tshirt_escrow

# Structure:
# tshirt_escrow/
#   ├── Move.toml
#   └── sources/
#       └── tshirt_escrow.move
```

### Build Contract

```bash
# Navigate to contract directory
cd tshirt_escrow

# Build
iota move build

# Expected output:
# INCLUDING DEPENDENCY IOTA
# BUILDING tshirt_escrow
# Build success
```

### Deploy to Testnet

```bash
# Connect wallet (creates ~/.iota/iota_config/)
iota client

# Get test tokens from faucet
iota client faucet

# Publish contract
iota client publish --gas-budget 100000000

# Save the Package ID from output!
# Example: 0x1234567890abcdef...
```

### Verify Deployment

```bash
# View published package
iota client object <PACKAGE_ID>

# Check on explorer
# https://explorer.testnet.iota.org/object/<PACKAGE_ID>
```

---

## Frontend Configuration

### Update Environment Variables

After deploying contract, update `.env.local`:

```bash
NEXT_PUBLIC_PACKAGE_ID=0x<your_package_id_here>
```

### Wallet Provider Setup

```tsx
// pages/_app.tsx
import { WalletProvider } from '@iota/wallet-adapter-react';
import '@iota/wallet-adapter-react-ui/styles.css';

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider
      autoConnect={true}
      network={process.env.NEXT_PUBLIC_IOTA_NETWORK}
    >
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp;
```

---

## Deployment to Vercel

### Prepare Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: T-Shirt Escrow MVP"

# Push to GitHub
git remote add origin https://github.com/<your-username>/tshirt-escrow.git
git push -u origin main
```

### Deploy on Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Connect GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - **Root Directory** (IOTA2 monorepo): set to `tshirt-escrow` or `DPP_UI`, not the repo root. Building in a subfolder and copying only `.next` to the root breaks Next.js 16 file tracing (`ENOENT` for `client-only` under `node_modules`).
   - Build Command: `npm run build` (default when Root Directory is the app folder)
   - Output Directory: leave default (`.next` next to that app’s `package.json`)
5. Add environment variables:
   - `NEXT_PUBLIC_IOTA_NETWORK`
   - `NEXT_PUBLIC_PACKAGE_ID`
6. Click "Deploy"

### Custom Domain (Optional)

```bash
# In Vercel dashboard:
# Settings → Domains → Add Domain
# Example: tshirt-escrow.tabulas.eu
```

---

## Production Checklist

### Before Launch

- [ ] Contract deployed to mainnet (not testnet)
- [ ] Environment variables updated for mainnet
- [ ] QR codes generated with production URLs
- [ ] Wallet connection tested
- [ ] All transactions tested with real IOTA
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Mobile responsive design verified
- [ ] Analytics/monitoring configured
- [ ] Security audit completed (for real money)

### Security Considerations

1. **Private Keys**: Never commit private keys or mnemonics
2. **Environment Variables**: Use Vercel's encrypted env vars
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent spam transactions
5. **Audit**: Get smart contract audited before mainnet

---

## Monitoring & Maintenance

### Track Deployments

```bash
# View all published packages
iota client objects --owner <YOUR_ADDRESS>

# Monitor transactions
# Use IOTA Explorer: https://explorer.iota.org/
```

### Update Contract

```bash
# Build new version
iota move build

# Publish update (creates new package)
iota client publish --gas-budget 100000000

# Update frontend with new PACKAGE_ID
```

### Analytics

Recommended tools:
- **Vercel Analytics**: Built-in performance monitoring
- **Posthog**: User behavior tracking
- **Sentry**: Error tracking
- **IOTA Explorer API**: On-chain analytics

---

## Troubleshooting

### "Insufficient gas"
```bash
# Get more test IOTA
iota client faucet

# Or increase gas budget
--gas-budget 200000000
```

### "Module not found"
```bash
# Check Move.toml dependencies
[dependencies]
IOTA = { git = "https://github.com/iotaledger/iota.git", subdir = "crates/iota-framework/packages/iota-framework", rev = "mainnet" }
```

### "Transaction failed"
```bash
# Check transaction details
iota client tx <TX_HASH>

# View object state
iota client object <OBJECT_ID>
```

### QR Code Not Scanning
- Increase QR code size (min 200px)
- Ensure good contrast (white background)
- Use error correction level "H"
- Test with multiple devices/cameras

---

## Rollback Strategy

If production issues occur:

1. **Frontend**: Revert to previous Vercel deployment
2. **Smart Contract**: Cannot delete, but can:
   - Deploy new version with fixes
   - Update frontend to point to old package
   - Disable problematic functions

---

## Cost Estimation

### IOTA Costs (Testnet = Free, Mainnet = Real)

- **Deploy contract**: ~0.1 IOTA (one-time)
- **Create DPP**: ~0.001 IOTA per t-shirt
- **Mark EOL**: ~0.001 IOTA per action
- **Verify**: ~0.001 IOTA per verification

*Actual costs are minimal due to IOTA's low fees*

### Hosting Costs

- **Vercel**: Free for hobby projects, $20/mo for Pro
- **Domain**: ~$10-15/year

---

*For demo presentation, see `07-demo-script.md`*  
*For future roadmap, see `08-roadmap-and-future.md`*
