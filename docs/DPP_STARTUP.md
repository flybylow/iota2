# DPP System – How to Start Everything

This is the **canonical startup guide** for the Digital Product Passport (DPP) system: IOTA CLI → testnet → DPP_core deploy → DPP_UI.

---

## Prerequisites

- **Rust/Cargo** (for installing IOTA CLI): [rustup](https://rustup.rs)
- **Node.js 18+** (for DPP_UI)

---

## 1. Install IOTA CLI

From the project docs we use one of:

```bash
# Option A: from source (no branch = default)
cargo install --git https://github.com/iotaledger/iota.git iota

# Option B: install script (if available)
# curl -fsSL https://install.iota.io | sh
```

Verify:

```bash
iota --version
# e.g. iota 1.15.0-rc-b1dc09345ed8
```

---

## 2. Configure testnet

Use the **current testnet RPC** (`.cafe`, not `.org`):

```bash
iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe
iota client switch --env testnet
```

Get testnet tokens for gas:

```bash
iota client faucet
# Or: https://faucet.testnet.iota.cafe
```

---

## 3. Deploy DPP_core

From the repo root:

```bash
cd DPP_core
iota move build
iota client publish --gas-budget 100000000
```

From the output, save the **Package ID** and the **AdminCap**, **ManufacturerCap**, **RecyclerCap** object IDs. Example (yours will differ):

```bash
export PKG_ID=0x6bfbf2a77434fd2244637b93dec5f67e3e83a929243843f7d72cfae7e973a186
export ADMIN_CAP_ID=0x13dcd429200f094ff2cb01441cb0d9ebfbbc3ee5f7c2877a31d18665eafd7171
export MFR_CAP_ID=0x41de08a42d3ce2f46eae3c33ed25320eca953fbeaad92d442cfc2b037a2d7291
export RECYCLER_CAP_ID=0x5928ec43a4c49f91a4c4702f3dcc91584c93c17c381b1d47a247a6704a211e69
```

---

## 4. Create the Registry

Run once per deployment. **Tip:** redirect output to a file so you can copy the Registry ID without pasting box-drawing characters into the shell:

```bash
iota client call \
  --package $PKG_ID \
  --module registry \
  --function create \
  --args $ADMIN_CAP_ID \
  --gas-budget 80000000 2>&1 | tee registry-create.txt
```

From the output (or `registry-create.txt`), find **Created Objects** → the line with `ObjectType: ...::registry::Registry` and copy the **ObjectID**. Example:

```bash
export REGISTRY_ID=0x34b9cfdc0716eab54250c2b4f4fe093c7ef5f9cdd9afdec0f4ec616107ac3d5d
```

---

## 5. Configure and run DPP_UI

From the repo root:

```bash
cd DPP_UI
cp .env.local.example .env.local
```

Edit `.env.local` and set (use your deployed IDs, or the current deployment’s):

```
NEXT_PUBLIC_PACKAGE_ID=<PKG_ID>
NEXT_PUBLIC_ADMIN_CAP_ID=<ADMIN_CAP_ID>
NEXT_PUBLIC_MANUFACTURER_CAP_ID=<MFR_CAP_ID>
NEXT_PUBLIC_RECYCLER_CAP_ID=<RECYCLER_CAP_ID>
NEXT_PUBLIC_REGISTRY_ID=<REGISTRY_ID>
```

Install and run:

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. Connect your IOTA wallet (testnet) and use the Manufacturer / Registry / Consumer / Recycler tabs.

---

## Summary checklist

| Step | Command / action |
|------|------------------|
| 1 | `cargo install --git https://github.com/iotaledger/iota.git iota` |
| 2 | `iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe` → `switch` → `faucet` |
| 3 | `cd DPP_core` → `iota move build` → `iota client publish --gas-budget 100000000` → save IDs |
| 4 | `iota client call ... registry create ... 2>&1 \| tee registry-create.txt` → save REGISTRY_ID |
| 5 | `cd DPP_UI` → copy `.env.local.example` to `.env.local` → fill IDs → `npm install` → `npm run dev` |

---

## Already deployed?

If DPP_core and the Registry are already deployed (see `DPP_core/DEPLOYED.md` for this repo’s current IDs), you only need to:

1. Use testnet: `iota client switch --env testnet`
2. In **DPP_UI**: ensure `.env.local` has the same Package, Caps, and Registry IDs
3. Run: `cd DPP_UI && npm run dev`

---

## References

- **This deployment’s IDs:** [DPP_core/DEPLOYED.md](../DPP_core/DEPLOYED.md)
- **DPP_core contract/API:** [DPP_core/README.md](../DPP_core/README.md)
- **DPP_UI setup:** [DPP_UI/README.md](../DPP_UI/README.md)
- **Testnet explorer:** https://explorer.testnet.iota.org (or current testnet explorer from IOTA docs)
