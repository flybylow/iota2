#[test_only]
module dpp_core::registry_tests {
    use iota::test_scenario::{Self as ts};
    use iota::clock;
    use dpp_core::dpp::{Self, AdminCap, ManufacturerCap};
    use dpp_core::registry::{Self, Registry};

    const ADMIN: address        = @0xAD;
    const MANUFACTURER: address = @0xAA;
    const CONSUMER: address     = @0xCC;

    // Helper: init, distribute caps, and create the shared Registry
    fun setup(scenario: &mut ts::Scenario) {
        {
            dpp::test_init(ts::ctx(scenario));
        };

        // ADMIN distributes ManufacturerCap and creates the Registry
        ts::next_tx(scenario, ADMIN);
        {
            let mfr_cap = ts::take_from_sender<ManufacturerCap>(scenario);
            dpp::transfer_manufacturer_cap(mfr_cap, MANUFACTURER);

            let admin_cap = ts::take_from_sender<AdminCap>(scenario);
            registry::create(&admin_cap, ts::ctx(scenario));
            ts::return_to_sender(scenario, admin_cap);
        };
    }

    // Registry is created and empty
    #[test]
    fun test_registry_created_empty() {
        let mut scenario = ts::begin(ADMIN);

        setup(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let reg = ts::take_shared<Registry>(&scenario);
            assert!(!registry::has_dpp(&reg, b"GTIN-001".to_string()), 0);
            assert!(!registry::has_owner(&reg, CONSUMER), 0);
            ts::return_shared(reg);
        };

        ts::end(scenario);
    }

    // Index a DPP and look it up by GTIN
    #[test]
    fun test_index_and_lookup_by_gtin() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup(&mut scenario);

        // MANUFACTURER creates a DPP
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap,
                b"GTIN-001".to_string(),
                b"Plastic".to_string(),
                1000,
                CONSUMER,
                &clock,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&mut scenario, cap);
        };

        // ADMIN indexes the DPP in the registry
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut reg = ts::take_shared<Registry>(&scenario);

            // Grab the DPP ID from CONSUMER's inventory
            let dpp_id = ts::most_recent_id_for_address<dpp::DPP>(CONSUMER);

            registry::index_dpp(
                &mut reg,
                b"GTIN-001".to_string(),
                option::destroy_some(dpp_id),
                CONSUMER,
                &admin_cap
            );

            // Verify it's now in the registry
            assert!(registry::has_dpp(&reg, b"GTIN-001".to_string()), 0);

            ts::return_shared(reg);
            ts::return_to_sender(&scenario, admin_cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // Index multiple DPPs for the same owner
    #[test]
    fun test_multiple_dpps_per_owner() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup(&mut scenario);

        // MANUFACTURER creates two DPPs for CONSUMER
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap, b"GTIN-001".to_string(), b"Plastic".to_string(),
                1000, CONSUMER, &clock, ts::ctx(&mut scenario)
            );
            dpp::create_and_transfer_dpp(
                &cap, b"GTIN-002".to_string(), b"Glass".to_string(),
                500, CONSUMER, &clock, ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&mut scenario, cap);
        };

        // ADMIN indexes both
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut reg = ts::take_shared<Registry>(&scenario);

            let dpp_id_1 = ts::most_recent_id_for_address<dpp::DPP>(CONSUMER);
            registry::index_dpp(
                &mut reg, b"GTIN-001".to_string(),
                option::destroy_some(dpp_id_1), CONSUMER, &admin_cap
            );
            let dpp_id_2 = ts::most_recent_id_for_address<dpp::DPP>(CONSUMER);
            registry::index_dpp(
                &mut reg, b"GTIN-002".to_string(),
                option::destroy_some(dpp_id_2), CONSUMER, &admin_cap
            );

            // Owner should have 2 DPPs
            assert!(registry::has_owner(&reg, CONSUMER), 0);
            let owner_dpps = registry::get_dpps_by_owner(&reg, CONSUMER);
            assert!(vector::length(owner_dpps) == 2, 0);

            ts::return_shared(reg);
            ts::return_to_sender(&scenario, admin_cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // Unindex removes the DPP from the registry
    #[test]
    fun test_unindex_dpp() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup(&mut scenario);

        // MANUFACTURER creates a DPP
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap, b"GTIN-001".to_string(), b"Plastic".to_string(),
                1000, CONSUMER, &clock, ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&mut scenario, cap);
        };

        // ADMIN indexes it
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut reg = ts::take_shared<Registry>(&scenario);
            let dpp_id = ts::most_recent_id_for_address<dpp::DPP>(CONSUMER);
            registry::index_dpp(
                &mut reg, b"GTIN-001".to_string(),
                option::destroy_some(dpp_id), CONSUMER, &admin_cap
            );
            assert!(registry::has_dpp(&reg, b"GTIN-001".to_string()), 0);
            ts::return_shared(reg);
            ts::return_to_sender(&scenario, admin_cap);
        };

        // ADMIN unindexes it
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut reg = ts::take_shared<Registry>(&scenario);
            registry::unindex_dpp(&mut reg, b"GTIN-001".to_string(), &admin_cap);
            assert!(!registry::has_dpp(&reg, b"GTIN-001".to_string()), 0);
            ts::return_shared(reg);
            ts::return_to_sender(&scenario, admin_cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // Unindex a GTIN that doesn't exist — should not abort
    #[test]
    fun test_unindex_nonexistent_is_safe() {
        let mut scenario = ts::begin(ADMIN);

        setup(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut reg = ts::take_shared<Registry>(&scenario);
            // Should silently do nothing, not abort
            registry::unindex_dpp(&mut reg, b"DOES-NOT-EXIST".to_string(), &admin_cap);
            assert!(!registry::has_dpp(&reg, b"DOES-NOT-EXIST".to_string()), 0);
            ts::return_shared(reg);
            ts::return_to_sender(&scenario, admin_cap);
        };

        ts::end(scenario);
    }
}
