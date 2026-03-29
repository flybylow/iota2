# DPP_core – This Deployment (testnet)

**Publish tx:** `FtthPitvPkDJbSZascXho9mimppzw8thyyj7DG2fKjtc`  
**Registry create tx:** `6SDht9wqeiDBXTDi7nV53KGehk9RHZi2JUAnT8mkuNSV`

**Full startup guide:** [docs/DPP_STARTUP.md](../docs/DPP_STARTUP.md)

---

## IDs for this deployment

```bash
export PKG_ID=0x6bfbf2a77434fd2244637b93dec5f67e3e83a929243843f7d72cfae7e973a186
export ADMIN_CAP_ID=0x13dcd429200f094ff2cb01441cb0d9ebfbbc3ee5f7c2877a31d18665eafd7171
export MFR_CAP_ID=0x41de08a42d3ce2f46eae3c33ed25320eca953fbeaad92d442cfc2b037a2d7291
export RECYCLER_CAP_ID=0x5928ec43a4c49f91a4c4702f3dcc91584c93c17c381b1d47a247a6704a211e69
export REGISTRY_ID=0x34b9cfdc0716eab54250c2b4f4fe093c7ef5f9cdd9afdec0f4ec616107ac3d5d
```

---

## DPP_UI `.env.local` (copy-paste for this deployment)

```
NEXT_PUBLIC_PACKAGE_ID=0x6bfbf2a77434fd2244637b93dec5f67e3e83a929243843f7d72cfae7e973a186
NEXT_PUBLIC_ADMIN_CAP_ID=0x13dcd429200f094ff2cb01441cb0d9ebfbbc3ee5f7c2877a31d18665eafd7171
NEXT_PUBLIC_MANUFACTURER_CAP_ID=0x41de08a42d3ce2f46eae3c33ed25320eca953fbeaad92d442cfc2b037a2d7291
NEXT_PUBLIC_RECYCLER_CAP_ID=0x5928ec43a4c49f91a4c4702f3dcc91584c93c17c381b1d47a247a6704a211e69
NEXT_PUBLIC_REGISTRY_ID=0x34b9cfdc0716eab54250c2b4f4fe093c7ef5f9cdd9afdec0f4ec616107ac3d5d
NEXT_PUBLIC_DPP_LEGACY_CREATE=1
```

Then: `cd DPP_UI && npm install && npm run dev` → http://localhost:3000

---

## Transferring caps to another wallet (e.g. browser wallet)

If you deploy with the CLI wallet but use a different wallet in DPP_UI, transfer the caps to that wallet (run with the **current owner** wallet in the CLI):

```bash
cd DPP_core
export PKG_ID=0x6bfbf2a77434fd2244637b93dec5f67e3e83a929243843f7d72cfae7e973a186
export ADMIN_CAP_ID=0x13dcd429200f094ff2cb01441cb0d9ebfbbc3ee5f7c2877a31d18665eafd7171
export MFR_CAP_ID=0x41de08a42d3ce2f46eae3c33ed25320eca953fbeaad92d442cfc2b037a2d7291
export RECYCLER_CAP_ID=0x5928ec43a4c49f91a4c4702f3dcc91584c93c17c381b1d47a247a6704a211e69
NEW_OWNER=0x843df339f2fd699b8f4993188a9357cb093f824d6e9c9677c326e3c7ffb9f9f6

iota client call --package $PKG_ID --module dpp --function transfer_admin_cap --args $ADMIN_CAP_ID $NEW_OWNER --gas-budget 10000000
iota client call --package $PKG_ID --module dpp --function transfer_manufacturer_cap --args $MFR_CAP_ID $NEW_OWNER --gas-budget 10000000
iota client call --package $PKG_ID --module dpp --function transfer_recycler_cap --args $RECYCLER_CAP_ID $NEW_OWNER --gas-budget 10000000
```

Replace `NEW_OWNER` with the address of the wallet you use in DPP_UI.

---

## Creating the registry (for a fresh deploy)

When deploying from scratch, after publish run (save output with `tee` so you can copy the Registry ObjectID cleanly):

```bash
iota client call \
  --package $PKG_ID \
  --module registry \
  --function create \
  --args $ADMIN_CAP_ID \
  --gas-budget 80000000 2>&1 | tee registry-create.txt
```

From the output, copy the **ObjectID** of the created `registry::Registry` and set `REGISTRY_ID`.
