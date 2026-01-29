# Git Branches Guide

## 📦 Branch Structure

```
tshirt-dpp-ui/
├── main                    # Main development branch
├── localstorage-demo      # ✅ FROZEN - Share this with team
│   └── v1.0-localstorage  # Tagged version
└── iota-integration       # 🚀 Active - IOTA blockchain work
```

## 🎯 localStorage Demo (Share with Team)

This version is **production-ready** with localStorage:

```bash
# Switch to localStorage version
git checkout localstorage-demo

# Install and run
npm install
npm run dev
```

**Features:**
- ✅ Full TypeScript structure matching Move contract
- ✅ localStorage persistence (survives page refresh)
- ✅ Event logging system
- ✅ Professional UI with real QR code
- ✅ Ready for 30-min blockchain swap
- ✅ Complete documentation

**Share with developers:**
- This branch is frozen and won't change
- Perfect for demos and testing
- Shows proper architecture before blockchain
- All code is production-quality

## 🚀 IOTA Integration (Current Work)

Active development branch with blockchain integration:

```bash
# Switch to IOTA version
git checkout iota-integration

# Install and run
npm install
npm run dev
```

**Current status:**
- 🔄 Starting IOTA integration
- Will add wallet provider
- Will connect to deployed contract
- Will use real blockchain transactions

## 🔄 Switching Between Versions

**View localStorage demo:**
```bash
git checkout localstorage-demo
npm run dev
```

**Continue IOTA development:**
```bash
git checkout iota-integration
npm run dev
```

## 📋 Quick Commands

```bash
# List all branches
git branch -a

# See current branch
git branch --show-current

# View commit history
git log --oneline --graph --all

# Show tags
git tag -l
```

## 📤 Sharing with Team

**Option 1: Direct branch**
```bash
git checkout localstorage-demo
# Share this directory
```

**Option 2: Create archive**
```bash
git archive --format=zip --output=tshirt-dpp-localstorage-v1.0.zip localstorage-demo
# Share the zip file
```

**Option 3: Push to GitHub**
```bash
git push origin localstorage-demo
git push origin v1.0-localstorage
# Share the GitHub link
```

---

**Current Branch:** `iota-integration` (ready for blockchain work!)
