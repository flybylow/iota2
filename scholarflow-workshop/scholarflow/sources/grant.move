module scholarflow::grant {
    use iota::object::{Self, UID, ID};
    use iota::tx_context::{Self, TxContext};
    use iota::transfer;
    use iota::event;

    // ============ Structs ============

    /// Admin capability - only the publisher receives this at init
    /// Required to mint grants and update registry
    public struct AdminCap has key, store {
        id: UID,
    }

    /// A grant object owned by a student
    public struct Grant has key, store {
        id: UID,
        student: address,
        amount: u64,
    }

    // ============ Events ============

    /// Emitted when a grant is minted
    public struct GrantMinted has copy, drop, store {
        student: address,
        amount: u64,
        grant_id: ID,
    }

    // ============ Init ============

    /// One-time initialization
    /// Creates AdminCap and sends to publisher
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            tx_context::sender(ctx)
        );
    }

    // ============ Entry Functions ============

    /// Mint a grant to a student
    /// Requires AdminCap (write-gating)
    public entry fun mint(
        student: address,
        amount: u64,
        _cap: &AdminCap,
        ctx: &mut TxContext
    ) {
        let grant = Grant { 
            id: object::new(ctx), 
            student, 
            amount 
        };
        let gid: ID = object::id(&grant);
        
        event::emit(GrantMinted { 
            student, 
            amount, 
            grant_id: gid 
        });
        
        transfer::transfer(grant, student);
    }

    /// Mint a grant and RETURN its ID
    /// This allows PTB to capture the ID and pass to index_grant
    public entry fun mint_return_id(
        student: address,
        amount: u64,
        _cap: &AdminCap,
        ctx: &mut TxContext
    ): ID {
        let grant = Grant { 
            id: object::new(ctx), 
            student, 
            amount 
        };
        let gid: ID = object::id(&grant);
        
        event::emit(GrantMinted { 
            student, 
            amount, 
            grant_id: gid 
        });
        
        transfer::transfer(grant, student);
        
        gid  // <-- Return value for PTB chaining
    }
}
