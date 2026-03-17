# T-Shirt DPP - Quick Start Guide

## 🚀 Run the Demo (5 seconds)

```bash
cd tshirt-dpp-ui
npm run dev
```

Open http://localhost:3000 (or port shown in terminal)

## 📱 Try the Demo Flow

### 1️⃣ Manufacturer Tab
- Select material (e.g., "100% Organic Cotton")
- Set recycling reward (e.g., $5)
- Click "Create DPP & Lock Reward"
- See QR code appear (this would be printed on the product tag)

### 2️⃣ Consumer Tab  
- View your t-shirt's material and reward info
- Enter your wallet address (or click "Use Demo")
- Click "Mark End of Life" when ready to recycle
- Status changes to "Awaiting Recycler"

### 3️⃣ Recycler Tab
- Scan shows manufacturer's material claim
- Verify the material matches
- Click "Verify Material & Unlock" to release reward
- Consumer receives the locked reward!

## 🎯 What This Demonstrates

**Circular Economy with Incentives:**
- Manufacturers lock value into products
- Consumers get rewarded for recycling
- Recyclers verify material accuracy
- Prevents greenwashing through verification

**All on-chain (when connected):**
- Transparent material claims
- Immutable product history
- Automated reward distribution
- Trustless verification

## 🔄 Current Status

**Phase 1: ✅ Mock UI Prototype**
- Visual demo of the full flow
- Console logging for tracking
- All data in React state
- Perfect for demos and testing UX

**Phase 2: 🔜 Blockchain Integration**
- Deploy `tshirt_dpp` Move contract to IOTA
- Connect UI to contract with IOTA SDK
- Real wallet integration
- On-chain DPP creation and verification

## 📂 Project Structure

```
IOTA2/
├── tshirt_dpp/           # Move smart contract
│   └── sources/
│       └── tshirt_dpp.move
└── tshirt-dpp-ui/        # React UI (this project)
    ├── components/
    │   └── TShirtDPP.tsx
    └── app/
        └── page.tsx
```

## 🔗 Next Steps

1. **Deploy Contract:** Publish `tshirt_dpp` to IOTA testnet
2. **Get Package ID:** Copy deployed package ID
3. **Configure UI:** Add package ID to `.env.local`
4. **Connect Wallets:** Integrate IOTA wallet adapter
5. **Go Live:** Deploy UI to Vercel/Netlify

## 💡 Tips

- Check browser console for detailed action logs
- Use "Reset Demo" to start over
- The demo works without blockchain - perfect for presentations!
- All three roles (Manufacturer/Consumer/Recycler) are in the same UI

## 📞 Questions?

Built for **MasterZ × IOTA Hackathon** by **Tabulas**
