module scholarflow::grant {
    use iota::event;

    // === Structs ===

    /// Capability that grants permission to mint grants
    public struct AdminCap has key {
        id: UID,
    }

    /// A grant awarded to a student
    public struct Grant has key {
        id: UID,
        student: address,
        amount: u64,
    }

    /// Event emitted when a grant is minted
    public struct GrantMinted has copy, drop {
        student: address,
        amount: u64,
        grant_id: ID,
    }

    // === Functions ===

    /// Called once when the module is published
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Mint a new grant (requires AdminCap)
    public fun mint(
        _: &AdminCap,
        student: address,
        amount: u64,
        ctx: &mut TxContext,
    ) {
        let grant = Grant {
            id: object::new(ctx),
            student,
            amount,
        };

        event::emit(GrantMinted {
            student,
            amount,
            grant_id: object::id(&grant),
        });

        transfer::transfer(grant, student);
    }

    /// Transfer AdminCap to a new owner
    public entry fun transfer_admin_cap(
        admin_cap: AdminCap,
        recipient: address,
    ) {
        transfer::transfer(admin_cap, recipient);
    }
}