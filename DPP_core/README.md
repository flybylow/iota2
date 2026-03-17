# DPP Core - Workshop II Implementation

Digital Product Passport system with **Shared Objects**, **Dynamic Fields (Tables)**, and **PTB support**.

**Full startup (CLI → testnet → publish → registry → DPP_UI):** [docs/DPP_STARTUP.md](../docs/DPP_STARTUP.md)  
**This deployment’s IDs:** [DEPLOYED.md](./DEPLOYED.md)

## Architecture

```
dpp_core/
├── Move.toml
├── sources/
│   ├── dpp.move      # DPP object + Capabilities + PTB functions
│   └── registry.move # Shared registry with Table<GTIN, ID>
└── tests/
```

## Key Concepts

### 1. Shared vs Owned Objects

| Type | Who Controls | Use Case |
|------|-------------|----------|
| **Owned** | Single address | DPP objects, Capabilities |
| **Shared** | Everyone can access | Registry (lookup table) |

### 2. Tables (Dynamic Key-Value Store)

```move
Table<String, ID>  // GTIN -> DPP ID
Table<address, vector<ID>>  // Owner -> DPP IDs
```

### 3. PTB Support

The `create_return_id` function returns the DPP ID, enabling atomic transactions:

```bash
iota client ptb \
  --move-call "$PKG::dpp::create_return_id" "$GTIN" "$MATERIAL" "$REWARD" "$RECIPIENT" @"$MFR_CAP" @"0x6" \
  --assign dpp_id \
  --move-call "$PKG::registry::index_dpp" @"$REGISTRY" "$GTIN" dpp_id "$RECIPIENT" @"$ADMIN_CAP" \
  --gas-budget 100000000
```

## Deployment

**Prerequisites:** IOTA CLI installed, testnet configured (`iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe`), and testnet tokens (`iota client faucet`). See [docs/DPP_STARTUP.md](../docs/DPP_STARTUP.md).

### 1. Build

```bash
iota move build
```

### 2. Publish

```bash
iota client publish --gas-budget 100000000
```

Save the output:
```bash
export PKG_ID=0x<package-id>
export ADMIN_CAP_ID=0x<admin-cap-id>
export MFR_CAP_ID=0x<manufacturer-cap-id>
export RECYCLER_CAP_ID=0x<recycler-cap-id>
```

### 3. Create Registry

Run once per deployment. Redirect output to a file so you can copy the Registry ID without pasting box-drawing characters into the shell:

```bash
iota client call \
  --package $PKG_ID \
  --module registry \
  --function create \
  --args $ADMIN_CAP_ID \
  --gas-budget 80000000 2>&1 | tee registry-create.txt
```

From the output (or `registry-create.txt`), copy the **ObjectID** of the created `registry::Registry` and set: `export REGISTRY_ID=0x<registry-id>`

### 4. Create DPP with PTB (Atomic)

```bash
export GTIN="1234567890123"
export MATERIAL="100% Organic Cotton"
export REWARD=1000
export RECIPIENT=$(iota client active-address)

iota client ptb \
  --move-call "$PKG_ID::dpp::create_return_id" "$GTIN" "$MATERIAL" "$REWARD" "$RECIPIENT" @"$MFR_CAP_ID" @"0x6" \
  --assign dpp_id \
  --move-call "$PKG_ID::registry::index_dpp" @"$REGISTRY_ID" "$GTIN" dpp_id "$RECIPIENT" @"$ADMIN_CAP_ID" \
  --gas-budget 100000000
```

## Events

- `DPPCreated` - When a DPP is minted
- `DPPIndexed` - When a DPP is added to registry
- `EndOfLifeMarked` - When consumer marks recycling intent
- `RewardClaimed` - When recycler verifies and unlocks reward

## Module Structure

### dpp.move

- `AdminCap` - Required for registry operations
- `ManufacturerCap` - Required to create DPPs
- `RecyclerCap` - Required to verify recycling
- `DPP` - The product passport object
- `create_return_id()` - PTB-compatible creation function

### registry.move

- `Registry` - Shared object with lookup tables
- `by_gtin: Table<String, ID>` - Lookup by product code
- `by_owner: Table<address, vector<ID>>` - Lookup by owner
- `index_dpp()` - Add DPP to registry
- `get_dpp()` - Lookup DPP by GTIN
