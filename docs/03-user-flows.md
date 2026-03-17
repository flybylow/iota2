# User Flows - Detailed Interactions

## Three User Perspectives

### 🏭 Producer Flow

**Goal:** Create a Digital Product Passport and lock value for recycling incentive

**Steps:**
1. Select material composition from dropdown
   - 100% Organic Cotton
   - 100% Cotton
   - Cotton/Polyester Blend
   - 100% Polyester
   - 100% Linen
   - 100% Wool
2. Set locked value (€0.50 - €10.00)
3. Click "Lock Value & Create DPP"
4. Receive unique DPP ID (e.g., "DPP-X7K9M2")
5. Display QR code for physical attachment to t-shirt
6. QR code contains: `https://tabulas.eu/dpp/{DPP_ID}`

**Visual Elements:**
- Material dropdown selector
- Value input slider (€0.50 - €10.00)
- Big QR code display (220x220px)
- DPP details (ID, Material, Locked Value)
- Reset demo button

---

## 👤 Consumer Flow

**Goal:** View t-shirt details and initiate recycling process

### Phase 1: Active Use
1. Scan QR code on t-shirt tag
2. See DPP information:
   - Material composition
   - Producer name
   - Locked recycling reward
3. Keep t-shirt during normal use

### Phase 2: End of Life
1. Decide to recycle t-shirt
2. Enter wallet address to receive reward
3. Click "Mark End of Life"
4. Status changes to "Awaiting Recycler Confirmation"
5. Bring t-shirt to recycling point

### Phase 3: Reward Claim
1. Recycler verifies material
2. Smart contract releases funds
3. See "Value Claimed!" confirmation
4. €X.XX sent to wallet address

**Visual Elements:**
- DPP information card
- Recycling reward callout (prominent €X.XX display)
- Wallet address input field
- "Mark End of Life" button
- Pending status indicator
- Success celebration screen (🎉)

---

## ♻️ Recycler Flow

**Goal:** Verify material authenticity and unlock consumer reward

### Phase 1: Receive T-Shirt
1. Consumer brings t-shirt to recycling point
2. Scan DPP QR code
3. See producer's material claim
4. View consumer's wallet address
5. See locked value amount

### Phase 2: Material Verification
1. Inspect actual material (visual, tactile, or NIR scanner)
2. Compare with producer's claim

### Option A: Material Matches ✓
1. Click "Confirm Material & Unlock €X.XX"
2. Smart contract transfers funds to consumer
3. T-shirt proceeds to appropriate recycling stream
4. Status changes to "Recycling Verified"

### Option B: Material Mismatch ⚠️
1. Click "Flag Material Mismatch"
2. Producer gets greenwashing flag on-chain
3. Value remains locked (goes to penalty pool)
4. Creates permanent record of non-compliance

**Visual Elements:**
- Producer's material claim (large, prominent)
- DPP details card
- Consumer wallet address (truncated)
- Two-button choice (Confirm vs. Flag)
- Verification success screen
- "Scan Next Item" button

---

## Status Progression

```
ACTIVE
  ↓ (Consumer marks EOL)
PENDING
  ↓ (Recycler verifies)
RECYCLED ✓  or  FLAGGED ⚠️
```

### Status Indicators

- **○ No DPP** → Grey, not started
- **✓ DPP Created** → Green, producer completed
- **○ In Use** → Grey, consumer owns it
- **✓ End of Life** → Green, consumer marked
- **○ Value Locked** → Grey, not yet unlocked
- **✓ Value Unlocked** → Green, consumer received funds

---

## Edge Cases

### Consumer Never Marks EOL
- **Issue:** Value stuck in escrow forever
- **Future solution:** Timeout mechanism (e.g., 5 years → value returns to producer)

### Lost QR Code
- **Issue:** Cannot access DPP
- **Future solution:** DPP lookup by serial number or NFC backup

### Recycler Doesn't Exist in Area
- **Issue:** Consumer can't claim reward
- **Future solution:** Mail-in recycling option with shipping label

### Material Ambiguous
- **Issue:** Recycler unsure if material matches
- **Future solution:** NIR scanner integration for objective testing

---

*For data structures, see `04-technical-architecture.md`*  
*For React implementation, see `05-react-component.md`*
