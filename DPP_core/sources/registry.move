module dpp_core::registry {
    use std::string::String;
    use iota::event;
    use iota::table::{Self, Table};

    // Import AdminCap from dpp module for access control
    use dpp_core::dpp::AdminCap;

    // ============ Structs ============

    /// Shared registry mapping GTIN (product identifier) -> DPP ID
    /// Anyone can read, only admin can write
    public struct Registry has key {
        id: UID,
        /// Maps GTIN string to DPP object ID
        by_gtin: Table<String, ID>,
        /// Maps owner address to their DPP IDs (for querying all DPPs by owner)
        by_owner: Table<address, vector<ID>>,
    }

    // ============ Events ============

    /// Emitted when a DPP is indexed in the registry
    public struct DPPIndexed has copy, drop {
        gtin: String,
        dpp_id: ID,
        owner: address,
    }

    /// Emitted when a DPP is removed from the registry
    public struct DPPUnindexed has copy, drop {
        gtin: String,
        dpp_id: ID,
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
            by_gtin: table::new<String, ID>(ctx),
            by_owner: table::new<address, vector<ID>>(ctx),
        };

        // share_object makes it accessible to everyone
        transfer::share_object(reg);
    }

    /// Index a DPP in the registry by GTIN
    /// Overwrites previous entry if exists
    /// Requires AdminCap
    public entry fun index_dpp(
        reg: &mut Registry,
        gtin: String,
        dpp_id: ID,
        owner: address,
        _cap: &AdminCap
    ) {
        // Remove existing GTIN entry if present (keeps registry current)
        if (table::contains(&reg.by_gtin, gtin)) {
            table::remove(&mut reg.by_gtin, gtin);
        };

        // Insert new GTIN -> DPP ID mapping
        table::add(&mut reg.by_gtin, gtin, dpp_id);

        // Add to owner's list of DPPs
        if (!table::contains(&reg.by_owner, owner)) {
            table::add(&mut reg.by_owner, owner, vector::empty<ID>());
        };
        let owner_dpps = table::borrow_mut(&mut reg.by_owner, owner);
        vector::push_back(owner_dpps, dpp_id);

        // Emit event for indexers/UIs
        event::emit(DPPIndexed { gtin, dpp_id, owner });
    }

    /// Remove a DPP from the registry
    /// Requires AdminCap
    public entry fun unindex_dpp(
        reg: &mut Registry,
        gtin: String,
        _cap: &AdminCap
    ) {
        if (table::contains(&reg.by_gtin, gtin)) {
            let dpp_id = table::remove(&mut reg.by_gtin, gtin);
            event::emit(DPPUnindexed { gtin, dpp_id });
        };
    }

    // ============ View Functions ============

    /// Check if a GTIN is indexed
    public fun has_dpp(reg: &Registry, gtin: String): bool {
        table::contains(&reg.by_gtin, gtin)
    }

    /// Get a DPP ID by GTIN (aborts if not found)
    public fun get_dpp(reg: &Registry, gtin: String): ID {
        *table::borrow(&reg.by_gtin, gtin)
    }

    /// Check if an owner has any indexed DPPs
    public fun has_owner(reg: &Registry, owner: address): bool {
        table::contains(&reg.by_owner, owner)
    }

    /// Get all DPP IDs for an owner (aborts if owner not found)
    public fun get_dpps_by_owner(reg: &Registry, owner: address): &vector<ID> {
        table::borrow(&reg.by_owner, owner)
    }
}
