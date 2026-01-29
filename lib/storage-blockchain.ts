/**
 * Blockchain storage service using IOTA
 * Replaces localStorage with real blockchain transactions
 */

import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { TShirtDPP, DPPEvent, DPP_STATUS, TransactionResult } from './types';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
const MANUFACTURER_CAP_ID = process.env.NEXT_PUBLIC_MANUFACTURER_CAP_ID!;
const RECYCLER_CAP_ID = process.env.NEXT_PUBLIC_RECYCLER_CAP_ID!;

/**
 * Get IOTA client for testnet
 */
function getClient(): IotaClient {
  return new IotaClient({ url: getFullnodeUrl('testnet') });
}

/**
 * Get all DPP objects owned by an address
 */
export async function getDPPsByOwner(ownerAddress: string): Promise<TShirtDPP[]> {
  try {
    const client = getClient();
    
    // Query all objects owned by the address
    const objects = await client.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${PACKAGE_ID}::tshirt_dpp::TShirtDPP`,
      },
      options: {
        showContent: true,
      },
    });
    
    // Query all DPPCreated events to get original reward amounts and manufacturer
    const createdEvents = await client.queryEvents({
      query: { MoveEventType: `${PACKAGE_ID}::tshirt_dpp::DPPCreated` },
      limit: 50,
    });
    
    // Create maps for DPP ID to original reward and manufacturer
    const originalRewards = new Map<string, number>();
    const manufacturers = new Map<string, string>();
    for (const event of createdEvents.data) {
      const data = event.parsedJson as any;
      originalRewards.set(data.dpp_id, Number(data.locked_reward));
      // Get the sender of the transaction that created this DPP
      manufacturers.set(data.dpp_id, event.sender);
    }
    
    const dpps: TShirtDPP[] = [];
    
    for (const obj of objects.data) {
      if (obj.data?.content && obj.data.content.dataType === 'moveObject') {
        const fields = obj.data.content.fields as any;
        const dppId = fields.id.id;
        const currentReward = Number(fields.locked_reward);
        
        // Use original reward from event, or fall back to current reward
        const originalReward = originalRewards.get(dppId) || currentReward;
        
        // Get manufacturer address from event, or use placeholder
        const manufacturerAddress = manufacturers.get(dppId) || 'Unknown';
        
        // Note: created_at and end_of_life_at don't exist in deployed contract yet
        // Using fallback values for now
        dpps.push({
          id: dppId,
          material: fields.material,
          lockedReward: currentReward,
          originalReward: originalReward,
          consumer: fields.consumer || null,
          status: Number(fields.status),
          createdAt: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000), // Random age for demo
          endOfLifeAt: fields.status === 1 || fields.status === 2 ? Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          manufacturer: manufacturerAddress,
        });
      }
    }
    
    console.log('📊 Found', dpps.length, 'DPPs owned by', ownerAddress.slice(0, 8) + '...');
    return dpps;
  } catch (error) {
    console.error('Error querying DPPs by owner:', error);
    return [];
  }
}

/**
 * Query all DPP objects from the blockchain (legacy)
 */
export async function getAllDPPs(): Promise<TShirtDPP[]> {
  // This is deprecated - use getDPPsByOwner instead
  return [];
}

/**
 * Get a single DPP by ID (query blockchain object)
 */
export async function getDPPById(id: string): Promise<TShirtDPP | null> {
  try {
    const client = getClient();
    const object = await client.getObject({
      id,
      options: { showContent: true },
    });
    
    if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
      return null;
    }
    
    const fields = object.data.content.fields as any;
    
    return {
      id: fields.id.id,
      material: fields.material,
      lockedReward: Number(fields.locked_reward),
      originalReward: Number(fields.locked_reward), // Store original
      consumer: fields.consumer ? fields.consumer : null,
      status: Number(fields.status),
      createdAt: Date.now(), // Would need to query from events
      manufacturer: 'Blockchain', // Would need to query from events
    };
  } catch (error) {
    console.error('Error getting DPP:', error);
    return null;
  }
}

/**
 * Get all events from blockchain
 */
export async function getAllEvents(): Promise<DPPEvent[]> {
  try {
    const client = getClient();
    
    const [created, endOfLife, claimed] = await Promise.all([
      client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::tshirt_dpp::DPPCreated` },
        limit: 50,
      }),
      client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::tshirt_dpp::EndOfLifeMarked` },
        limit: 50,
      }),
      client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::tshirt_dpp::RewardClaimed` },
        limit: 50,
      }),
    ]);
    
    const events: DPPEvent[] = [
      ...created.data.map((e: any) => ({
        type: 'DPPCreated' as const,
        dppId: e.parsedJson.dpp_id,
        material: e.parsedJson.material,
        lockedReward: Number(e.parsedJson.locked_reward),
        timestamp: Number(e.timestampMs),
      })),
      ...endOfLife.data.map((e: any) => ({
        type: 'EndOfLifeMarked' as const,
        dppId: e.parsedJson.dpp_id,
        consumer: e.parsedJson.consumer,
        timestamp: Number(e.timestampMs),
      })),
      ...claimed.data.map((e: any) => ({
        type: 'RewardClaimed' as const,
        dppId: e.parsedJson.dpp_id,
        consumer: e.parsedJson.consumer,
        rewardAmount: Number(e.parsedJson.reward_amount),
        timestamp: Number(e.timestampMs),
      })),
    ];
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

/**
 * Create a new DPP (blockchain transaction)
 */
export async function createDPP(
  material: string,
  lockedReward: number,
  recipientAddress: string,
  signAndExecute: any
): Promise<TransactionResult & { dppId?: string }> {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::tshirt_dpp::create_and_transfer_dpp`,
      arguments: [
        tx.object(MANUFACTURER_CAP_ID),
        tx.pure.string(material),
        tx.pure.u64(lockedReward),
        tx.pure.address(recipientAddress),
        // Note: Clock parameter removed - deployed contract doesn't support it yet
      ],
    });
    
    return new Promise((resolve) => {
      signAndExecute(
        { 
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          }
        },
        {
          onSuccess: (result: any) => {
            console.log('✅ DPP Created on blockchain:', result.digest);
            console.log('📋 Full transaction result:', JSON.stringify(result, null, 2));
            
            // Extract the DPP object ID from created objects
            let dppId: string | undefined;
            
            // Check objectChanges first (most reliable)
            if (result.objectChanges) {
              console.log('🔍 Checking objectChanges...');
              for (const change of result.objectChanges) {
                console.log('  Change:', change.type, change.objectType);
                if (change.type === 'created' && change.objectType?.includes('TShirtDPP')) {
                  dppId = change.objectId;
                  console.log('  ✅ Found TShirtDPP:', dppId);
                  break;
                }
              }
            }
            
            // Fallback: check effects.created
            if (!dppId && result.effects?.created) {
              console.log('🔍 Checking effects.created...');
              for (const obj of result.effects.created) {
                const owner = obj.owner;
                console.log('  Object:', obj.reference?.objectId, 'Owner:', owner);
                if (owner && typeof owner === 'object' && 'AddressOwner' in owner) {
                  dppId = obj.reference?.objectId;
                  console.log('  ✅ Found address-owned object:', dppId);
                  break;
                }
              }
            }
            
            console.log('📦 DPP Object ID:', dppId);
            
            resolve({ 
              success: true, 
              transactionId: result.digest,
              dppId: dppId 
            });
          },
          onError: (error: any) => {
            console.error('❌ Error creating DPP:', error);
            resolve({ success: false, error: error.message });
          },
        }
      );
    });
  } catch (error) {
    console.error('❌ Error creating DPP transaction:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Mark DPP as end of life (blockchain transaction)
 */
export async function markEndOfLife(
  dppId: string,
  signAndExecute: any
): Promise<TransactionResult> {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::tshirt_dpp::mark_end_of_life`,
      arguments: [
        tx.object(dppId),
        // Note: Clock parameter removed - deployed contract doesn't support it yet
      ],
    });
    
    return new Promise((resolve) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('✅ End of Life marked on blockchain:', result.digest);
            resolve({ success: true, transactionId: result.digest });
          },
          onError: (error: any) => {
            console.error('❌ Error marking end of life:', error);
            resolve({ success: false, error: error.message });
          },
        }
      );
    });
  } catch (error) {
    console.error('❌ Error marking end of life transaction:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Verify and unlock reward (blockchain transaction)
 * Note: This requires RecyclerCap which needs special handling
 */
export async function verifyAndUnlock(
  dppId: string,
  signAndExecute: any
): Promise<TransactionResult> {
  try {
    const tx = new Transaction();
    
    // Note: verify_and_unlock is not an entry function in the contract
    // We would need to add an entry function wrapper or handle the return value
    // For now, we'll create a simplified version
    
    tx.moveCall({
      target: `${PACKAGE_ID}::tshirt_dpp::verify_and_unlock`,
      arguments: [
        tx.object(RECYCLER_CAP_ID),
        tx.object(dppId),
      ],
    });
    
    return new Promise((resolve) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('✅ Reward unlocked on blockchain:', result.digest);
            resolve({ success: true, transactionId: result.digest });
          },
          onError: (error: any) => {
            console.error('❌ Error verifying and unlocking:', error);
            resolve({ success: false, error: error.message });
          },
        }
      );
    });
  } catch (error) {
    console.error('❌ Error verifying transaction:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Clear all data (not applicable for blockchain)
 */
export function clearAllData(): void {
  console.log('⚠️ Cannot clear blockchain data');
}
