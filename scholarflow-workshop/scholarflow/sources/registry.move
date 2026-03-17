module scholarflow::registry {
    use iota::object::{Self, UID, ID};
    use iota::tx_context::{Self, TxContext};
    use iota::transfer;
    use iota::event;
    use iota::table::{Self, Table};

    // Import AdminCap from grant module
    use scholarflow::grant::AdminCap;

    // ============ Structs ============

    /// Shared registry mapping student address → grant ID
    /// Anyone can read, only admin can write
    public struct Registry has key {
        id: UID,
        by_student: Table<address, ID>,
    }

    // ============ Events ============

    /// Emitted when a student's grant is indexed/updated
    public struct GrantIndexed has copy, drop, store {
        student: address,
        grant_id: ID,
    }

    // ============ Entry Functions ============

    /// Create and share the Registry
    /// Call once after deploying the package
    /// Requires AdminCap
    public entry fun create(
        _cap: &AdminCap,
        ctx: &mut TxContext
    ) {
        let reg = Registry {
            id: object::new(ctx),
            by_student: table::new<address, ID>(ctx),
        };
        
        // share_object makes it accessible to everyone
        transfer::share_object(reg);
    }

    /// Index a student's grant in the registry
    /// Overwrites previous entry if exists
    /// Requires AdminCap
    public entry fun index_grant(
        reg: &mut Registry,
        student: address,
        grant_id: ID,
        _cap: &AdminCap
    ) {
        // Remove existing entry if present (keeps registry current)
        if (table::contains(&reg.by_student, student)) {
            table::remove(&mut reg.by_student, student);
        };
        
        // Insert new mapping
        table::insert(&mut reg.by_student, student, grant_id);
        
        // Emit event for indexers/UIs
        event::emit(GrantIndexed { student, grant_id });
    }

    // ============ View Functions ============

    /// Check if a student has an indexed grant
    public fun has_grant(reg: &Registry, student: address): bool {
        table::contains(&reg.by_student, student)
    }

    /// Get a student's grant ID (aborts if not found)
    public fun get_grant(reg: &Registry, student: address): ID {
        *table::borrow(&reg.by_student, student)
    }
}
