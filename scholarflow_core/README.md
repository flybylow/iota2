# 🎓 ScholarFlow Core

Smart contract system for decentralized scholarship grant management on IOTA blockchain.

## 📋 Overview

ScholarFlow enables transparent, immutable scholarship grant distribution using blockchain technology. Admins can mint grants for students, creating an auditable trail of educational funding.

## 🏗️ Architecture

### Core Modules

#### `grant.move`
Simple grant minting with admin-only access control.

**Capabilities:**
- `AdminCap` - Permission to mint grants

**Structs:**
- `Grant` - Individual scholarship grant object

**Functions:**
```move
public entry fun mint_grant(
    _: &AdminCap,
    student: address,
    amount: u64,
    ctx: &mut TxContext
)
```

#### `scholarflow_core.move`
Extended functionality for comprehensive grant management.

## 🔒 Security Model

### Capability-Based Access Control

Only holders of `AdminCap` can mint grants, ensuring authorized distribution.

**Admin Creation:**
```move
fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}
```

## 📦 Data Structures

### Grant
```move
public struct Grant has key {
    id: UID,
    student: address,    // Recipient of the grant
    amount: u64,         // Grant amount
}
```

### AdminCap
```move
public struct AdminCap has key {
    id: UID,
}
```

## 📡 Events

### GrantMinted
Emitted when a new grant is created:

```move
public struct GrantMinted has copy, drop {
    grant_id: ID,
    student: address,
    amount: u64,
}
```

## 🚀 Deployment

### Build the Package

```bash
# Build Move package
iota move build
```

### Publish to Testnet

```bash
# Publish contract
iota client publish --gas-budget 100000000

# Save the package ID and AdminCap ID from output
```

### Transfer AdminCap (if needed)

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module grant \
  --function transfer_admin_cap \
  --args <ADMIN_CAP_ID> <NEW_ADMIN_ADDRESS> \
  --gas-budget 10000000
```

## 🧪 Testing

```bash
# Run Move tests
iota move test
```

## 📊 Usage Example

### 1. Deploy Contract
```bash
iota client publish --gas-budget 100000000
```

### 2. Mint Grant
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module grant \
  --function mint_grant \
  --args <ADMIN_CAP_ID> <STUDENT_ADDRESS> <AMOUNT> \
  --gas-budget 10000000
```

### 3. Query Grants
```typescript
const events = await client.queryEvents({
  query: { MoveEventType: `${PACKAGE_ID}::grant::GrantMinted` },
  limit: 50,
});
```

## 🔗 Integration

### With UI
The ScholarFlow UI connects to this contract:

```typescript
const PACKAGE_ID = 'YOUR_DEPLOYED_PACKAGE_ID';

// Mint grant via UI
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::grant::mint_grant`,
  arguments: [
    tx.object(ADMIN_CAP_ID),
    tx.pure.address(studentAddress),
    tx.pure.u64(amount),
  ],
});
```

## 🎯 Use Cases

- **Universities**: Distribute scholarships to students
- **Foundations**: Manage grant programs transparently
- **DAOs**: Community-funded educational support
- **NGOs**: Track educational funding distribution

## ✨ Key Features

- ✅ **Immutable Records** - All grants recorded on blockchain
- ✅ **Transparent** - Publicly queryable grant history
- ✅ **Secure** - Capability-based access control
- ✅ **Efficient** - Low gas costs on IOTA
- ✅ **Auditable** - Complete event trail

## 📚 Dependencies

```toml
[dependencies]
Iota = { git = "https://github.com/iotaledger/iota.git", subdir = "crates/iota-framework/packages/iota-framework", rev = "testnet" }
```

## 🔄 Upgrade Path

The contract can be upgraded by:
1. Deploying new version
2. Transferring AdminCap to new contract
3. Updating UI to point to new package ID

## 🐛 Troubleshooting

### "AdminCap not found"
- Ensure AdminCap was properly transferred to admin address
- Check ownership: `iota client objects <ADDRESS>`

### "Insufficient gas"
- Increase gas budget: `--gas-budget 100000000`
- Ensure wallet has sufficient IOTA

### "Object does not exist"
- Verify PACKAGE_ID is correct
- Check you're on the right network (testnet vs mainnet)

## 🌟 Status

✅ **Production Ready**
- Core functionality implemented
- Tested on IOTA testnet
- Event emission working
- Access control secure

---

**Part of the IOTA Education Initiative** 🎓
