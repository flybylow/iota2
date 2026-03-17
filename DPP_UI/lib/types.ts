/**
 * TypeScript types matching the Move smart contract structures
 * Updated for Workshop II with Registry support
 */

// Status constants matching Move contract
export const DPP_STATUS = {
  ACTIVE: 0,
  END_OF_LIFE: 1,
  RECYCLED: 2,
} as const;

export type DPPStatus = typeof DPP_STATUS[keyof typeof DPP_STATUS];

// Main DPP structure matching Move contract
export interface DPP {
  id: string;                    // Object ID (blockchain object ID)
  gtin: string;                  // Global Trade Item Number
  material: string;              // Material composition
  lockedReward: number;          // Current locked reward amount
  originalReward: number;        // Original reward amount (for display after unlock)
  consumer: string | null;       // Consumer wallet address
  status: DPPStatus;             // 0=Active, 1=EndOfLife, 2=Recycled
  createdAt: number;             // Unix timestamp when DPP was created
  endOfLifeAt: number | null;    // Unix timestamp when marked end of life
  manufacturer: string;          // Manufacturer address
}

// Registry entry for lookup
export interface RegistryEntry {
  gtin: string;
  dppId: string;
  owner: string;
}

// Event types matching Move contract events
export interface DPPCreatedEvent {
  type: 'DPPCreated';
  dppId: string;
  gtin: string;
  material: string;
  lockedReward: number;
  timestamp: number;
}

export interface DPPIndexedEvent {
  type: 'DPPIndexed';
  gtin: string;
  dppId: string;
  owner: string;
  timestamp: number;
}

export interface EndOfLifeMarkedEvent {
  type: 'EndOfLifeMarked';
  dppId: string;
  consumer: string;
  timestamp: number;
}

export interface RewardClaimedEvent {
  type: 'RewardClaimed';
  dppId: string;
  consumer: string;
  rewardAmount: number;
  timestamp: number;
}

export type DPPEvent = DPPCreatedEvent | DPPIndexedEvent | EndOfLifeMarkedEvent | RewardClaimedEvent;

// Capability types
export interface AdminCap {
  id: string;
  owner: string;
}

export interface ManufacturerCap {
  id: string;
  owner: string;
}

export interface RecyclerCap {
  id: string;
  owner: string;
}

// Transaction result types
export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  dppId?: string;
  error?: string;
}

// PTB result with both DPP ID and registry indexing
export interface PTBResult extends TransactionResult {
  indexed?: boolean;
}
