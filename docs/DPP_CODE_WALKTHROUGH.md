# DPP Code Walkthrough

Step-by-step guide through the DPP (Digital Product Passport) code: UI entry → providers → main app → types → blockchain layer → Move contracts. Open each file as you go.

---

## Step 1 — App entry

**File: `DPP_UI/app/page.tsx`**

The app has one route: the home page renders `<DPPApp />`. That’s the only “page”; everything else lives inside that component.

---

## Step 2 — Layout and providers

**File: `DPP_UI/app/layout.tsx`**

Root layout wraps the app in `<Providers>` and loads fonts + `@iota/dapp-kit` CSS.

**File: `DPP_UI/app/providers.tsx`**

Providers wrap the tree in:

- **QueryClientProvider** (React Query)
- **IotaClientProvider** with `testnet` / `mainnet` / `devnet` URLs
- **WalletProvider** with `autoConnect`

So every page runs with IOTA testnet and wallet available.

---

## Step 3 — Main UI component

**File: `DPP_UI/components/DPPApp.tsx`** (from the top)

- **Wallet:** `useCurrentAccount()`, `useSignAndExecuteTransaction()` from `@iota/dapp-kit`.
- **Tabs:** `activeTab` is one of `manufacturer` | `consumer` | `recycler` | `registry`.
- **Data:** `currentDPP`, `allDPPs` hold the selected DPP and the list; form state (`gtin`, `material`, `lockedReward`, `lookupGtin`, `consumerRewardAddress`, etc.) and loading flags live here.
- **On load:** A `useEffect` calls `loadDPPs()` when `currentAccount` is set. That uses the storage/blockchain layer (next step).

So the UI is one component with tabs; all actions go through this state and the storage module.

---

## Step 4 — Types (what a DPP is in the app)

**File: `DPP_UI/lib/types.ts`**

- **`DPP_STATUS`**: `ACTIVE = 0`, `END_OF_LIFE = 1`, `RECYCLED = 2` (must match the Move contract).
- **`DPP`**: `id`, `gtin`, `material`, `lockedReward`, `originalReward`, `consumer`, `status`, `createdAt`, `endOfLifeAt`, `manufacturer`. This is the shape the UI and storage-blockchain use; it mirrors the Move `DPP` struct plus a few derived fields (e.g. `originalReward`, `manufacturer` from events when possible).

So “what’s a DPP in the frontend” is defined here.

---

## Step 5 — Blockchain layer: config and reads

**File: `DPP_UI/lib/storage-blockchain.ts`** (top half)

- **Env:** `PACKAGE_ID`, `ADMIN_CAP_ID`, `MANUFACTURER_CAP_ID`, `RECYCLER_CAP_ID`, `REGISTRY_ID` from `.env.local`. `requireEnv()` throws a clear error if any are missing or placeholders.
- **`getClient()`**: returns an IOTA client for testnet (used for all RPC calls).
- **`getDPPsByOwner(ownerAddress)`**:
  - `getOwnedObjects({ owner })` with `showContent` and `showType`.
  - Filter objects where `type === PACKAGE_ID::dpp::DPP`.
  - Parse each object’s `fields` into the `DPP` type (id, gtin, material, locked_reward, consumer, status, etc.).
  - Optionally use `queryEvents` for `DPPCreated` to fill `originalReward` and `manufacturer`; if the RPC rejects the query, it falls back to on-chain data only.
- **`getDPPByGTIN(gtin)`**: Uses `queryEvents` for `DPPIndexed` to find `dpp_id` for that GTIN, then calls **`getDPPById(dppId)`** to fetch the DPP object and return it. (So “Registry lookup by GTIN” in the UI is implemented here via events + getObject.)
- **`getDPPById(id)`**: `getObject({ id })` and map the Move object fields to the same `DPP` interface.

So: “load my DPPs”, “lookup by GTIN”, and “get one DPP by ID” all go through this file and hit the chain (and events when available).

---

## Step 6 — Blockchain layer: writes (create DPP)

Still in **`DPP_UI/lib/storage-blockchain.ts`**, find **`createDPPWithPTB`** and **`createDPP`**.

- **`createDPPWithPTB`**:
  - Builds one **Transaction** with two Move calls:
    1. **`dpp::create_return_id`** with ManufacturerCap, gtin, material, locked_reward, recipient, Clock → returns the new DPP’s ID.
    2. **`registry::index_dpp`** with Registry object, gtin, that DPP ID, owner, AdminCap.
  - Sends the transaction via **`signAndExecute`** (from dapp-kit). On success, it reads the created DPP ID from events or object changes and returns it. So “Create DPP” in the Manufacturer tab uses this when PTB mode is on.
- **`createDPP`** (simple path): One Move call to **`dpp::create_and_transfer_dpp`** (same args but no return value, no registry). Used when PTB is off.

So the “beginning” of a DPP on-chain is either one PTB (create + index) or one create-only call, both implemented here.

---

## Step 7 — Blockchain layer: mark EOL and verify

Still in **`storage-blockchain.ts`**, find **`markEndOfLife`** and **`verifyAndUnlock`**.

- **`markEndOfLife(dppId, signAndExecute)`**: Builds a transaction that calls **`dpp::mark_end_of_life`** with the DPP object and Clock. The signer is the consumer; the contract will store that as `consumer` and set status to END_OF_LIFE.
- **`verifyAndUnlock(dppId, signAndExecute)`**: Builds a transaction that calls **`dpp::verify_and_unlock_entry`** with RecyclerCap and the DPP object. Only the recycler (cap holder) can call this; the contract sets status to RECYCLED and clears the locked reward.

So consumer and recycler actions in the UI map 1:1 to these two functions.

---

## Step 8 — Contract package

**File: `DPP_core/Move.toml`**

- Package name is **`dpp_core`**; `[addresses]` has `dpp_core = "0x0"` (replaced at publish time). The UI uses the published package ID from `.env.local` as `PACKAGE_ID` in every Move call.

So “DPP core” is this Move package; the UI talks to whatever package ID you deployed.

---

## Step 9 — DPP module: caps and DPP struct

**File: `DPP_core/sources/dpp.move`** (from the top)

- **`init`**: Runs once on publish. Creates **AdminCap**, **ManufacturerCap**, and **RecyclerCap** and transfers them to the publisher. No DPPs exist yet.
- **Structs:**
  - **AdminCap** / **ManufacturerCap** / **RecyclerCap**: capability objects; the UI passes their object IDs from env.
  - **DPP**: `id`, `gtin`, `material`, `locked_reward`, `consumer` (Option<address>), `status`, `created_at`, `end_of_life_at`. Status is 0/1/2 (ACTIVE / END_OF_LIFE / RECYCLED).

So the on-chain “DPP” and the three roles are defined here.

---

## Step 10 — DPP module: create

In **`DPP_core/sources/dpp.move`**, find **`create_and_transfer_dpp`** and **`create_return_id`**.

- Both require **ManufacturerCap** and take gtin, material, locked_reward, recipient, Clock.
- They create a **DPP** with `consumer: none`, `status: STATUS_ACTIVE`, `created_at: clock::timestamp_ms(clock)`, then **transfer** it to `recipient` and emit **DPPCreated**.
- **`create_return_id`** also **returns** `object::id(&dpp)` so a PTB can use it in the next call (registry indexing). The UI uses this in the PTB flow.

So “Manufacturer creates a DPP” is these entry functions; the PTB in the UI calls `create_return_id` then passes the ID to the registry.

---

## Step 11 — DPP module: consumer and recycler

In **`DPP_core/sources/dpp.move`**, find **`mark_end_of_life`** and **`verify_and_unlock`** / **`verify_and_unlock_entry`**.

- **`mark_end_of_life(dpp, clock, ctx)`**: Requires `dpp.status == ACTIVE`. Sets `dpp.consumer = option::some(tx_context::sender(ctx))`, `dpp.status = STATUS_END_OF_LIFE`, `dpp.end_of_life_at = some(clock::timestamp_ms(clock))`, and emits **EndOfLifeMarked**. So the **signer** is the consumer stored on the DPP (and the address the recycler pays).
- **`verify_and_unlock`**: Takes **RecyclerCap** and the DPP. Requires status END_OF_LIFE and `consumer` set. Sets status to RECYCLED, `locked_reward` to 0, emits **RewardClaimed** with consumer and amount, and returns `(consumer_address, reward_amount)`. **`verify_and_unlock_entry`** is the entry that just calls this (no return value to the chain).

So: consumer = signer of mark_end_of_life; recycler = cap holder who can call verify_and_unlock. The UI’s `markEndOfLife` and `verifyAndUnlock` call these.

---

## Step 12 — Registry module

**File: `DPP_core/sources/registry.move`**

- **Registry** is a shared object with two **Table**s: **`by_gtin`** (String → DPP ID) and **`by_owner`** (address → vector of DPP IDs).
- **`create(AdminCap)`**: One-time setup; creates the Registry and **share_object**s it so anyone can read it.
- **`index_dpp(reg, gtin, dpp_id, owner, AdminCap)`**: Puts `gtin → dpp_id` in `by_gtin`, appends `dpp_id` to `by_owner[owner]`, and emits **DPPIndexed**. The UI’s PTB calls this right after `create_return_id` with the new DPP ID.
- **`get_dpp(reg, gtin)`**: Returns the DPP ID for a GTIN (for on-chain use). The UI doesn’t call this directly; it uses **queryEvents(DPPIndexed)** to resolve GTIN → dpp_id because some RPCs don’t support dynamic field queries the same way.

So the “registry” is this shared object; the UI’s “Registry” tab and GTIN lookup use events emitted when indexing.

---

## Step 13 — How it ties together in the UI

Back in **`DPP_UI/components/DPPApp.tsx`**:

- **Manufacturer tab**: Form (gtin, material, lockedReward) → **handleCreateDPP** → either **createDPPWithPTB** or **createDPP** → then **loadDPPs** to refresh the list.
- **Registry tab**: **lookupGtin** → **handleLookupGTIN** → **getDPPByGTIN** → sets **currentDPP** and switches to Consumer tab.
- **Consumer tab**: User picks/views **currentDPP**, can set **consumerRewardAddress** (for display; on-chain consumer is still the signer of mark EOL). **Mark End of Life** → **markEndOfLife(currentDPP.id)**.
- **Recycler tab**: Same **currentDPP** (e.g. selected in Consumer). Shows “Pay customer” as **currentDPP.consumer**. **Verify & Unlock** → **verifyAndUnlock(currentDPP.id)**.

So: one component, one chain layer, one Move package. Flow is: **page → layout → providers → DPPApp (tabs) → storage-blockchain (reads/writes) → dpp.move + registry.move**.
