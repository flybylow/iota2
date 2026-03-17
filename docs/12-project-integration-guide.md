# Project Integration & Comparison Guide

**Document**: Integration guide for all three IOTA2 projects  
**Purpose**: Understand how projects relate and can work together  
**Date**: January 29, 2026

---

## 🎯 Overview: Three Projects, One Vision

The IOTA2 workspace contains THREE distinct but related projects, each demonstrating different aspects of blockchain technology applied to real-world problems.

### The Three Projects

| Project | Status | Purpose | Blockchain |
|---------|--------|---------|------------|
| **ScholarFlow** | ✅ LIVE | Grant management system | IOTA Testnet |
| **T-Shirt DPP** | ✅ Ready | Circular economy contracts | Ready to deploy |
| **T-Shirt Escrow** | ✅ Running | DPP user interface | Mock → Will integrate |

---

## 📊 Project Comparison

### ScholarFlow

**Problem**: Transparent, verifiable grant distribution  
**Solution**: Blockchain-based grant minting and tracking  
**Users**: Admins (mint), Students (receive), Public (verify)

**Tech Stack:**
- Smart Contract: Move (grant.move)
- Frontend: Next.js + @iota/dapp-kit
- Deployment: Testnet (live)
- Integration: Fully connected

**Key Features:**
- AdminCap permission system
- Grant objects transferred to students
- Event emission for tracking
- Real-time blockchain reads
- Wallet connection

**Current State**: ✅ Fully operational on testnet

---

### T-Shirt DPP (Smart Contracts)

**Problem**: Track textile lifecycle, incentivize recycling  
**Solution**: Digital Product Passport with economic rewards  
**Users**: Manufacturers, Consumers, Recyclers

**Tech Stack:**
- Smart Contract: Move (tshirt_dpp.move)
- Frontend: None (contracts only)
- Deployment: Ready for testnet
- Integration: Awaiting UI connection

**Key Features:**
- ManufacturerCap + RecyclerCap system
- Lifecycle tracking (Active → EOL → Recycled)
- Locked reward mechanism
- Material composition tracking
- Event emission

**Current State**: ✅ Complete, tested, ready to deploy

---

### T-Shirt Escrow (Prototype UI)

**Problem**: User interface for circular economy system  
**Solution**: Professional 3-tab UI for all actors  
**Users**: Producers, Consumers, Recyclers

**Tech Stack:**
- Frontend: Next.js + React (TShirtEscrow.tsx)
- Backend: Mock state (in-memory)
- Deployment: Running on localhost:3000
- Integration: Ready to connect to tshirt_dpp

**Key Features:**
- Three-tab interface
- Producer: Create DPP, lock value
- Consumer: Mark EOL, claim reward
- Recycler: Verify, unlock value
- Status tracking with badges

**Current State**: ✅ Fully functional prototype (mock data)

---

## 🔗 How Projects Relate

### Relationship Map

```
ScholarFlow (LIVE)
├── Smart Contract: grant.move ✅ Deployed
└── Frontend: scholarflow-ui ✅ Connected
    ↓
    Demonstrates: Full blockchain integration pattern
    
T-Shirt DPP (READY)
├── Smart Contract: tshirt_dpp.move ✅ Complete
└── Frontend: [None - contracts only]
    ↓
    Awaiting connection to...
    ↓
T-Shirt Escrow (PROTOTYPE)
├── Frontend: tshirt-escrow ✅ Running
└── Backend: Mock state (temporary)
    ↓
    Ready to integrate with T-Shirt DPP
```

### Shared Patterns

All three projects demonstrate:
- **IOTA Move** smart contract development
- **Capability-based access control** (AdminCap, ManufacturerCap, etc.)
- **Event emission** for transparency
- **Next.js** frontend architecture
- **Circular economy** principles

---

## 🚀 Integration Strategy

### Phase 1: Current State ✅

**Completed:**
- [x] ScholarFlow contract deployed
- [x] ScholarFlow UI connected
- [x] T-Shirt DPP contracts written
- [x] T-Shirt Escrow UI built
- [x] All documentation written

**Result**: 2 of 3 projects fully operational

---

### Phase 2: Deploy T-Shirt DPP (Next)

**Goal**: Get tshirt_dpp contracts on testnet

**Steps:**

1. **Test Locally**
   ```bash
   cd tshirt_dpp
   iota move test
   # Ensure all tests pass
   ```

2. **Deploy to Testnet**
   ```bash
   iota client publish --gas-budget 100000000
   # Save package ID from output
   ```

3. **Document Deployment**
   ```bash
   # Record in deployment notes:
   PACKAGE_ID=0x...
   MANUFACTURER_CAP_ID=0x...
   RECYCLER_CAP_ID=0x...
   ```

4. **Verify on Explorer**
   - Visit: https://explorer.iota.org/object/{PACKAGE_ID}?network=testnet
   - Confirm package visible
   - Check module exports

**Estimated Time**: 30 minutes

---

### Phase 3: Connect T-Shirt Escrow to DPP Contracts

**Goal**: Replace mock state with blockchain calls

**Integration Points:**

#### 1. Create DPP (Producer Tab)

**Current** (Mock):
```typescript
const handleCreateDPP = () => {
  setDppCreated(true);
  setDppDetails({
    id: 'mock-id-123',
    material: selectedMaterial,
    lockedValue: parseFloat(lockedValue),
  });
};
```

**After Integration**:
```typescript
const handleCreateDPP = async () => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_dpp::create_and_transfer_dpp`,
    arguments: [
      tx.object(manufacturerCapId),
      tx.pure.string(selectedMaterial),
      tx.pure.u64(lockedValue * 1_000_000_000), // Convert to nanos
      tx.pure.address(consumerAddress),
    ],
  });

  const result = await signAndExecute({ transaction: tx });
  
  setDppCreated(true);
  setDppDetails({
    id: result.objectChanges[0].objectId,
    material: selectedMaterial,
    lockedValue: parseFloat(lockedValue),
  });
};
```

#### 2. Mark End of Life (Consumer Tab)

**Current** (Mock):
```typescript
const handleMarkEOL = () => {
  setStatus('pending_recycling');
};
```

**After Integration**:
```typescript
const handleMarkEOL = async () => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_dpp::mark_end_of_life`,
    arguments: [tx.object(dppObjectId)],
  });

  await signAndExecute({ transaction: tx });
  
  setStatus('pending_recycling');
};
```

#### 3. Verify & Unlock (Recycler Tab)

**Current** (Mock):
```typescript
const handleUnlockValue = () => {
  setStatus('recycled');
  setValueUnlocked(true);
};
```

**After Integration**:
```typescript
const handleUnlockValue = async () => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::tshirt_dpp::verify_and_unlock`,
    arguments: [
      tx.object(recyclerCapId),
      tx.object(dppObjectId),
    ],
  });

  const result = await signAndExecute({ transaction: tx });
  
  // TODO: Process payment to consumer from returned amount
  
  setStatus('recycled');
  setValueUnlocked(true);
};
```

#### 4. Install Dependencies

```bash
cd tshirt-escrow
npm install @iota/iota-sdk @iota/dapp-kit
```

#### 5. Add Wallet Provider

Update `tshirt-escrow/app/layout.tsx`:
```typescript
import { IotaClientProvider, WalletProvider } from '@iota/dapp-kit';
import { getFullnodeUrl } from '@iota/iota-sdk/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <IotaClientProvider networks={networks} defaultNetwork="testnet">
            <WalletProvider>
              {children}
            </WalletProvider>
          </IotaClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

#### 6. Add Wallet Connection

Add to `TShirtEscrow.tsx`:
```typescript
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';

function TShirtEscrow() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  // Add wallet connection UI to header
  // Replace mock actions with blockchain calls
}
```

**Estimated Time**: 2-3 hours

---

### Phase 4: Query Blockchain State

**Goal**: Display real DPP data from blockchain

#### Fetch DPP Objects

```typescript
import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';

async function fetchDPPs() {
  const client = new IotaClient({ url: getFullnodeUrl('testnet') });
  
  // Get DPPs owned by current user
  const objects = await client.getOwnedObjects({
    owner: currentAccount.address,
    filter: {
      StructType: `${PACKAGE_ID}::tshirt_dpp::TShirtDPP`,
    },
  });

  // Fetch full object details
  const dppDetails = await Promise.all(
    objects.data.map(obj => 
      client.getObject({ 
        id: obj.data.objectId,
        options: { showContent: true }
      })
    )
  );

  return dppDetails;
}
```

#### Display DPP Status

```typescript
function getDPPStatus(statusCode: number): string {
  const statusMap = {
    0: 'active',
    1: 'pending_recycling',
    2: 'recycled',
  };
  return statusMap[statusCode] || 'unknown';
}
```

#### Query Events

```typescript
async function fetchRecyclingEvents() {
  const client = new IotaClient({ url: getFullnodeUrl('testnet') });
  
  const events = await client.queryEvents({
    query: { 
      MoveEventType: `${PACKAGE_ID}::tshirt_dpp::RewardClaimed` 
    },
    limit: 50,
  });

  return events.data.map(e => ({
    dppId: e.parsedJson.dpp_id,
    consumer: e.parsedJson.consumer,
    amount: e.parsedJson.reward_amount,
    timestamp: new Date(Number(e.timestampMs)).toLocaleString(),
  }));
}
```

**Estimated Time**: 2 hours

---

## 🎯 Integration Milestones

### Milestone 1: Deploy DPP ✅ Ready
- [ ] Test tshirt_dpp locally
- [ ] Deploy to testnet
- [ ] Verify on explorer
- [ ] Document package ID

### Milestone 2: Basic Integration
- [ ] Install IOTA SDK in tshirt-escrow
- [ ] Add wallet provider
- [ ] Add connect button
- [ ] Test wallet connection

### Milestone 3: Write Operations
- [ ] Implement create_dpp call
- [ ] Implement mark_end_of_life call
- [ ] Implement verify_and_unlock call
- [ ] Add transaction feedback

### Milestone 4: Read Operations
- [ ] Query owned DPPs
- [ ] Display DPP details from chain
- [ ] Query events
- [ ] Show recycling history

### Milestone 5: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Transaction history
- [ ] Success animations

---

## 📋 Capability Management

### ScholarFlow

**AdminCap**: Controls grant minting
- Current holder: Deployer address
- Transfer: `transfer_admin_cap(cap, new_admin)`
- Use case: Onboard additional admins

### T-Shirt DPP

**ManufacturerCap**: Controls DPP creation
- Current holder: Deployer (after deployment)
- Transfer: `transfer_manufacturer_cap(cap, manufacturer)`
- Use case: Authorize clothing brands

**RecyclerCap**: Controls verification and reward unlocking
- Current holder: Deployer (after deployment)
- Transfer: `transfer_recycler_cap(cap, recycler)`
- Use case: Certify recycling facilities

### Best Practices

1. **Separate Capabilities**: Don't keep all caps on one address
2. **Document Holders**: Track who owns which capabilities
3. **Secure Keys**: Use hardware wallets for capability owners
4. **Test Transfers**: Practice on testnet first

---

## 🔐 Security Considerations

### ScholarFlow

**Risks:**
- AdminCap loss → Cannot mint new grants
- AdminCap compromise → Unauthorized grants

**Mitigations:**
- Multi-sig for admin operations (future)
- Regular backup of admin keys
- Audit trail via events

### T-Shirt DPP

**Risks:**
- ManufacturerCap compromise → Fake DPPs
- RecyclerCap compromise → False verifications
- Lost DPP objects → Cannot claim rewards

**Mitigations:**
- Capability holder vetting process
- Object recovery mechanisms (future)
- Insurance/escrow for locked values

### Shared Risks

**General Blockchain:**
- Private key loss → Permanent loss of access
- Transaction replay → Prevented by IOTA
- Front-running → Monitor mempool (future)

**Smart Contract:**
- Logic bugs → Audit before mainnet
- Reentrancy → Not applicable to Move
- Integer overflow → Move has safeguards

---

## 🧪 Testing Strategy

### Unit Tests

**ScholarFlow:**
```bash
cd scholarflow_core
iota move test
```

**T-Shirt DPP:**
```bash
cd tshirt_dpp
iota move test
```

### Integration Tests

**After Deployment:**
1. Create test accounts (manufacturer, consumer, recycler)
2. Transfer capabilities
3. Run full lifecycle:
   - Mint DPP
   - Transfer to consumer
   - Mark EOL
   - Verify and unlock
4. Check events emitted
5. Verify state changes

### Frontend Tests

**T-Shirt Escrow:**
```bash
cd tshirt-escrow
npm test  # If tests exist
```

**Manual Testing Checklist:**
- [ ] Wallet connects
- [ ] Create DPP works
- [ ] Transaction shows in wallet
- [ ] DPP appears in UI
- [ ] Mark EOL updates status
- [ ] Verification unlocks value
- [ ] Explorer links work

---

## 📊 Monitoring & Analytics

### On-Chain Metrics

**ScholarFlow:**
- Total grants minted
- Total amount distributed
- Number of recipients
- Admin activity

**T-Shirt DPP:**
- Total DPPs created
- Material distribution
- Recycling rate (EOL → Recycled)
- Average locked value
- Time to recycle

### Event Queries

**All GrantMinted events:**
```typescript
const events = await client.queryEvents({
  query: { 
    MoveEventType: `${SCHOLARFLOW_PACKAGE}::grant::GrantMinted` 
  },
});
```

**All DPPCreated events:**
```typescript
const events = await client.queryEvents({
  query: { 
    MoveEventType: `${DPP_PACKAGE}::tshirt_dpp::DPPCreated` 
  },
});
```

### Dashboard Ideas

**ScholarFlow Dashboard:**
- Grant distribution by student
- Amount over time
- Admin activity log

**Circular Economy Dashboard:**
- Products created vs recycled
- Material recovery rates
- Economic impact (locked vs claimed)
- Geographic distribution

---

## 🚢 Deployment Checklist

### Pre-Deployment

**Code:**
- [x] Smart contracts written
- [x] Unit tests pass
- [x] Frontend built
- [ ] Integration tests written
- [ ] Security review done

**Documentation:**
- [x] Contract documentation complete
- [x] Frontend documentation complete
- [x] Integration guide written
- [x] User guides written

**Infrastructure:**
- [x] IOTA testnet account
- [x] Testnet tokens acquired
- [ ] Production domain secured
- [ ] Hosting setup (Vercel/similar)

### Deployment Steps

1. **Deploy Contracts**
   ```bash
   # Deploy tshirt_dpp
   cd tshirt_dpp
   iota client publish --gas-budget 100000000
   ```

2. **Update Frontend**
   ```typescript
   // Update package ID in tshirt-escrow
   const PACKAGE_ID = '0x...'; // From deployment
   ```

3. **Deploy Frontend**
   ```bash
   cd tshirt-escrow
   vercel deploy --prod
   ```

4. **Test End-to-End**
   - Connect wallet
   - Run full lifecycle
   - Verify on explorer

5. **Document Deployment**
   - Save all package IDs
   - Save capability object IDs
   - Update docs with URLs

### Post-Deployment

- [ ] Monitor gas usage
- [ ] Track error rates
- [ ] Collect user feedback
- [ ] Plan improvements

---

## 🎓 Learning Outcomes

### What We Learned

**From ScholarFlow:**
- How to deploy Move contracts to testnet
- IOTA dApp Kit integration patterns
- Event querying and display
- Wallet connection flows

**From T-Shirt DPP:**
- Complex capability systems
- Multi-actor contract design
- Lifecycle state management
- Economic incentive encoding

**From T-Shirt Escrow:**
- Professional UI design for blockchain apps
- Mock-to-blockchain migration patterns
- Multi-tab user interfaces
- Status tracking and visualization

### Patterns to Reuse

**Capability Pattern:**
```move
public struct AdminCap has key { id: UID }

public fun privileged_action(
    _: &AdminCap,  // Proves caller has capability
    // ... other args
) {
    // Do privileged action
}
```

**Event Pattern:**
```move
public struct ActionPerformed has copy, drop {
    actor: address,
    details: ...,
}

public fun do_action(...) {
    // ... perform action
    event::emit(ActionPerformed { ... });
}
```

**Frontend Query Pattern:**
```typescript
async function queryBlockchainData() {
  const client = new IotaClient({ url: getFullnodeUrl('testnet') });
  
  const events = await client.queryEvents({
    query: { MoveEventType: `${PACKAGE_ID}::module::Event` },
  });
  
  return events.data.map(e => e.parsedJson);
}
```

---

## 🔮 Future: Combined Platform

### Vision: Unified Circular Economy Platform

**Imagine:**
- ScholarFlow for educational incentives
- T-Shirt DPP for product tracking
- Additional modules for other verticals
- Shared capability management
- Unified dashboard

**Architecture:**
```
Tabulas Platform
├── Modules
│   ├── scholarflow::grant
│   ├── tshirt_dpp::tshirt_dpp
│   ├── electronics_dpp::product
│   └── furniture_dpp::item
├── Shared
│   ├── capability_registry
│   ├── treasury
│   └── analytics
└── Frontend
    ├── Universal DPP viewer
    ├── Admin dashboard
    └── Public explorer
```

### Potential Synergies

**Cross-Module:**
- Students earn grants → Use to buy DPP products
- Recycling rewards → Fund new grants
- Shared reputation system
- Unified analytics

**Business Model:**
- Platform fee on recycling rewards
- Capability registration fees
- Analytics subscriptions
- White-label deployments

---

## 📞 Support & Resources

### Documentation Links

- **BUILD_COMPLETE.md**: Complete project overview
- **10-scholarflow-overview.md**: ScholarFlow guide
- **11-tshirt-dpp-contracts.md**: DPP contracts guide
- **06-deployment-guide.md**: Deployment instructions

### Code Locations

- **ScholarFlow Contract**: `scholarflow_core/sources/grant.move`
- **ScholarFlow UI**: `scholarflow-ui/app/page.tsx`
- **T-Shirt DPP Contract**: `tshirt_dpp/sources/tshirt_dpp.move`
- **T-Shirt Escrow UI**: `tshirt-escrow/components/TShirtEscrow.tsx`

### External Resources

- **IOTA Docs**: https://docs.iota.org/
- **Move Book**: https://move-book.com/
- **dApp Kit**: https://sdk.iota.org/dapp-kit
- **Testnet Explorer**: https://explorer.iota.org/?network=testnet

---

## ✅ Integration Status

| Integration Point | Status | Next Action |
|-------------------|--------|-------------|
| ScholarFlow deployed | ✅ Done | Monitor, enhance |
| ScholarFlow UI connected | ✅ Done | Add features |
| T-Shirt DPP tested | ✅ Done | Deploy to testnet |
| T-Shirt DPP deployed | ⏳ Pending | Run `iota client publish` |
| Escrow SDK installed | ⏳ Pending | `npm install @iota/...` |
| Escrow wallet connected | ⏳ Pending | Add WalletProvider |
| Escrow create_dpp | ⏳ Pending | Replace mock |
| Escrow mark_eol | ⏳ Pending | Replace mock |
| Escrow verify | ⏳ Pending | Replace mock |
| Escrow query data | ⏳ Pending | Add blockchain reads |
| Full E2E test | ⏳ Pending | After all above |

---

**Last Updated**: January 29, 2026  
**Status**: ScholarFlow live, T-Shirt DPP ready for integration  
**Next**: Deploy tshirt_dpp, connect escrow UI

🚀 **Three projects, one platform, infinite possibilities.**
