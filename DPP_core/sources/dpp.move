#[allow(lint(custom_state_change))]
module dpp_core::dpp {
    use std::string::String;
    use iota::event;
    use iota::clock::{Self, Clock};

    // ============ Constants ============

    const STATUS_ACTIVE: u8 = 0;
    const STATUS_END_OF_LIFE: u8 = 1;
    const STATUS_RECYCLED: u8 = 2;

    // ============ Error Codes ============

    const ENotConsumer: u64 = 0;
    const ENotOwner: u64 = 2;
    const EInvalidStatus: u64 = 1;

    // ============ Structs ============

    /// Admin capability - only the publisher receives this at init
    /// Required to mint DPPs and update registry
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Capability that grants permission to create DPPs (manufacturer)
    public struct ManufacturerCap has key, store {
        id: UID,
    }

    /// Capability that grants permission to verify recycling
    public struct RecyclerCap has key, store {
        id: UID,
    }

    /// A Digital Product Passport
    public struct DPP has key, store {
        id: UID,
        gtin: String,               // Global Trade Item Number (product identifier)
        material: String,
        locked_reward: u64,
        consumer: Option<address>,
        status: u8,
        created_at: u64,
        end_of_life_at: Option<u64>,
        owner_history: vector<OwnershipRecord>,
    }

    /// Record of a DPP ownership transition
    public struct OwnershipRecord has copy, drop, store {
        from: Option<address>,
        to: address,
        timestamp_ms: u64,
    }

    // ============ Events ============

    /// Emitted when a DPP is created
    public struct DPPCreated has copy, drop {
        dpp_id: ID,
        gtin: String,
        material: String,
        locked_reward: u64,
    }

    /// Emitted when end of life is marked
    public struct EndOfLifeMarked has copy, drop {
        dpp_id: ID,
        consumer: address,
    }

    /// Emitted when reward is claimed
    public struct RewardClaimed has copy, drop {
        dpp_id: ID,
        consumer: address,
        reward_amount: u64,
    }

    /// Emitted when ownership changes on a DPP (auction, resale, transfer)
    public struct OwnershipTransferred has copy, drop {
        dpp_id: ID,
        from: Option<address>,
        to: address,
        timestamp_ms: u64,
    }

    // ============ Init ============

    /// One-time initialization
    /// Creates AdminCap, ManufacturerCap, and RecyclerCap and sends to publisher
    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            sender
        );
        transfer::transfer(
            ManufacturerCap { id: object::new(ctx) },
            sender
        );
        transfer::transfer(
            RecyclerCap { id: object::new(ctx) },
            sender
        );
    }

    // ============ Entry Functions ============

    /// Create a DPP and transfer to recipient
    /// Requires ManufacturerCap (write-gating)
    public entry fun create_and_transfer_dpp(
        _cap: &ManufacturerCap,
        gtin: String,
        material: String,
        locked_reward: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let dpp = DPP {
            id: object::new(ctx),
            gtin,
            material,
            locked_reward,
            consumer: option::none(),
            status: STATUS_ACTIVE,
            created_at: clock::timestamp_ms(clock),
            end_of_life_at: option::none(),
            owner_history: vector::empty<OwnershipRecord>(),
        };

        event::emit(DPPCreated {
            dpp_id: object::id(&dpp),
            gtin: dpp.gtin,
            material: dpp.material,
            locked_reward,
        });

        transfer::transfer(dpp, recipient);
    }

    /// Create a DPP and RETURN its ID
    /// This allows PTB to capture the ID and pass to registry::index_dpp
    public entry fun create_return_id(
        _cap: &ManufacturerCap,
        gtin: String,
        material: String,
        locked_reward: u64,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        let dpp = DPP {
            id: object::new(ctx),
            gtin,
            material,
            locked_reward,
            consumer: option::none(),
            status: STATUS_ACTIVE,
            created_at: clock::timestamp_ms(clock),
            end_of_life_at: option::none(),
            owner_history: vector::empty<OwnershipRecord>(),
        };
        let dpp_id: ID = object::id(&dpp);

        event::emit(DPPCreated {
            dpp_id,
            gtin: dpp.gtin,
            material: dpp.material,
            locked_reward,
        });

        transfer::transfer(dpp, recipient);

        dpp_id  // <-- Return value for PTB chaining
    }

    /// Mark end of life - consumer registers intent to recycle
    public entry fun mark_end_of_life(
        dpp: &mut DPP,
        clock: &Clock,
        ctx: &mut TxContext
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
        _cap: &RecyclerCap,
        dpp: &mut DPP,
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

    /// Entry function wrapper for verify_and_unlock
    public entry fun verify_and_unlock_entry(
        cap: &RecyclerCap,
        dpp: &mut DPP,
    ) {
        verify_and_unlock(cap, dpp);
    }

    /// Transfer ownership of a DPP to a new consumer while preserving locked_reward
    /// Requires current owner to call (if any owner exists)
    public entry fun transfer_ownership(
        mut dpp: DPP,
        new_consumer: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(dpp.status == STATUS_ACTIVE, EInvalidStatus);

        let caller = tx_context::sender(ctx);
        if (option::is_some(&dpp.consumer)) {
            let current_owner = *option::borrow(&dpp.consumer);
            assert!(caller == current_owner, ENotOwner);
        };

        if (option::is_some(&dpp.consumer)) {
            let current_owner = *option::borrow(&dpp.consumer);
            dpp.consumer = option::some(new_consumer);
            vector::push_back(&mut dpp.owner_history, OwnershipRecord {
                from: option::some(current_owner),
                to: new_consumer,
                timestamp_ms: clock::timestamp_ms(clock),
            });
            event::emit(OwnershipTransferred {
                dpp_id: object::id(&dpp),
                from: option::some(current_owner),
                to: new_consumer,
                timestamp_ms: clock::timestamp_ms(clock),
            });
        } else {
            dpp.consumer = option::some(new_consumer);
            vector::push_back(&mut dpp.owner_history, OwnershipRecord {
                from: option::none(),
                to: new_consumer,
                timestamp_ms: clock::timestamp_ms(clock),
            });
            event::emit(OwnershipTransferred {
                dpp_id: object::id(&dpp),
                from: option::none(),
                to: new_consumer,
                timestamp_ms: clock::timestamp_ms(clock),
            });
        };

        transfer::transfer(dpp, new_consumer);
    }

    // ============ Cap Transfer Functions ============

    /// Transfer AdminCap to a new owner
    public entry fun transfer_admin_cap(
        cap: AdminCap,
        recipient: address,
    ) {
        transfer::transfer(cap, recipient);
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

    // ============ Accessor Functions ============

    public fun gtin(dpp: &DPP): &String {
        &dpp.gtin
    }

    public fun material(dpp: &DPP): &String {
        &dpp.material
    }

    public fun locked_reward(dpp: &DPP): u64 {
        dpp.locked_reward
    }

    public fun consumer(dpp: &DPP): &Option<address> {
        &dpp.consumer
    }

    public fun status(dpp: &DPP): u8 {
        dpp.status
    }

    public fun created_at(dpp: &DPP): u64 {
        dpp.created_at
    }

    public fun end_of_life_at(dpp: &DPP): &Option<u64> {
        &dpp.end_of_life_at
    }

    public fun owner_history(dpp: &DPP): &vector<OwnershipRecord> {
        &dpp.owner_history
    }

    public fun ownership_record_from(rec: &OwnershipRecord): &Option<address> {
        &rec.from
    }

    public fun ownership_record_to(rec: &OwnershipRecord): address {
        rec.to
    }

    public fun ownership_record_timestamp(rec: &OwnershipRecord): u64 {
        rec.timestamp_ms
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}
