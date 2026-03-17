# T-Shirt Recycling Escrow - Project Overview

## Project Information

**Hackathon:** MasterZ × IOTA  
**Team:** Ward (UX/Product) + Developer (On-chain)  
**Timeline:** February training → March build → April 1st Berlin finals  
**Goal:** Top 5 → Berlin trip + pitch to IOTA Foundation  
**Built by:** Tabulas - Circular Economy Infrastructure

---

## The Problem

- **€2B+ EU textile waste annually**
- Consumers have no incentive to recycle properly
- Producers can lie about materials (greenwashing)
- No accountability chain from production to end-of-life

---

## The Solution

Lock monetary value into a **Digital Product Passport (DPP)** at production. Value only unlocks when a recycler verifies the material matches the producer's claim.

### Flow Diagram

```
Producer creates t-shirt
    ↓
Locks €2 into DPP smart contract
    ↓
Consumer buys t-shirt (scans QR, sees locked value)
    ↓
Consumer marks "End of Life" (enters wallet address)
    ↓
Consumer brings t-shirt to recycler
    ↓
Recycler inspects material
    ↓
Material MATCHES claim → €2 released to consumer ✓
Material MISMATCHES → Greenwashing flagged on-chain ⚠️
```

---

## Stakeholder Benefits

| Stakeholder | Benefit |
|-------------|---------|
| **Consumer** | Gets €2 back for recycling correctly |
| **Producer** | Can't lie about materials (recycler verifies) |
| **Recycler** | Gets verified material info for sorting |
| **Regulator** | On-chain proof of EPR compliance |

---

## Three-Actor System

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PRODUCER   │ ──▶ │  CONSUMER   │ ──▶ │  RECYCLER   │
│             │     │             │     │             │
│ Lock value  │     │ See value   │     │ Verify      │
│ Create DPP  │     │ Mark EOL    │     │ Unlock      │
│ Get QR      │     │ Enter wallet│     │ Or flag     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Why IOTA?

1. **Feeless transactions** - Can lock €2 into every single t-shirt without gas fees eating the reward
2. **Move smart contracts** - Handle escrow with object-centric programming model
3. **Immutable proof** - On-chain verification of recycling and greenwashing detection
4. **EU compliance ready** - Built for Digital Product Passport regulations

---

*For detailed user flows, see `03-user-flows.md`*  
*For technical implementation, see `04-technical-architecture.md`*
