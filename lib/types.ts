/**
 * TypeScript types matching the Move smart contract structures
 * Ready for blockchain integration
 */

// Status constants matching Move contract
export const DPP_STATUS = {
  ACTIVE: 0,
  END_OF_LIFE: 1,
  RECYCLED: 2,
} as const;

export type DPPStatus = typeof DPP_STATUS[keyof typeof DPP_STATUS];

// Main DPP structure matching Move contract
export interface TShirtDPP {
  id: string;                    // Object ID (will be blockchain object ID)
  material: string;              // Material composition
  lockedReward: number;          // Current locked reward amount
  originalReward: number;        // Original reward amount (for display after unlock)
  consumer: string | null;       // Consumer wallet address
  status: DPPStatus;             // 0=Active, 1=EndOfLife, 2=Recycled
  createdAt: number;             // Unix timestamp
  manufacturer: string;          // Manufacturer address
}

// Event types matching Move contract events
export interface DPPCreatedEvent {
  type: 'DPPCreated';
  dppId: string;
  material: string;
  lockedReward: number;
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

export type DPPEvent = DPPCreatedEvent | EndOfLifeMarkedEvent | RewardClaimedEvent;

// Capability types (for future blockchain integration)
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
  error?: string;
}
