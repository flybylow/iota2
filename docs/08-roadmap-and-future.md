# Roadmap & Future Development

## Current Status: Phase 1 Complete ✓

- [x] Three-tab interface (Producer/Consumer/Recycler)
- [x] Complete user flows for all actors
- [x] Status progression system
- [x] Mock DPP creation and lifecycle
- [x] Visual design (dark theme, gradients)
- [x] Demo-ready UX prototype

---

## Phase 2: IOTA Integration (Next Priority)

### Blockchain Connection
- [ ] Integrate IOTA Wallet Adapter
- [ ] Deploy Move smart contract to testnet
- [ ] Replace mock state with on-chain reads
- [ ] Transaction signing for all actions
- [ ] Explorer links for transparency

### QR Code Functionality
- [ ] Real QR code generation (`qrcode.react`)
- [ ] QR scanning capability (`@yudiel/react-qr-scanner`)
- [ ] Mobile camera integration
- [ ] Fallback for manual DPP ID entry

### Smart Contract Features
- [ ] `create_dpp()` function tested
- [ ] `mark_end_of_life()` verified
- [ ] `verify_and_unlock()` working
- [ ] `flag_mismatch()` implemented
- [ ] Error codes and assertions validated

**Estimated Completion:** 2-3 weeks

---

## Phase 3: Polish for Berlin Finals (March/April 2026)

### User Experience
- [ ] Mobile-responsive design (iOS/Android)
- [ ] Loading states (skeleton screens)
- [ ] Transaction confirmation modals
- [ ] Error handling (user-friendly messages)
- [ ] Success animations (confetti, transitions)

### Technical Reliability
- [ ] Retry logic for failed transactions
- [ ] Offline detection
- [ ] Gas estimation
- [ ] Testnet fallback if mainnet unavailable

### Demo Preparation
- [ ] Pre-loaded demo scenarios
- [ ] Reset functionality
- [ ] Presentation mode (auto-advance?)
- [ ] Backup slides/video
- [ ] Printed QR codes for physical demo

**Estimated Completion:** 2 weeks before finals

---

## Phase 4: Production Features (Post-Hackathon)

### Recycler Registry
**Problem:** Current MVP trusts any recycler

**Solution:**
- Authorized recycler smart contract registry
- KYC verification process
- Staking mechanism (recyclers put down deposit)
- Reputation system (flagged recyclers get blacklisted)

```move
struct RecyclerRegistry has key {
    authorized: vector<address>,
    stakes: Table<address, Coin<IOTA>>,
    reputation: Table<address, u64>,
}

public entry fun verify_and_unlock(
    dpp: &mut TShirtDPP,
    registry: &RecyclerRegistry,
    ctx: &mut TxContext
) {
    let recycler = tx_context::sender(ctx);
    assert!(vector::contains(&registry.authorized, &recycler), E_NOT_AUTHORIZED);
    // ... proceed with unlock
}
```

### Greenwashing Dashboard
**Problem:** Flagged producers have no public visibility

**Solution:**
- Public leaderboard of producers
- Display: verified vs. flagged ratio
- Filter by material type
- Time-series data (improving or declining?)

**UI Mockup:**
```
┌─────────────────────────────────────────┐
│ Producer Transparency                   │
├─────────────┬──────────┬────────┬───────┤
│ Producer    │ Verified │ Flagged│ Score │
├─────────────┼──────────┼────────┼───────┤
│ EcoThreads  │ 1,247    │ 3      │ 99.8% │
│ GreenWear   │ 892      │ 87     │ 91.1% │
│ FastFashion │ 234      │ 456    │ 33.9% │
└─────────────┴──────────┴────────┴───────┘
```

### Consumer Privacy (ZKP)
**Problem:** Consumer wallet address is public on-chain

**Solution:**
- Zero-Knowledge Proof of eligibility
- Consumer proves they own the DPP without revealing identity
- Recycler confirms without seeing wallet address
- Value sent to anonymous address

**Tech:** Use zk-SNARKs or IOTA's native privacy features

### Material Verification (NIR Scanner)
**Problem:** Recycler judgment is subjective

**Solution:**
- Near-Infrared spectroscopy scanner integration
- Objective material composition analysis
- API integration: `material_scanner.verify(dpp.id)`
- Automated verification (no human bias)

**Hardware Partner:** Collaborate with textile analysis companies

---

## Phase 5: Scale & Expansion

### Multi-Product Support
Extend beyond t-shirts:
- **Electronics**: Verify recycling of phones, laptops
- **Batteries**: EU Battery Passport compliance
- **Packaging**: DPP for single-use plastics
- **Furniture**: Circular economy for IKEA-style products

**Data Model:**
```typescript
interface ProductDPP {
  type: 'textile' | 'electronics' | 'battery' | 'packaging';
  specificAttributes: {
    // Textile: material, weight, dyes
    // Electronics: components, hazardous materials
    // Battery: chemistry, capacity, origin
  };
}
```

### B2B Features
- **Producer Dashboard**: Bulk DPP creation, analytics
- **Recycler Portal**: Daily batches, material breakdown reports
- **Regulator View**: Compliance audits, EPR verification

### API for Third Parties
```
POST /api/v1/dpp
GET  /api/v1/dpp/:id
POST /api/v1/dpp/:id/verify
GET  /api/v1/producer/:id/stats
GET  /api/v1/compliance-report
```

**Use Cases:**
- Fashion brands integrate into e-commerce
- Recycling companies connect sorting systems
- Governments audit EPR compliance

---

## Phase 6: Regulatory Alignment

### EU Digital Product Passport
Align with upcoming regulations:
- **ESPR** (Ecodesign for Sustainable Products Regulation)
- **Battery Regulation** (2027 deadline)
- **Textile Strategy** (2025+ requirements)

**Required Fields:**
- Composition
- Repair instructions
- Recycling instructions
- Carbon footprint
- Supply chain transparency

### Data Standards
- **GS1 Digital Link**: Global product identifier
- **ISO standards**: Textile composition codes
- **EPR registries**: Connect to national databases

---

## Phase 7: Economic Sustainability

### Revenue Model Options

**Option 1: Transaction Fee**
- 2-5% fee on locked value
- Example: €2 locked → €0.10 fee
- Split: 50% platform, 50% ecosystem fund

**Option 2: Producer Subscription**
- Tiered pricing: Startup / SME / Enterprise
- €50/mo → 500 DPPs
- €500/mo → Unlimited + API access

**Option 3: Data Insights**
- Aggregate material flow data
- Sell reports to regulators/researchers
- Recycler heatmaps (where to build facilities)

**Option 4: Penalty Pool**
- Flagged greenwashing → value goes to pool
- Pool funds recycling infrastructure
- Virtuous cycle

---

## Open Questions for Discussion

### Technical Decisions

1. **Recycler Trust Model**
   - Permissionless (anyone can verify)?
   - Permissioned (authorized recyclers only)?
   - Hybrid (staking required but open)?

2. **Material Mismatch Resolution**
   - Immediate flag, or dispute process?
   - Appeal mechanism?
   - Third-party arbitration?

3. **Value Stuck Scenario**
   - Timeout mechanism (5 years)?
   - Producer can reclaim?
   - Escrow goes to public good?

4. **Cross-Chain Compatibility**
   - IOTA-only, or bridge to other chains?
   - Multi-chain DPPs?

### Business Decisions

5. **Who Pays the Locked Value?**
   - Producer absorbs (EPR cost)?
   - Built into product price (consumer pays)?
   - Government subsidy?

6. **Recycler Compensation**
   - Do they get a fee per verification?
   - Or just the verified material value?
   - Volume discounts?

7. **Consumer Adoption**
   - €2 enough incentive?
   - What about low-value products?
   - Gamification (badges, streaks)?

---

## Long-Term Vision (5+ Years)

### Global Impact

**Goal:** Every textile product in the EU has a DPP by 2030.

**Metrics:**
- 1 billion DPPs created
- €2 billion locked in circular economy
- 50% reduction in textile landfill waste
- 10,000+ verified recyclers

### Beyond Textiles
- Tabulas becomes the infrastructure layer for all circular economy
- Every physical product has a DPP
- EPR compliance is automated
- Greenwashing is extinct (verifiable claims only)

### Open Source Ecosystem
- Open-source the protocol
- Let other industries build on it
- Community-driven governance (DAO?)
- Grant program for innovators

---

## Success Metrics

### Hackathon (April 2026)
- ✓ Working demo
- ✓ Top 5 finish
- ✓ Pitch in Berlin
- ✓ Interest from IOTA Foundation

### 6 Months Post-Hackathon
- 10 producers piloting the system
- 1,000 DPPs created
- 5 recyclers integrated
- Press coverage (TechCrunch, etc.)

### 1 Year
- First paying customer
- EU pilot program
- Series A fundraising
- Team of 5-10 people

### 3 Years
- Profitable
- 100,000+ DPPs
- Multiple countries
- Industry standard

---

## How to Contribute

If you want to join or contribute:

1. **Developers**: Check GitHub issues, pick a feature
2. **Designers**: Help with mobile responsiveness, recycler UX
3. **Business**: Connect us with fashion brands, recyclers
4. **Legal**: Navigate EU regulations, data privacy
5. **Research**: Material science, ZKP implementation

**Contact:** ward@tabulas.eu

---

*For questions, see the main README or contact the team.*
