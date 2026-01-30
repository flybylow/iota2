# 🚀 T-Shirt DPP Deployment Information

**Last Deployed:** January 30, 2026  
**Network:** IOTA Testnet  
**Status:** ✅ LIVE with Timestamp Support

---

## 📦 Contract Information

### Package ID
```
0xc8c1959942bf8e0d5c3abd8849c2a9d96544b5b945dff68d978972f339c42145
```

**Explorer:**  
https://explorer.iota.org/object/0xc8c1959942bf8e0d5c3abd8849c2a9d96544b5b945dff68d978972f339c42145?network=testnet

---

## 🔑 Capability Objects

### ManufacturerCap
```
0xc42d78155ac2dc5f1ede67aa5f5bdb8385bf169d2d01714ea1cba4e28003aeba
```
**Owner:** `0x843df339f2fd699b8f4993188a9357cb093f824d6e9c9677c326e3c7ffb9f9f6`

### RecyclerCap
```
0x8f0ce6cec0a91ec03b640c129db97e2e9f8f7f7b874f46e6caadf2929a776617
```
**Owner:** `0x843df339f2fd699b8f4993188a9357cb093f824d6e9c9677c326e3c7ffb9f9f6`

### UpgradeCap
```
0xdbf1a895b40686a935e43eb5ee4244dc27699ed961ad3d8cea21363517f04c66
```
**Owner:** `0x434977fb6f12dcbd4f2d3a6b778fe9c3b84da4023857a05e356ce954ffb26d03` (Deployer)

---

## ⚙️ Configuration

### Environment Variables (.env.local)

```bash
# IOTA Network
NEXT_PUBLIC_IOTA_NETWORK=testnet
NEXT_PUBLIC_IOTA_RPC_URL=https://api.testnet.iota.cafe

# Contract
NEXT_PUBLIC_PACKAGE_ID=0xc8c1959942bf8e0d5c3abd8849c2a9d96544b5b945dff68d978972f339c42145

# Capabilities
NEXT_PUBLIC_MANUFACTURER_CAP_ID=0xc42d78155ac2dc5f1ede67aa5f5bdb8385bf169d2d01714ea1cba4e28003aeba
NEXT_PUBLIC_RECYCLER_CAP_ID=0x8f0ce6cec0a91ec03b640c129db97e2e9f8f7f7b874f46e6caadf2929a776617
NEXT_PUBLIC_UPGRADE_CAP_ID=0xdbf1a895b40686a935e43eb5ee4244dc27699ed961ad3d8cea21363517f04c66

# Deployer
NEXT_PUBLIC_DEPLOYER_ADDRESS=0x434977fb6f12dcbd4f2d3a6b778fe9c3b84da4023857a05e356ce954ffb26d03
```

---

## ✨ New Features in This Deployment

### 📅 Timestamp Support
- `created_at`: u64 - Unix timestamp when DPP was created
- `end_of_life_at`: Option<u64> - Timestamp when marked for recycling
- Uses IOTA Clock object (0x6)

### Contract Functions Updated
- `create_and_transfer_dpp()` - Now accepts Clock parameter
- `mark_end_of_life()` - Now accepts Clock parameter and records timestamp

### UI Features Enabled
- Real age calculations (years/months/days)
- Accurate lifecycle timeline
- End-of-life date display
- No more demo/random ages

---

## 🔄 Deployment History

| Date | Package ID | Changes |
|------|-----------|---------|
| Jan 30, 2026 | `0xc8c1...2145` | ✅ Timestamp support added |
| Jan 29, 2026 | `0x02a8...97e` | Initial deployment |

---

## 🧪 Testing

### Create a DPP
```bash
iota client call \
  --package 0xc8c1959942bf8e0d5c3abd8849c2a9d96544b5b945dff68d978972f339c42145 \
  --module tshirt_dpp \
  --function create_and_transfer_dpp \
  --args 0xc42d78155ac2dc5f1ede67aa5f5bdb8385bf169d2d01714ea1cba4e28003aeba \
    '"100% Organic Cotton"' 5000000 \
    0x843df339f2fd699b8f4993188a9357cb093f824d6e9c9677c326e3c7ffb9f9f6 \
    0x6 \
  --gas-budget 10000000
```

### Mark End of Life
```bash
iota client call \
  --package 0xc8c1959942bf8e0d5c3abd8849c2a9d96544b5b945dff68d978972f339c42145 \
  --module tshirt_dpp \
  --function mark_end_of_life \
  --args <DPP_OBJECT_ID> 0x6 \
  --gas-budget 10000000
```

---

## 📊 Gas Costs

- **Deploy Contract:** ~20.6M NANOS
- **Transfer Capability:** ~1M NANOS per cap
- **Create DPP:** ~2-3M NANOS
- **Mark EOL:** ~1-2M NANOS
- **Verify & Unlock:** ~1-2M NANOS

---

## 🔗 Useful Links

- **Explorer:** https://explorer.iota.org/?network=testnet
- **Faucet:** https://faucet.testnet.iota.cafe/
- **RPC:** https://api.testnet.iota.cafe
- **GitHub:** https://github.com/flybylow/iota2/tree/iota-integration

---

## 🔒 Security Notes

- ✅ Capabilities owned by wallet: `0x843df3...f9f6`
- ✅ Only capability holders can create/verify DPPs
- ✅ Contract is immutable after deployment
- ✅ UpgradeCap held by deployer for future upgrades

---

## ✅ Status

**All systems operational!**

- 🟢 Contract deployed and verified
- 🟢 Capabilities transferred
- 🟢 UI connected
- 🟢 Timestamps working
- 🟢 Ready for production use

**Transaction Digest:** `EocSHyFCA3nb35h111WhdRPX46LrWbCxh5sJoEDMtzrX`
