module tshirt_dpp::tshirt_dpp {
    use std::string::String;
    use iota::event;
    use iota::clock::{Self, Clock};

    // === Constants ===

    const STATUS_ACTIVE: u8 = 0;
    const STATUS_END_OF_LIFE: u8 = 1;
    const STATUS_RECYCLED: u8 = 2;

    // === Error codes ===

    const ENotConsumer: u64 = 0;
    const EInvalidStatus: u64 = 1;

    // === Structs ===

    /// Capability that grants permission to create DPPs
    public struct ManufacturerCap has key {
        id: UID,
    }

    /// Capability that grants permission to verify recycling
    public struct RecyclerCap has key {
        id: UID,
    }

    /// A Digital Product Passport for a T-Shirt
    public struct TShirtDPP has key {
        id: UID,
        material: String,
        locked_reward: u64,
        consumer: Option<address>,
        status: u8,
        created_at: u64,          // Timestamp when DPP was created
        end_of_life_at: Option<u64>, // Timestamp when marked end of life
    }

    // === Events ===

    /// Event emitted when a DPP is created
    public struct DPPCreated has copy, drop {
        dpp_id: ID,
        material: String,
        locked_reward: u64,
    }

    /// Event emitted when end of life is marked
    public struct EndOfLifeMarked has copy, drop {
        dpp_id: ID,
        consumer: address,
    }

    /// Event emitted when reward is claimed
    public struct RewardClaimed has copy, drop {
        dpp_id: ID,
        consumer: address,
        reward_amount: u64,
    }

    // === Functions ===

    /// Called once when the module is published
    fun init(ctx: &mut TxContext) {
        let manufacturer_cap = ManufacturerCap {
            id: object::new(ctx),
        };
        let recycler_cap = RecyclerCap {
            id: object::new(ctx),
        };
        transfer::transfer(manufacturer_cap, tx_context::sender(ctx));
        transfer::transfer(recycler_cap, tx_context::sender(ctx));
    }

    /// Create a new DPP (requires ManufacturerCap)
    public fun create_dpp(
        _: &ManufacturerCap,
        material: String,
        locked_reward: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): TShirtDPP {
        let dpp = TShirtDPP {
            id: object::new(ctx),
            material,
            locked_reward,
            consumer: option::none(),
            status: STATUS_ACTIVE,
            created_at: clock::timestamp_ms(clock),
            end_of_life_at: option::none(),
        };

        event::emit(DPPCreated {
            dpp_id: object::id(&dpp),
            material: dpp.material,
            locked_reward,
        });

        dpp
    }

    /// Create and transfer DPP to recipient
    public entry fun create_and_transfer_dpp(
        cap: &ManufacturerCap,
        material: String,
        locked_reward: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let dpp = create_dpp(cap, material, locked_reward, clock, ctx);
        transfer::transfer(dpp, recipient);
    }

    /// Mark end of life - consumer registers intent to recycle
    public entry fun mark_end_of_life(
        dpp: &mut TShirtDPP,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(dpp.status == STATUS_ACTIVE, EInvalidStatus);

        let consumer_address = tx_context::sender(ctx);
        dpp.consumer = option::some(consumer_address);
        dpp.status = STATUS_END_OF_LIFE;
        dpp.end_of_life_at = option::some(clock::timestamp_ms(clock));

        event::emit(EndOfLifeMarked {
            dpp_id: object::id(dpp),
            consumer: consumer_address,
        });
    }

    /// Verify recycling and unlock reward (requires RecyclerCap)
    public fun verify_and_unlock(
        _: &RecyclerCap,
        dpp: &mut TShirtDPP,
    ): (address, u64) {
        assert!(dpp.status == STATUS_END_OF_LIFE, EInvalidStatus);
        assert!(option::is_some(&dpp.consumer), ENotConsumer);

        let consumer_address = *option::borrow(&dpp.consumer);
        let reward_amount = dpp.locked_reward;

        dpp.status = STATUS_RECYCLED;
        dpp.locked_reward = 0;

        event::emit(RewardClaimed {
            dpp_id: object::id(dpp),
            consumer: consumer_address,
            reward_amount,
        });

        (consumer_address, reward_amount)
    }

    /// Transfer ManufacturerCap to a new owner
    public entry fun transfer_manufacturer_cap(
        cap: ManufacturerCap,
        recipient: address,
    ) {
        transfer::transfer(cap, recipient);
    }

    /// Transfer RecyclerCap to a new owner
    public entry fun transfer_recycler_cap(
        cap: RecyclerCap,
        recipient: address,
    ) {
        transfer::transfer(cap, recipient);
    }

    // === Accessor functions ===

    public fun material(dpp: &TShirtDPP): &String {
        &dpp.material
    }

    public fun locked_reward(dpp: &TShirtDPP): u64 {
        dpp.locked_reward
    }

    public fun consumer(dpp: &TShirtDPP): &Option<address> {
        &dpp.consumer
    }

    public fun status(dpp: &TShirtDPP): u8 {
        dpp.status
    }

    public fun created_at(dpp: &TShirtDPP): u64 {
        dpp.created_at
    }

    public fun end_of_life_at(dpp: &TShirtDPP): &Option<u64> {
        &dpp.end_of_life_at
    }
}
