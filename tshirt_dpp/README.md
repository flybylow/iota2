# T-Shirt DPP Move Smart Contract

Digital Product Passport (DPP) system for tracking t-shirts through their lifecycle with recycling incentives.

## Overview

This Move smart contract implements a circular economy system where:
1. **Manufacturers** create DPPs with locked recycling rewards
2. **Consumers** own products and mark them for recycling
3. **Recyclers** verify materials and unlock rewards

## Contract Structure

### Capabilities
- `ManufacturerCap` - Permission to create DPPs
- `RecyclerCap` - Permission to verify and unlock rewards

### Main Objects
```move
public struct TShirtDPP has key {
    id: UID,
    material: String,           // Material composition
    locked_reward: u64,         // Reward amount (locked)
    consumer: Option<address>,  // Consumer wallet
    status: u8,                 // 0=Active, 1=EndOfLife, 2=Recycled
}
```

### Status Flow
```
0: ACTIVE → 1: END_OF_LIFE → 2: RECYCLED
   ↓             ↓                ↓
Created    Consumer marks    Recycler verifies
```

### Events
- `DPPCreated` - When manufacturer creates a DPP
- `EndOfLifeMarked` - When consumer marks end of life
- `RewardClaimed` - When recycler unlocks reward

## Functions

### Manufacturer Functions
```move
// Create DPP and transfer to recipient
public entry fun create_and_transfer_dpp(
    cap: &ManufacturerCap,
    material: String,
    locked_reward: u64,
    recipient: address,
    ctx: &mut TxContext,
)
```

### Consumer Functions
```move
// Mark product as ready for recycling
public entry fun mark_end_of_life(
    dpp: &mut TShirtDPP,
    ctx: &mut TxContext,
)
```

### Recycler Functions
```move
// Verify recycling and unlock reward
public fun verify_and_unlock(
    _: &RecyclerCap,
    dpp: &mut TShirtDPP,
) -> (address, u64)  // Returns (consumer_address, reward_amount)
```

## Building

```bash
# Build the contract
iota move build

# Run tests
iota move test
```

## Deployment

```bash
# Deploy to testnet
iota client publish --gas-budget 100000000

# Save the Package ID from the output
```

## Testing Locally

```bash
# Run unit tests
iota move test

# Run with verbose output
iota move test -v
```

## UI Integration

This contract is designed to work with the `tshirt-dpp-ui` React application:
- UI repository: `../tshirt-dpp-ui`
- TypeScript types match this contract structure
- See `tshirt-dpp-ui/lib/types.ts` for type definitions

## Git Branches

- `main` - Active development
- `contract-v1` - Stable version (v1.0-contract tag)

## Architecture Diagram

```
┌──────────────┐
│ Manufacturer │
│    (Cap)     │
└──────┬───────┘
       │ create_and_transfer_dpp()
       ↓
┌──────────────┐
│   TShirtDPP  │
│ status=ACTIVE│
└──────┬───────┘
       │ Consumer owns
       │ mark_end_of_life()
       ↓
┌──────────────┐
│   TShirtDPP  │
│ status=EOL   │
└──────┬───────┘
       │ Recycler processes
       │ verify_and_unlock()
       ↓
┌──────────────┐
│   TShirtDPP  │
│status=RECYCLED│
│ reward → consumer
└──────────────┘
```

## Security Features

- ✅ Capability-based access control
- ✅ Status validation (can't skip states)
- ✅ Consumer address verification
- ✅ Event emission for transparency

## Future Enhancements

- [ ] Material verification oracle integration
- [ ] Multi-material composition tracking
- [ ] Reputation system for manufacturers
- [ ] Carbon credit calculation
- [ ] Recycling facility registry

## License

MIT

## Contact

Built for MasterZ × IOTA Hackathon by Tabulas (Ward)
