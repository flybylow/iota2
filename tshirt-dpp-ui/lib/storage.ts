/**
 * Storage service using localStorage
 * Structured to match future blockchain service architecture
 * Easy to swap with actual blockchain calls later
 */

import { TShirtDPP, DPPEvent, DPP_STATUS, TransactionResult } from './types';

const STORAGE_KEYS = {
  DPPS: 'tshirt_dpp_dpps',
  EVENTS: 'tshirt_dpp_events',
} as const;

/**
 * Generate a pseudo-random ID (mimics blockchain object ID format)
 */
function generateId(): string {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Get all DPPs from storage
 */
export function getAllDPPs(): TShirtDPP[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DPPS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading DPPs from storage:', error);
    return [];
  }
}

/**
 * Get a single DPP by ID
 */
export function getDPPById(id: string): TShirtDPP | null {
  const dpps = getAllDPPs();
  return dpps.find(dpp => dpp.id === id) || null;
}

/**
 * Save DPP to storage
 */
function saveDPP(dpp: TShirtDPP): void {
  const dpps = getAllDPPs();
  const index = dpps.findIndex(d => d.id === dpp.id);
  
  if (index >= 0) {
    dpps[index] = dpp;
  } else {
    dpps.push(dpp);
  }
  
  localStorage.setItem(STORAGE_KEYS.DPPS, JSON.stringify(dpps));
}

/**
 * Add event to event log
 */
function addEvent(event: DPPEvent): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const events: DPPEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving event:', error);
  }
}

/**
 * Get all events (for querying)
 */
export function getAllEvents(): DPPEvent[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading events:', error);
    return [];
  }
}

/**
 * Create a new DPP (mimics blockchain transaction)
 * 
 * Future blockchain equivalent:
 * ```typescript
 * const tx = new Transaction();
 * tx.moveCall({
 *   target: `${PACKAGE_ID}::tshirt_dpp::create_and_transfer_dpp`,
 *   arguments: [manufacturerCap, material, lockedReward, recipient]
 * });
 * await signAndExecute(tx);
 * ```
 */
export async function createDPP(
  material: string,
  lockedReward: number,
  manufacturer: string
): Promise<TransactionResult> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dpp: TShirtDPP = {
      id: generateId(),
      material,
      lockedReward,
      originalReward: lockedReward,
      consumer: null,
      status: DPP_STATUS.ACTIVE,
      createdAt: Date.now(),
      manufacturer,
    };
    
    saveDPP(dpp);
    
    // Emit event
    addEvent({
      type: 'DPPCreated',
      dppId: dpp.id,
      material: dpp.material,
      lockedReward: dpp.lockedReward,
      timestamp: Date.now(),
    });
    
    console.log('✅ DPP Created:', dpp.id);
    return { success: true, transactionId: generateId() };
  } catch (error) {
    console.error('❌ Error creating DPP:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Mark DPP as end of life (mimics blockchain transaction)
 * 
 * Future blockchain equivalent:
 * ```typescript
 * const tx = new Transaction();
 * tx.moveCall({
 *   target: `${PACKAGE_ID}::tshirt_dpp::mark_end_of_life`,
 *   arguments: [dppObject]
 * });
 * await signAndExecute(tx);
 * ```
 */
export async function markEndOfLife(
  dppId: string,
  consumerAddress: string
): Promise<TransactionResult> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dpp = getDPPById(dppId);
    if (!dpp) {
      return { success: false, error: 'DPP not found' };
    }
    
    if (dpp.status !== DPP_STATUS.ACTIVE) {
      return { success: false, error: 'DPP is not active' };
    }
    
    const updatedDPP: TShirtDPP = {
      ...dpp,
      consumer: consumerAddress,
      status: DPP_STATUS.END_OF_LIFE,
    };
    
    saveDPP(updatedDPP);
    
    // Emit event
    addEvent({
      type: 'EndOfLifeMarked',
      dppId: dpp.id,
      consumer: consumerAddress,
      timestamp: Date.now(),
    });
    
    console.log('✅ End of Life Marked:', dppId);
    return { success: true, transactionId: generateId() };
  } catch (error) {
    console.error('❌ Error marking end of life:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Verify and unlock reward (mimics blockchain transaction)
 * 
 * Future blockchain equivalent:
 * ```typescript
 * const tx = new Transaction();
 * tx.moveCall({
 *   target: `${PACKAGE_ID}::tshirt_dpp::verify_and_unlock`,
 *   arguments: [recyclerCap, dppObject]
 * });
 * await signAndExecute(tx);
 * ```
 */
export async function verifyAndUnlock(
  dppId: string,
  recyclerAddress: string
): Promise<TransactionResult> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dpp = getDPPById(dppId);
    if (!dpp) {
      return { success: false, error: 'DPP not found' };
    }
    
    if (dpp.status !== DPP_STATUS.END_OF_LIFE) {
      return { success: false, error: 'DPP is not at end of life' };
    }
    
    if (!dpp.consumer) {
      return { success: false, error: 'No consumer registered' };
    }
    
    const rewardAmount = dpp.lockedReward;
    
    const updatedDPP: TShirtDPP = {
      ...dpp,
      status: DPP_STATUS.RECYCLED,
      lockedReward: 0,
    };
    
    saveDPP(updatedDPP);
    
    // Emit event
    addEvent({
      type: 'RewardClaimed',
      dppId: dpp.id,
      consumer: dpp.consumer,
      rewardAmount,
      timestamp: Date.now(),
    });
    
    console.log('✅ Reward Unlocked:', dppId, '→', dpp.consumer);
    return { success: true, transactionId: generateId() };
  } catch (error) {
    console.error('❌ Error verifying and unlocking:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Clear all data (for testing/demo reset)
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.DPPS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  console.log('🔄 All data cleared');
}
