# Technical Architecture

## System Overview

```
Frontend (React)
    ↕
IOTA Wallet Adapter
    ↕
IOTA Blockchain
    ↕
Move Smart Contract
```

---

## Data Structure

### DPP Object (TypeScript Interface)

```typescript
interface TShirtDPP {
  // Identity
  id: string;                     // Unique DPP ID (e.g., "DPP-X7K9M2")
  
  // Producer sets at creation
  material: string;               // Material composition
  producer: string;               // Producer name or DID
  lockedValue: number;            // Amount in EUR (e.g., 2.00)
  createdAt: string;              // ISO timestamp
  
  // Consumer sets at end-of-life
  consumerWallet: string | null;  // IOTA address to receive funds
  endOfLifeAt: string | null;     // ISO timestamp when marked EOL
  
  // Recycler sets at verification
  recycled: boolean;              // Has recycling been verified?
  materialVerified: boolean;      // Did material match claim?
  actualMaterial: string | null;  // What recycler actually found
  recycledAt: string | null;      // ISO timestamp of verification
  recyclerId: string | null;      // Recycler's identifier/DID
  
  // Derived status
  status: 'active' | 'pending' | 'recycled' | 'flagged';
  valueClaimed: boolean;
}
```

### Status States

| Status | Meaning |
|--------|---------|
| `active` | DPP created, t-shirt in use |
| `pending` | Consumer marked EOL, awaiting recycler |
| `recycled` | Recycler verified, value unlocked |
| `flagged` | Material mismatch detected (greenwashing) |

### Material Options (MVP)

```typescript
const MATERIALS = [
  '100% Organic Cotton',
  '100% Cotton',
  'Cotton/Polyester Blend',
  '100% Polyester',
  '100% Linen',
  '100% Wool',
];
```

---

## Smart Contract (Move)

### Language: Move

IOTA uses **Move** programming language (from Sui/Aptos lineage). Key differences from Solidity:
- **Object-centric** (not account-centric)
- Objects have unique IDs and can be transferred
- Strict type safety with abilities system

### Contract Structure

```move
module tabulas::tshirt_escrow {
    use iota::object::{Self, UID};
    use iota::transfer;
    use iota::tx_context::{Self, TxContext};
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    
    /// The DPP object - holds escrow value
    struct TShirtDPP has key, store {
        id: UID,
        material: vector<u8>,          // Material claim
        producer: address,             // Producer's address
        locked_value: Coin<IOTA>,      // Escrowed tokens
        consumer: Option<address>,     // Consumer's wallet (set at EOL)
        status: u8,                    // 0=active, 1=pending, 2=recycled, 3=flagged
    }
    
    /// Producer creates DPP and locks value
    public entry fun create_dpp(
        material: vector<u8>,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let dpp = TShirtDPP {
            id: object::new(ctx),
            material,
            producer: tx_context::sender(ctx),
            locked_value: payment,
            consumer: option::none(),
            status: 0, // active
        };
        transfer::share_object(dpp);
    }
    
    /// Consumer marks end-of-life
    public entry fun mark_end_of_life(
        dpp: &mut TShirtDPP,
        ctx: &mut TxContext
    ) {
        assert!(dpp.status == 0, 1); // Must be active
        dpp.consumer = option::some(tx_context::sender(ctx));
        dpp.status = 1; // pending
    }
    
    /// Recycler verifies and unlocks (material matches)
    public entry fun verify_and_unlock(
        dpp: &mut TShirtDPP,
        ctx: &mut TxContext
    ) {
        assert!(dpp.status == 1, 2); // Must be pending
        assert!(option::is_some(&dpp.consumer), 3); // Consumer must exist
        
        let consumer_addr = option::extract(&mut dpp.consumer);
        let value = coin::split(&mut dpp.locked_value, coin::value(&dpp.locked_value), ctx);
        
        transfer::public_transfer(value, consumer_addr);
        dpp.status = 2; // recycled
    }
    
    /// Recycler flags mismatch (greenwashing)
    public entry fun flag_mismatch(
        dpp: &mut TShirtDPP,
        _actual_material: vector<u8>,
        _ctx: &mut TxContext
    ) {
        assert!(dpp.status == 1, 4); // Must be pending
        dpp.status = 3; // flagged
        // Value stays locked (could go to penalty pool)
    }
}
```

### Key Design Decisions

1. **Shared Object**: DPP is a shared object (not owned) so multiple parties can interact
2. **Escrow**: IOTA tokens locked inside the DPP object itself
3. **Status Machine**: Simple u8 status prevents invalid state transitions
4. **No Recycler Verification**: MVP trusts any recycler (future: recycler registry)

---

## Move Language Quick Reference

### Object Abilities

```move
has key    // Can be stored as top-level object
has store  // Can be stored inside other objects
has copy   // Can be copied
has drop   // Can be dropped (destroyed)
```

### Common Operations

```move
// Object transfer
transfer::transfer(obj, recipient);           // Send to address
transfer::share_object(obj);                  // Make shared (anyone can use)
transfer::public_transfer(coin, recipient);   // Transfer coins

// Assertions
assert!(condition, error_code);

// Option type
option::none<T>()
option::some(value)
option::is_some(&opt)
option::extract(&mut opt)
```

---

## QR Code Integration

### QR Content

```
https://tabulas.eu/dpp/{DPP_ID}
```

Example: `https://tabulas.eu/dpp/DPP-X7K9M2`

### Generation (React)

```bash
npm install qrcode.react
```

```tsx
import QRCode from 'qrcode.react';

<QRCode 
  value={`https://tabulas.eu/dpp/${dpp.id}`}
  size={220}
  level="H"
  includeMargin={true}
/>
```

### Scanning (React)

```bash
npm install @yudiel/react-qr-scanner
```

```tsx
import { Scanner } from '@yudiel/react-qr-scanner';

<Scanner
  onScan={(result) => loadDPP(result[0].rawValue)}
  constraints={{ facingMode: 'environment' }}
/>
```

---

## IOTA Resources

### Documentation Links

| Resource | URL |
|----------|-----|
| IOTA Docs | https://docs.iota.org/ |
| Move Language | https://docs.iota.org/developer/iota-move-ctf/ |
| Wallet Adapter | https://docs.iota.org/developer/iota-identity/ |
| Explorer | https://explorer.iota.org/ |

### Testnet Information

- **Network:** IOTA Testnet
- **Faucet:** https://faucet.testnet.iota.org/
- **Explorer:** https://explorer.testnet.iota.org/

### Relevant Examples

- **Notarization Workshop**: https://docs.iota.org/developer/workshops/iota-notarization-truedoc
- **DPP Demo (Battery)**: https://dpp.demo.iota.org/

---

*For React component implementation, see `05-react-component.md`*  
*For deployment guide, see `06-deployment-guide.md`*
