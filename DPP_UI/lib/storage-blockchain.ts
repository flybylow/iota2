/**
 * Blockchain storage service using IOTA
 * Workshop II: Registry + PTB support
 */

import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { Transaction } from "@iota/iota-sdk/transactions";
import {
  DPP,
  DPPStatus,
  DPPEvent,
  DPP_STATUS,
  TransactionResult,
  PTBResult,
} from "./types";

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID ?? "";
const ADMIN_CAP_ID = process.env.NEXT_PUBLIC_ADMIN_CAP_ID ?? "";
const MANUFACTURER_CAP_ID = process.env.NEXT_PUBLIC_MANUFACTURER_CAP_ID ?? "";
const RECYCLER_CAP_ID = process.env.NEXT_PUBLIC_RECYCLER_CAP_ID ?? "";
const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID ?? "";
const CLOCK_ID = "0x6"; // System clock object

/** On-chain package in DPP_core/DEPLOYED.md predates country/metadata args on create_return_id. */
const USE_LEGACY_DPP_CREATE =
  process.env.NEXT_PUBLIC_DPP_LEGACY_CREATE === "1" ||
  process.env.NEXT_PUBLIC_DPP_LEGACY_CREATE === "true";

function requireEnv(name: string, value: string): string {
  if (!value || value.startsWith("0x...")) {
    throw new Error(
      `Missing or invalid .env.local: ${name}. Copy values from DPP_core/DEPLOYED.md`,
    );
  }
  return value;
}

/**
 * Get IOTA client for testnet
 */
function getClient(): IotaClient {
  return new IotaClient({ url: getFullnodeUrl("testnet") });
}

const DPP_STRUCT_TYPE = `${PACKAGE_ID}::dpp::DPP`;

/**
 * Get all DPP objects owned by an address.
 * Fetches all owned objects and filters by type client-side to avoid RPC "Invalid params" when using filter.
 */
export async function getDPPsByOwner(ownerAddress: string): Promise<DPP[]> {
  try {
    const client = getClient();

    // Query all objects owned by the address (no filter - some RPC nodes reject filter)
    const objects = await client.getOwnedObjects({
      owner: ownerAddress,
      options: {
        showContent: true,
        showType: true,
      },
    });

    // Filter to DPP type only and parse
    const dppObjects = objects.data.filter((obj) => {
      const type = obj.data?.type;
      return type === DPP_STRUCT_TYPE;
    });

    // Optional: DPPCreated events for original reward and manufacturer (some RPC nodes reject queryEvents)
    const originalRewards = new Map<string, number>();
    const manufacturers = new Map<string, string>();
    try {
      const createdEvents = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::dpp::DPPCreated` },
        limit: 50,
      });
      for (const event of createdEvents.data) {
        const data = event.parsedJson as {
          dpp_id: string;
          locked_reward: string;
        };
        originalRewards.set(data.dpp_id, Number(data.locked_reward));
        manufacturers.set(data.dpp_id, event.sender);
      }
    } catch {
      // RPC may return Invalid params for iotax_queryEvents; continue with on-chain data only
    }

    const dpps: DPP[] = [];

    for (const obj of dppObjects) {
      if (obj.data?.content && obj.data.content.dataType === "moveObject") {
        const fields = obj.data.content.fields as {
          id: { id: string };
          gtin: string;
          material: string;
          country_of_manufacture: string;
          other_metadata: string;
          locked_reward: string;
          consumer: string | null;
          status: number;
          created_at: string;
          end_of_life_at: string | null;
        };
        const dppId = fields.id.id;
        const currentReward = Number(fields.locked_reward);

        const originalReward = originalRewards.get(dppId) || currentReward;
        const manufacturerAddress = manufacturers.get(dppId) || "Unknown";

        dpps.push({
          id: dppId,
          gtin: fields.gtin,
          material: fields.material,
          countryOfManufacture: fields.country_of_manufacture,
          otherMetadata: fields.other_metadata,
          lockedReward: currentReward,
          originalReward: originalReward,
          consumer: fields.consumer || null,
          status: Number(fields.status) as DPPStatus,
          createdAt: Number(fields.created_at),
          endOfLifeAt: fields.end_of_life_at
            ? Number(fields.end_of_life_at)
            : null,
          manufacturer: manufacturerAddress,
        });
      }
    }

    console.log(
      "Found",
      dpps.length,
      "DPPs owned by",
      ownerAddress.slice(0, 8) + "...",
    );
    return dpps;
  } catch (error) {
    console.error("Error querying DPPs by owner:", error);
    return [];
  }
}

/**
 * Lookup DPP by GTIN using the Registry
 */
export async function getDPPByGTIN(gtin: string): Promise<DPP | null> {
  try {
    const client = getClient();

    // Query the registry's dynamic field for the GTIN
    const registryObject = await client.getObject({
      id: REGISTRY_ID,
      options: { showContent: true },
    });

    if (!registryObject.data?.content) {
      console.log("Registry not found");
      return null;
    }

    // Query DPPIndexed events to find the DPP ID for this GTIN (some RPC nodes reject queryEvents)
    let indexedEvents: {
      data: Array<{ parsedJson: { gtin: string; dpp_id: string } }>;
    };
    try {
      indexedEvents = (await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::registry::DPPIndexed` },
        limit: 100,
      })) as { data: Array<{ parsedJson: { gtin: string; dpp_id: string } }> };
    } catch {
      indexedEvents = { data: [] };
    }

    let dppId: string | null = null;
    for (const event of indexedEvents.data) {
      const data = event.parsedJson as { gtin: string; dpp_id: string };
      if (data.gtin === gtin) {
        dppId = data.dpp_id;
        break;
      }
    }

    if (!dppId) {
      console.log("GTIN not found in registry:", gtin);
      return null;
    }

    return await getDPPById(dppId);
  } catch (error) {
    console.error("Error looking up DPP by GTIN:", error);
    return null;
  }
}

/**
 * Get a single DPP by ID
 */
export async function getDPPById(id: string): Promise<DPP | null> {
  try {
    const client = getClient();
    const object = await client.getObject({
      id,
      options: { showContent: true },
    });

    if (
      !object.data?.content ||
      object.data.content.dataType !== "moveObject"
    ) {
      return null;
    }

    const fields = object.data.content.fields as {
      id: { id: string };
      gtin: string;
      material: string;
      country_of_manufacture: string;
      other_metadata: string;
      locked_reward: string;
      consumer: string | null;
      status: number;
      created_at: string;
      end_of_life_at: string | null;
    };

    // Optional: events for original reward and manufacturer (some RPC nodes reject queryEvents)
    let originalReward = Number(fields.locked_reward);
    let manufacturer = "Blockchain";
    try {
      const createdEvents = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::dpp::DPPCreated` },
        limit: 50,
      });
      for (const event of createdEvents.data) {
        const data = event.parsedJson as {
          dpp_id: string;
          locked_reward: string;
        };
        if (data.dpp_id === id) {
          originalReward = Number(data.locked_reward);
          manufacturer = event.sender;
          break;
        }
      }
    } catch {
      // use on-chain values only
    }

    return {
      id: fields.id.id,
      gtin: fields.gtin,
      material: fields.material,
      countryOfManufacture: fields.country_of_manufacture,
      otherMetadata: fields.other_metadata,
      lockedReward: Number(fields.locked_reward),
      originalReward,
      consumer: fields.consumer || null,
      status: Number(fields.status) as DPPStatus,
      createdAt: Number(fields.created_at),
      endOfLifeAt: fields.end_of_life_at ? Number(fields.end_of_life_at) : null,
      manufacturer,
    };
  } catch (error) {
    console.error("Error getting DPP:", error);
    return null;
  }
}

/**
 * Get all events from blockchain
 */
export async function getAllEvents(): Promise<DPPEvent[]> {
  try {
    const client = getClient();

    // Some RPC nodes return Invalid params for iotax_queryEvents; catch and return [] per query
    const empty = {
      data: [] as Array<{
        parsedJson: Record<string, unknown>;
        timestampMs: string;
      }>,
    };
    const [created, indexed, endOfLife, claimed] = await Promise.all([
      client
        .queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::dpp::DPPCreated` },
          limit: 50,
        })
        .catch(() => empty),
      client
        .queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::registry::DPPIndexed` },
          limit: 50,
        })
        .catch(() => empty),
      client
        .queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::dpp::EndOfLifeMarked` },
          limit: 50,
        })
        .catch(() => empty),
      client
        .queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::dpp::RewardClaimed` },
          limit: 50,
        })
        .catch(() => empty),
    ]);

    const events: DPPEvent[] = [
      ...created.data.map((e) => ({
        type: "DPPCreated" as const,
        dppId: (e.parsedJson as { dpp_id: string }).dpp_id,
        gtin: (e.parsedJson as { gtin: string }).gtin,
        material: (e.parsedJson as { material: string }).material,
        lockedReward: Number(
          (e.parsedJson as { locked_reward: string }).locked_reward,
        ),
        timestamp: Number(e.timestampMs),
      })),
      ...indexed.data.map((e) => ({
        type: "DPPIndexed" as const,
        gtin: (e.parsedJson as { gtin: string }).gtin,
        dppId: (e.parsedJson as { dpp_id: string }).dpp_id,
        owner: (e.parsedJson as { owner: string }).owner,
        timestamp: Number(e.timestampMs),
      })),
      ...endOfLife.data.map((e) => ({
        type: "EndOfLifeMarked" as const,
        dppId: (e.parsedJson as { dpp_id: string }).dpp_id,
        consumer: (e.parsedJson as { consumer: string }).consumer,
        timestamp: Number(e.timestampMs),
      })),
      ...claimed.data.map((e) => ({
        type: "RewardClaimed" as const,
        dppId: (e.parsedJson as { dpp_id: string }).dpp_id,
        consumer: (e.parsedJson as { consumer: string }).consumer,
        rewardAmount: Number(
          (e.parsedJson as { reward_amount: string }).reward_amount,
        ),
        timestamp: Number(e.timestampMs),
      })),
    ];

    return events.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting events:", error);
    return [];
  }
}

/**
 * Create a new DPP using PTB (Programmable Transaction Block)
 * This atomically creates the DPP AND indexes it in the registry
 */
export async function createDPPWithPTB(
  gtin: string,
  material: string,
  countryOfManufacture: string,
  otherMetadata: string,
  lockedReward: number,
  recipientAddress: string,
  signAndExecute: (
    args: { transaction: Transaction; options?: object },
    callbacks: {
      onSuccess: (result: unknown) => void;
      onError: (error: unknown) => void;
    },
  ) => void,
): Promise<PTBResult> {
  try {
    const pkg = requireEnv("NEXT_PUBLIC_PACKAGE_ID", PACKAGE_ID);
    const mfrCap = requireEnv(
      "NEXT_PUBLIC_MANUFACTURER_CAP_ID",
      MANUFACTURER_CAP_ID,
    );
    const registryId = requireEnv("NEXT_PUBLIC_REGISTRY_ID", REGISTRY_ID);
    const adminCap = requireEnv("NEXT_PUBLIC_ADMIN_CAP_ID", ADMIN_CAP_ID);

    const tx = new Transaction();

    // Step 1: Create DPP and get its ID
    // Legacy ABI (older publish): cap, gtin, material, locked_reward, recipient, clock
    // Current Move source adds country_of_manufacture + other_metadata before locked_reward.
    const createArgs = USE_LEGACY_DPP_CREATE
      ? [
          tx.object(mfrCap),
          tx.pure.string(gtin),
          tx.pure.string(material),
          tx.pure.u64(BigInt(lockedReward)),
          tx.pure.address(recipientAddress),
          tx.object(CLOCK_ID),
        ]
      : [
          tx.object(mfrCap),
          tx.pure.string(gtin),
          tx.pure.string(material),
          tx.pure.string(countryOfManufacture),
          tx.pure.string(otherMetadata),
          tx.pure.u64(BigInt(lockedReward)),
          tx.pure.address(recipientAddress),
          tx.object(CLOCK_ID),
        ];

    const [dppId] = tx.moveCall({
      target: `${pkg}::dpp::create_return_id`,
      arguments: createArgs,
    });

    // Step 2: Index the DPP in the registry (atomic - both succeed or both fail)
    tx.moveCall({
      target: `${pkg}::registry::index_dpp`,
      arguments: [
        tx.object(registryId),
        tx.pure.string(gtin),
        dppId,
        tx.pure.address(recipientAddress),
        tx.object(adminCap),
      ],
    });

    return new Promise((resolve) => {
      signAndExecute(
        {
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result: unknown) => {
            const txResult = result as {
              digest: string;
              objectChanges?: Array<{
                type: string;
                objectType?: string;
                objectId?: string;
              }>;
              events?: Array<{ parsedJson: { dpp_id?: string } }>;
            };
            console.log("DPP Created & Indexed (PTB):", txResult.digest);

            // Extract the DPP ID from events or object changes
            let createdDppId: string | undefined;

            // Try to get from events first
            if (txResult.events) {
              for (const event of txResult.events) {
                if (event.parsedJson?.dpp_id) {
                  createdDppId = event.parsedJson.dpp_id;
                  break;
                }
              }
            }

            // Fallback to object changes
            if (!createdDppId && txResult.objectChanges) {
              for (const change of txResult.objectChanges) {
                if (
                  change.type === "created" &&
                  change.objectType?.includes("DPP")
                ) {
                  createdDppId = change.objectId;
                  break;
                }
              }
            }

            resolve({
              success: true,
              transactionId: txResult.digest,
              dppId: createdDppId,
              indexed: true,
            });
          },
          onError: (error: unknown) => {
            console.error("PTB Error:", error);
            resolve({
              success: false,
              error: (error as Error).message,
              indexed: false,
            });
          },
        },
      );
    });
  } catch (error) {
    console.error("Error creating DPP with PTB:", error);
    return { success: false, error: (error as Error).message, indexed: false };
  }
}

/**
 * Create a new DPP (simple, without registry indexing)
 */
export async function createDPP(
  gtin: string,
  material: string,
  countryOfManufacture: string,
  otherMetadata: string,
  lockedReward: number,
  recipientAddress: string,
  signAndExecute: (
    args: { transaction: Transaction; options?: object },
    callbacks: {
      onSuccess: (result: unknown) => void;
      onError: (error: unknown) => void;
    },
  ) => void,
): Promise<TransactionResult & { dppId?: string }> {
  try {
    const pkg = requireEnv("NEXT_PUBLIC_PACKAGE_ID", PACKAGE_ID);
    const mfrCap = requireEnv(
      "NEXT_PUBLIC_MANUFACTURER_CAP_ID",
      MANUFACTURER_CAP_ID,
    );
    const tx = new Transaction();

    tx.moveCall({
      target: `${pkg}::dpp::create_and_transfer_dpp`,
      arguments: [
        tx.object(mfrCap),
        tx.pure.string(gtin),
        tx.pure.string(material),
        tx.pure.string(countryOfManufacture),
        tx.pure.string(otherMetadata),
        tx.pure.u64(BigInt(lockedReward)),
        tx.pure.address(recipientAddress),
        tx.object(CLOCK_ID),
      ],
    });

    return new Promise((resolve) => {
      signAndExecute(
        {
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result: unknown) => {
            const txResult = result as {
              digest: string;
              objectChanges?: Array<{
                type: string;
                objectType?: string;
                objectId?: string;
              }>;
            };
            console.log("DPP Created:", txResult.digest);

            let dppId: string | undefined;
            if (txResult.objectChanges) {
              for (const change of txResult.objectChanges) {
                if (
                  change.type === "created" &&
                  change.objectType?.includes("DPP")
                ) {
                  dppId = change.objectId;
                  break;
                }
              }
            }

            resolve({
              success: true,
              transactionId: txResult.digest,
              dppId,
            });
          },
          onError: (error: unknown) => {
            console.error("Error creating DPP:", error);
            resolve({ success: false, error: (error as Error).message });
          },
        },
      );
    });
  } catch (error) {
    console.error("Error creating DPP transaction:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Mark DPP as end of life (blockchain transaction)
 */
export async function markEndOfLife(
  dppId: string,
  signAndExecute: (
    args: { transaction: Transaction },
    callbacks: {
      onSuccess: (result: unknown) => void;
      onError: (error: unknown) => void;
    },
  ) => void,
): Promise<TransactionResult> {
  try {
    const pkg = requireEnv("NEXT_PUBLIC_PACKAGE_ID", PACKAGE_ID);
    const tx = new Transaction();

    tx.moveCall({
      target: `${pkg}::dpp::mark_end_of_life`,
      arguments: [tx.object(dppId), tx.object(CLOCK_ID)],
    });

    return new Promise((resolve) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: unknown) => {
            const txResult = result as { digest: string };
            console.log("End of Life marked:", txResult.digest);
            resolve({ success: true, transactionId: txResult.digest });
          },
          onError: (error: unknown) => {
            console.error("Error marking end of life:", error);
            resolve({ success: false, error: (error as Error).message });
          },
        },
      );
    });
  } catch (error) {
    console.error("Error marking end of life transaction:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Transfer DPP ownership to a new consumer
 */
export async function transferOwnership(
  dppId: string,
  newConsumerAddress: string,
  signAndExecute: (
    args: { transaction: Transaction },
    callbacks: {
      onSuccess: (result: unknown) => void;
      onError: (error: unknown) => void;
    },
  ) => void,
): Promise<TransactionResult> {
  try {
    const pkg = requireEnv("NEXT_PUBLIC_PACKAGE_ID", PACKAGE_ID);
    const tx = new Transaction();

    tx.moveCall({
      target: `${pkg}::dpp::transfer_ownership`,
      arguments: [
        tx.object(dppId),
        tx.pure.address(newConsumerAddress),
        tx.object(CLOCK_ID),
      ],
    });

    return new Promise((resolve) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: unknown) => {
            const txResult = result as { digest: string };
            console.log("Ownership transferred:", txResult.digest);
            resolve({ success: true, transactionId: txResult.digest });
          },
          onError: (error: unknown) => {
            console.error("Error transferring ownership:", error);
            resolve({ success: false, error: (error as Error).message });
          },
        },
      );
    });
  } catch (error) {
    console.error("Error transferring ownership transaction:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Verify and unlock reward (blockchain transaction)
 */
export async function verifyAndUnlock(
  dppId: string,
  signAndExecute: (
    args: { transaction: Transaction },
    callbacks: {
      onSuccess: (result: unknown) => void;
      onError: (error: unknown) => void;
    },
  ) => void,
): Promise<TransactionResult> {
  try {
    const pkg = requireEnv("NEXT_PUBLIC_PACKAGE_ID", PACKAGE_ID);
    const recyclerCap = requireEnv(
      "NEXT_PUBLIC_RECYCLER_CAP_ID",
      RECYCLER_CAP_ID,
    );
    const tx = new Transaction();

    tx.moveCall({
      target: `${pkg}::dpp::verify_and_unlock_entry`,
      arguments: [tx.object(recyclerCap), tx.object(dppId)],
    });

    return new Promise((resolve) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: unknown) => {
            const txResult = result as { digest: string };
            console.log("Reward unlocked:", txResult.digest);
            resolve({ success: true, transactionId: txResult.digest });
          },
          onError: (error: unknown) => {
            console.error("Error verifying and unlocking:", error);
            resolve({ success: false, error: (error as Error).message });
          },
        },
      );
    });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Clear all data (not applicable for blockchain)
 */
export function clearAllData(): void {
  console.log("Cannot clear blockchain data");
}
