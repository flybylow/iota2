# 👕 T-Shirt Recycling Escrow

A circular economy application that locks monetary value into Digital Product Passports (DPPs) at production. Value unlocks only when recyclers verify material authenticity, creating accountability from production to end-of-life.

**Built for:** MasterZ × IOTA Hackathon  
**Team:** Tabulas  
**Demo:** http://localhost:3000

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

---

## 🎯 The Problem

- €2B+ EU textile waste annually
- No consumer recycling incentive
- Producer greenwashing (material claims without verification)
- Zero accountability from factory to landfill

---

## 💡 The Solution

### Three-Actor System

```
Producer → Locks €2 into DPP → Consumer owns it → Brings to Recycler
                                                         ↓
                                    Material verified? → Unlock €2 ✓
                                    Material mismatch? → Flag on-chain ⚠️
```

### Key Features

- **🏭 Producer**: Create DPP, lock value, generate QR code
- **👤 Consumer**: See locked reward, mark end-of-life, claim value
- **♻️ Recycler**: Verify material, unlock or flag greenwashing

---

## 🛠️ Tech Stack

### Current (Mock Version)
- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Inline styles (portable)
- **State**: React useState (mock blockchain)

### Future (IOTA Integration)
- **Blockchain**: IOTA (Move smart contracts)
- **Wallet**: IOTA Wallet Adapter
- **QR Codes**: qrcode.react + @yudiel/react-qr-scanner

---

## 📁 Project Structure

```
tshirt-escrow/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (renders TShirtEscrow)
│   └── globals.css         # Global styles
├── components/
│   └── TShirtEscrow.tsx    # Main component (3 tabs)
├── docs/                   # Comprehensive documentation
│   ├── README.md           # Documentation index
│   ├── 01-organization-guidelines.md
│   ├── 02-tshirt-escrow-overview.md
│   ├── 03-user-flows.md
│   ├── 04-technical-architecture.md
│   ├── 05-react-component.md
│   ├── 06-deployment-guide.md
│   ├── 07-demo-script.md
│   ├── 08-roadmap-and-future.md
│   └── 09-react-component-source.md
└── package.json
```

---

## 🎮 How to Use the Demo

### Step 1: Producer Creates DPP
1. Select material (e.g., "100% Organic Cotton")
2. Set reward value (€0.50 - €10.00)
3. Click "Lock Value & Create DPP"
4. QR code appears

### Step 2: Consumer Views & Marks EOL
1. Click "Consumer" tab
2. See DPP info and locked reward
3. Enter wallet address
4. Click "Mark End of Life"

### Step 3: Recycler Verifies
1. Click "Recycler" tab
2. See producer's material claim
3. Click "Confirm Material & Unlock" (or "Flag Mismatch")
4. Value sent to consumer!

---

## 🔗 IOTA Integration (Phase 2)

### Install Additional Dependencies

```bash
npm install @iota/iota-sdk @iota/wallet-adapter-react
npm install qrcode.react @yudiel/react-qr-scanner
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_IOTA_NETWORK=testnet
NEXT_PUBLIC_IOTA_RPC_URL=https://api.testnet.iota.org
NEXT_PUBLIC_PACKAGE_ID=0x...  # After contract deployment
```

### Deploy Smart Contract

```bash
# Install IOTA CLI
cargo install --git https://github.com/iotaledger/iota.git iota

# Get test tokens
iota client faucet

# Deploy contract
iota client publish --gas-budget 100000000
```

See `docs/06-deployment-guide.md` for complete instructions.

---

## 📚 Documentation

Full documentation available in `/docs` folder:

- **Overview**: Problem, solution, stakeholders
- **User Flows**: Detailed interactions for each actor
- **Architecture**: Smart contract code (Move), data structures
- **Deployment**: Step-by-step production guide
- **Demo Script**: 2-minute pitch for Berlin finals
- **Roadmap**: Future features and vision

Start here: [docs/README.md](../docs/README.md)

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
# 1. Import GitHub repo
# 2. Add environment variables
# 3. Deploy
```

### Docker (Alternative)

```bash
# Build
docker build -t tshirt-escrow .

# Run
docker run -p 3000:3000 tshirt-escrow
```

---

## 🎯 Roadmap

- [x] **Phase 1**: Mock prototype with full UX
- [ ] **Phase 2**: IOTA blockchain integration
- [ ] **Phase 3**: Polish for Berlin finals (April 2026)
- [ ] **Phase 4**: Recycler registry & greenwashing dashboard
- [ ] **Phase 5**: Multi-product support (electronics, batteries)

See `docs/08-roadmap-and-future.md` for details.

---

## 🤝 Contributing

Want to help build circular economy infrastructure?

1. Read `docs/01-organization-guidelines.md`
2. Pick a feature from `docs/08-roadmap-and-future.md`
3. Open a PR

---

## 📞 Contact

**Ward** - UX/Product  
Email: ward@tabulas.eu  
Discord: ward_tabulas

**Tabulas**  
Mission: Circular Economy Infrastructure  
Website: tabulas.eu (coming soon)

---

## 📄 License

MIT License (for hackathon purposes)

---

## 🏆 Hackathon Info

**Event:** MasterZ × IOTA  
**Timeline:** Feb training → March build → April 1st Berlin finals  
**Goal:** Top 5 → Berlin trip + pitch to IOTA Foundation  
**Prize:** Opportunity to present to IOTA ecosystem

---

**Why IOTA?**

Feeless transactions enable locking €2 into every product without gas fees eating the reward. IOTA's Move smart contracts provide secure escrow. Immutable on-chain proof of recycling and greenwashing detection.

---

*Built with 💚 for a circular future*
