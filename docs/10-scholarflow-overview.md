# ScholarFlow: Grant Management System

**Status**: ✅ **LIVE ON IOTA TESTNET**  
**Package ID**: `0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926`  
**Frontend**: http://localhost:3000 (scholarflow-ui)  
**Network**: IOTA Testnet  
**Date**: January 29, 2026

---

## 🎯 Overview

ScholarFlow is a **blockchain-based grant management system** built on IOTA. It enables administrators to mint and distribute grants to students in a transparent, immutable way.

### Key Features

- ✅ **Admin-controlled minting** - Only AdminCap holders can mint grants
- ✅ **Direct transfers** - Grants are automatically sent to student addresses
- ✅ **Event tracking** - All grants emit blockchain events for transparency
- ✅ **Full UI** - Complete Next.js interface with IOTA wallet integration
- ✅ **Live blockchain data** - Real-time grant display from testnet

---

## 📦 Project Structure

```
IOTA2/
├── scholarflow_core/           # Move smart contracts
│   ├── sources/
│   │   ├── grant.move          # Main grant module ⭐
│   │   └── scholarflow_core.move
│   ├── tests/
│   │   └── scholarflow_core_tests.move
│   └── Move.toml
│
└── scholarflow-ui/             # Next.js frontend
    ├── app/
    │   ├── page.tsx            # Main UI ⭐
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   └── globals.css
    └── package.json
```

---

## 🔐 Smart Contract Architecture

### Module: `scholarflow::grant`

Located in: `scholarflow_core/sources/grant.move`

#### Structs

**1. AdminCap (Admin Capability)**
```move
public struct AdminCap has key {
    id: UID,
}
```
- Grants permission to mint grants
- Transferred to deployer on init
- Can be transferred to other admins

**2. Grant (Student Grant)**
```move
public struct Grant has key {
    id: UID,
    student: address,
    amount: u64,
}
```
- Represents a grant awarded to a student
- Automatically transferred to student on mint
- Immutable once created

**3. GrantMinted (Event)**
```move
public struct GrantMinted has copy, drop {
    student: address,
    amount: u64,
    grant_id: ID,
}
```
- Emitted when a grant is minted
- Used for transparency and tracking
- Indexed by frontend for display

#### Functions

**1. init (Module Initializer)**
```move
fun init(ctx: &mut TxContext)
```
- Called once when module is published
- Creates AdminCap and transfers to deployer
- Only runs during deployment

**2. mint (Create Grant)**
```move
public fun mint(
    _: &AdminCap,
    student: address,
    amount: u64,
    ctx: &mut TxContext,
)
```
- **Requires**: AdminCap reference
- Creates new Grant object
- Emits GrantMinted event
- Transfers grant to student address

**3. transfer_admin_cap (Transfer Admin Rights)**
```move
public entry fun transfer_admin_cap(
    admin_cap: AdminCap,
    recipient: address,
)
```
- Transfers admin rights to another address
- Can be called by current AdminCap owner
- Useful for admin succession

---

## 🎨 Frontend Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: IOTA SDK (`@iota/iota-sdk`, `@iota/dapp-kit`)
- **Network**: IOTA Testnet

### Key Components

**Main Page** (`scholarflow-ui/app/page.tsx`)

Features:
1. **Wallet Connection** - ConnectButton from @iota/dapp-kit
2. **Grant Minting Form** - Admin-only interface
3. **Live Grant Feed** - Real-time display of all minted grants
4. **Address Validation** - Client-side validation for IOTA addresses
5. **Explorer Links** - Deep links to IOTA testnet explorer

### User Interface

#### Header
- Project title with gradient text
- "Live from IOTA Testnet" badge
- ConnectButton (IOTA wallet integration)

#### Mint Grant Section (Admin Only)
- **Student Address Input** - With validation (66 chars, starts with 0x)
- **"Use My Address" Button** - Quick-fill with connected wallet
- **Amount Input** - Grant amount in base units
- **Mint Button** - Executes blockchain transaction
- **Error Handling** - Shows validation errors and transaction failures

#### Recent Grants Feed
- **Loading State** - Animated skeleton screens
- **Empty State** - Friendly message when no grants exist
- **Grant Cards** - Display:
  - Grant ID (clickable link to explorer)
  - Amount (large, gradient text)
  - Student address (clickable link to explorer)
  - Timestamp (human-readable)

---

## 🚀 Deployment & Setup

### Prerequisites

```bash
# Required tools
- Node.js 18+
- IOTA CLI
- IOTA wallet (browser extension)
- Testnet IOTA tokens
```

### Smart Contract Deployment

```bash
# Navigate to contract directory
cd scholarflow_core

# Build the Move package
iota move build

# Publish to testnet
iota client publish --gas-budget 100000000

# Note the published package ID
# Current: 0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926
```

### Frontend Setup

```bash
# Navigate to UI directory
cd scholarflow-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Environment Configuration

The package ID is hardcoded in `page.tsx`:

```typescript
const PACKAGE_ID = '0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926';
```

To use a different deployment, update this constant.

---

## 🔄 User Flows

### Flow 1: Admin Mints Grant

1. **Connect Wallet**
   - Click "Connect Wallet" in header
   - Select IOTA wallet extension
   - Approve connection

2. **Verify AdminCap**
   - Frontend checks if connected wallet owns AdminCap
   - If not found, shows error message

3. **Enter Grant Details**
   - Input student address (or use "Use My Address")
   - Enter grant amount
   - Address validated client-side

4. **Submit Transaction**
   - Click "Mint Grant"
   - Wallet prompts for approval
   - Transaction submitted to blockchain

5. **Confirmation**
   - Success message shown
   - Grant appears in feed after ~2 seconds
   - Student receives Grant object in their wallet

### Flow 2: Student Receives Grant

1. **Automatic Transfer**
   - Grant is automatically transferred to student address
   - No action required from student

2. **View in Wallet**
   - Student opens IOTA wallet
   - Grant appears in owned objects
   - Contains: ID, amount, student address

3. **Verify on Explorer**
   - Click grant ID in UI
   - Opens IOTA testnet explorer
   - Shows full object details and transaction history

### Flow 3: Public Views Grants

1. **Open Application**
   - Navigate to http://localhost:3000
   - No wallet connection required

2. **Browse Recent Grants**
   - All minted grants displayed in feed
   - Shows: ID, amount, student, timestamp
   - Links to explorer for verification

---

## 🧪 Testing

### Manual Testing Checklist

**Smart Contract:**
- [x] AdminCap created on deployment
- [x] Mint function requires AdminCap
- [x] Grant transferred to student address
- [x] GrantMinted event emitted
- [x] Admin cap transferable

**Frontend:**
- [x] Wallet connection works
- [x] Address validation functional
- [x] "Use My Address" button works
- [x] Grant minting submits transaction
- [x] Events fetched and displayed
- [x] Explorer links work
- [x] Loading states show correctly
- [x] Error handling works

### Test on Testnet

```bash
# Get testnet tokens
# Visit: https://faucet.testnet.iota.org/

# Mint a test grant
# Use UI or CLI:
iota client call \
  --package 0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926 \
  --module grant \
  --function mint \
  --args <ADMIN_CAP_ID> <STUDENT_ADDRESS> 1000 \
  --gas-budget 10000000
```

---

## 📊 Blockchain Data

### Package Information

- **Package ID**: `0x1349d25e9193ce1ccb0f3f58d8082a3986d376e72f6355be5ad22b684055d926`
- **Network**: IOTA Testnet
- **Modules**: `scholarflow::grant`
- **Published**: January 2026

### Event Queries

The frontend queries events using:

```typescript
const events = await client.queryEvents({
  query: { 
    MoveEventType: `${PACKAGE_ID}::grant::GrantMinted` 
  },
  limit: 50,
});
```

### Explorer URLs

- **Package**: `https://explorer.iota.org/object/{PACKAGE_ID}?network=testnet`
- **Grants**: `https://explorer.iota.org/object/{GRANT_ID}?network=testnet`
- **Addresses**: `https://explorer.iota.org/address/{ADDRESS}?network=testnet`

---

## 🎯 Use Cases

### 1. University Scholarships
- Admin: University financial aid office
- Students: Enrolled students
- Use: Distribute scholarship funds transparently

### 2. Research Grants
- Admin: Research department
- Students: PhD candidates, researchers
- Use: Allocate research funding on-chain

### 3. Competition Prizes
- Admin: Competition organizers
- Students: Winners
- Use: Distribute prizes with proof of award

### 4. Emergency Relief
- Admin: Student support services
- Students: Students in need
- Use: Quick, transparent emergency funding

---

## 🔐 Security Considerations

### Smart Contract

✅ **Admin Control**
- Only AdminCap holders can mint grants
- Prevents unauthorized grant creation

✅ **Immutable Grants**
- Once minted, grants cannot be modified
- Amount and recipient are permanent

✅ **Event Transparency**
- All minting actions emit events
- Public audit trail

⚠️ **Considerations**
- AdminCap ownership must be carefully managed
- No built-in amount limits or rate limiting
- No grant revocation mechanism

### Frontend

✅ **Client-side Validation**
- Address format checked before submission
- Prevents common input errors

✅ **Transaction Simulation**
- IOTA SDK simulates before executing
- Catches errors before gas is spent

⚠️ **Considerations**
- AdminCap check relies on wallet ownership
- No server-side validation
- Events may have indexing delay

---

## 🚀 Future Enhancements

### Phase 2: Advanced Features

**Grant Management**
- [ ] Grant categories/types
- [ ] Maximum amount limits
- [ ] Approval workflows
- [ ] Multi-sig admin requirements

**Student Features**
- [ ] Grant acceptance confirmation
- [ ] Thank you messages
- [ ] Grant history dashboard
- [ ] Achievement badges

**Analytics**
- [ ] Total grants minted
- [ ] Amount distribution charts
- [ ] Student demographics
- [ ] Time-series analysis

**Integration**
- [ ] University SIS integration
- [ ] Email notifications
- [ ] PDF grant certificates
- [ ] Tax reporting exports

### Phase 3: Ecosystem

**Multi-Institution**
- [ ] Multiple AdminCaps (different universities)
- [ ] Cross-institution grants
- [ ] Grant portability
- [ ] Shared analytics

**DeFi Integration**
- [ ] Staking rewards for grant funds
- [ ] Yield generation for endowments
- [ ] Token-based grants
- [ ] Automated distribution schedules

---

## 📈 Metrics & Analytics

### Current State (January 2026)

**Smart Contract:**
- **Package**: Published to testnet
- **Functions**: 3 public functions
- **Structs**: 3 (AdminCap, Grant, GrantMinted)
- **Lines of Code**: 64

**Frontend:**
- **Lines of Code**: 288
- **Components**: 1 main page
- **API Calls**: 2 (queryEvents, getOwnedObjects)
- **Dependencies**: 5 major packages

**Testing:**
- **Manual Tests**: Passed
- **Live Deployment**: ✅ Operational
- **Grant Minting**: ✅ Confirmed working

---

## 🎓 Learning Resources

### IOTA Move Development
- **Docs**: https://docs.iota.org/
- **Examples**: https://github.com/iotaledger/iota/tree/develop/examples
- **Move Book**: https://move-book.com/

### Frontend Development
- **IOTA dApp Kit**: https://sdk.iota.org/dapp-kit
- **Next.js**: https://nextjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## 💬 Contact & Support

**Project Lead**: Ward  
**Email**: ward@tabulas.eu  
**Discord**: ward_tabulas  

**Organization**: Tabulas  
**Focus**: Circular Economy Infrastructure  
**Hackathon**: MasterZ × IOTA  

---

## ✅ Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Smart Contract | ✅ Deployed | Package on testnet |
| Frontend | ✅ Running | localhost:3000 |
| Wallet Integration | ✅ Working | IOTA dApp Kit |
| Event Indexing | ✅ Working | Real-time updates |
| AdminCap Management | ✅ Working | Transfer function |
| Documentation | ✅ Complete | This file |

---

**Last Updated**: January 29, 2026  
**Version**: 1.0  
**Status**: Production-ready for testnet

🎉 **ScholarFlow is live and operational!**
