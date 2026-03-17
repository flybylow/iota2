# 🚀 Quick Start Guide

Get the T-Shirt Recycling Escrow app running in 2 minutes.

---

## ✅ Prerequisites

- Node.js 18+ installed
- npm or yarn
- Web browser

---

## 📦 Installation & Setup

```bash
# 1. Navigate to project
cd tshirt-escrow

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to: http://localhost:3000
```

---

## 🎮 Try the Demo (2-Minute Flow)

### 1️⃣ Producer Tab (30 seconds)
- Select material: **"100% Organic Cotton"**
- Set value: **€2.00**
- Click: **"Lock Value & Create DPP"**
- ✅ QR code appears with DPP ID

### 2️⃣ Consumer Tab (45 seconds)
- Click: **"Consumer"** tab
- See DPP info and **€2.00 locked reward**
- Enter wallet: **"0x1234567890abcdef..."** (any fake address)
- Click: **"Mark End of Life"**
- ✅ Status changes to "Awaiting Recycler"

### 3️⃣ Recycler Tab (45 seconds)
- Click: **"Recycler"** tab
- See producer's claim: **"100% Organic Cotton"**
- Click: **"Confirm Material & Unlock €2.00"**
- ✅ Value released! Consumer sees "Value Claimed!"

---

## 🎯 What You Just Did

You simulated the complete circular economy flow:

1. **Producer** locked €2 into a Digital Product Passport
2. **Consumer** marked the t-shirt for recycling
3. **Recycler** verified the material and unlocked the reward

In production, this would be:
- On-chain (IOTA blockchain)
- With real QR codes
- Using actual wallets
- Transferring real tokens

---

## 🔄 Reset & Try Again

Click **"Reset Demo"** in any tab to start over.

---

## 📖 Next Steps

### For Developers
- Read: `docs/05-react-component.md` (component architecture)
- Read: `docs/06-deployment-guide.md` (deploy to production)
- Integrate: IOTA SDK (Phase 2)

### For Designers
- Review: `docs/03-user-flows.md` (UX flows)
- Improve: Mobile responsiveness
- Enhance: Animations and transitions

### For Product/Business
- Read: `docs/02-tshirt-escrow-overview.md` (problem & solution)
- Review: `docs/07-demo-script.md` (pitch script)
- Plan: `docs/08-roadmap-and-future.md` (features)

---

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### TypeScript errors?
```bash
# Delete .next folder and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Styling looks broken?
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache
- Check browser console for errors

---

## 🚢 Ready to Deploy?

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
# 1. Push to GitHub
# 2. Import on vercel.com
# 3. Deploy
```

See `docs/06-deployment-guide.md` for full instructions.

---

## 📞 Need Help?

- **Documentation**: `/docs/README.md`
- **Issues**: Check console for errors
- **Contact**: ward@tabulas.eu

---

## 🎉 Success Checklist

After following this guide, you should have:

- [x] Dev server running at localhost:3000
- [x] All three tabs working (Producer/Consumer/Recycler)
- [x] Completed full demo flow
- [x] Understanding of the circular economy concept

**Next**: Read the full documentation or start building Phase 2 (IOTA integration)!

---

*Built for MasterZ × IOTA Hackathon | Tabulas*
