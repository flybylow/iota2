#[test_only]
module dpp_core::dpp_core_tests {
    use iota::test_scenario::{Self as ts};
    use iota::clock;
    use dpp_core::dpp::{Self, ManufacturerCap, RecyclerCap, DPP};

    const ADMIN: address        = @0xAD;
    const MANUFACTURER: address = @0xAA;
    const CONSUMER: address     = @0xCC;
    const RECYCLER: address     = @0xBC;
    const NEW_CONSUMER: address = @0xDD;

    // Helper: init and distribute caps to their respective roles
    fun setup_roles(scenario: &mut ts::Scenario) {
        // Init — all caps go to ADMIN
        {
            dpp::test_init(ts::ctx(scenario));
        };

        // ADMIN distributes caps to the right parties
        ts::next_tx(scenario, ADMIN);
        {
            let mfr_cap = ts::take_from_sender<ManufacturerCap>(scenario);
            dpp::transfer_manufacturer_cap(mfr_cap, MANUFACTURER);

            let rec_cap = ts::take_from_sender<RecyclerCap>(scenario);
            dpp::transfer_recycler_cap(rec_cap, RECYCLER);
        };
    }

    // Tests the full lifecycle: Manufacturer -> Consumer -> Recycler
    #[test]
    fun test_full_lifecycle() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup_roles(&mut scenario);

        // MANUFACTURER creates DPP and sends to CONSUMER
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
            ts::return_to_sender(&scenario, cap);
        };

        // CONSUMER marks end of life
        ts::next_tx(&mut scenario, CONSUMER);
        {
            let mut dpp = ts::take_from_sender<DPP>(&scenario);
            assert!(dpp::status(&dpp) == 0, 0); // starts ACTIVE
            dpp::mark_end_of_life(&mut dpp, &clock, ts::ctx(&mut scenario));
            assert!(dpp::status(&dpp) == 1, 0); // now END_OF_LIFE
            ts::return_to_sender(&scenario, dpp);
        };

        // RECYCLER verifies recycling
        ts::next_tx(&mut scenario, RECYCLER);
        {
            let cap = ts::take_from_sender<RecyclerCap>(&scenario);
            let mut dpp = ts::take_from_address<DPP>(&scenario, CONSUMER);
            dpp::verify_and_unlock_entry(&cap, &mut dpp);
            assert!(dpp::status(&dpp) == 2, 0); // now RECYCLED
            ts::return_to_address(CONSUMER, dpp);
            ts::return_to_sender(&scenario, cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = dpp_core::dpp)]
    fun test_cannot_mark_eol_twice() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup_roles(&mut scenario);

        // MANUFACTURER creates DPP and sends to CONSUMER
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap,
                b"GTIN-002".to_string(),
                b"Glass".to_string(),
                500,
                CONSUMER,
                &clock,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, cap);
        };

        // CONSUMER marks end of life once — OK, second call should abort
        ts::next_tx(&mut scenario, CONSUMER);
        {
            let mut dpp = ts::take_from_sender<DPP>(&scenario);
            dpp::mark_end_of_life(&mut dpp, &clock, ts::ctx(&mut scenario));
            dpp::mark_end_of_life(&mut dpp, &clock, ts::ctx(&mut scenario)); // aborts here
            ts::return_to_sender(&scenario, dpp);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = dpp_core::dpp)]
    fun test_cannot_verify_active_dpp() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup_roles(&mut scenario);

        // MANUFACTURER creates DPP, CONSUMER never marks EOL
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap,
                b"GTIN-003".to_string(),
                b"Metal".to_string(),
                200,
                CONSUMER,
                &clock,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, cap);
        };

        // RECYCLER tries to verify an ACTIVE DPP — should abort
        ts::next_tx(&mut scenario, RECYCLER);
        {
            let cap = ts::take_from_sender<RecyclerCap>(&scenario);
            let mut dpp = ts::take_from_address<DPP>(&scenario, CONSUMER);
            dpp::verify_and_unlock_entry(&cap, &mut dpp); // aborts here
            ts::return_to_address(CONSUMER, dpp);
            ts::return_to_sender(&scenario, cap);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_create_return_id() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup_roles(&mut scenario);

        // MANUFACTURER creates DPP via create_return_id
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            let dpp_id = dpp::create_return_id(
                &cap,
                b"GTIN-004".to_string(),
                b"Paper".to_string(),
                300,
                CONSUMER,
                &clock,
                ts::ctx(&mut scenario)
            );
            assert!(dpp_id != object::id_from_address(@0x0), 0);
            ts::return_to_sender(&scenario, cap);
        };

        // Verify CONSUMER received the DPP
        ts::next_tx(&mut scenario, CONSUMER);
        {
            let dpp = ts::take_from_sender<DPP>(&scenario);
            assert!(dpp::status(&dpp) == 0, 0); // ACTIVE
            ts::return_to_sender(&scenario, dpp);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_cap_transfer() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        let new_manufacturer: address = @0xBB;

        setup_roles(&mut scenario);

        // MANUFACTURER transfers their cap to a new manufacturer
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::transfer_manufacturer_cap(cap, new_manufacturer);
        };

        // new_manufacturer can now create DPPs
        ts::next_tx(&mut scenario, new_manufacturer);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap,
                b"GTIN-005".to_string(),
                b"Wood".to_string(),
                100,
                CONSUMER,
                &clock,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, cap);
        };

        // Verify CONSUMER received the DPP
        ts::next_tx(&mut scenario, CONSUMER);
        {
            let dpp = ts::take_from_sender<DPP>(&scenario);
            assert!(dpp::status(&dpp) == 0, 0); // ACTIVE
            ts::return_to_sender(&scenario, dpp);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_transfer_ownership_keeps_locked_reward() {
        let mut scenario = ts::begin(ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));

        setup_roles(&mut scenario);

        // MANUFACTURER creates DPP and sends to CONSUMER
        ts::next_tx(&mut scenario, MANUFACTURER);
        {
            let cap = ts::take_from_sender<ManufacturerCap>(&scenario);
            dpp::create_and_transfer_dpp(
                &cap,
                b"GTIN-006".to_string(),
                b"Stone".to_string(),
                800,
                CONSUMER,
                &clock,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, cap);
        };

        // CONSUMER transfers ownership to NEW_CONSUMER
        ts::next_tx(&mut scenario, CONSUMER);
        {
            let dpp = ts::take_from_sender<DPP>(&scenario);
            dpp::transfer_ownership(dpp, NEW_CONSUMER, &clock, ts::ctx(&mut scenario));
        };

        // NEW_CONSUMER has DPP and can inspect status + reward
        ts::next_tx(&mut scenario, NEW_CONSUMER);
        {
            let dpp = ts::take_from_sender<DPP>(&scenario);
            assert!(dpp::status(&dpp) == 0, 0);
            assert!(dpp::locked_reward(&dpp) == 800, 0);
            assert!(option::is_some(dpp::consumer(&dpp)), 0);
            assert!(*option::borrow(dpp::consumer(&dpp)) == NEW_CONSUMER, 0);
            assert!(vector::length(dpp::owner_history(&dpp)) == 1, 0);
            let first = *vector::borrow(dpp::owner_history(&dpp), 0);
            assert!(*dpp::ownership_record_from(&first) == option::none(), 0);
            assert!(dpp::ownership_record_to(&first) == NEW_CONSUMER, 0);
            ts::return_to_sender(&scenario, dpp);
        };

        // NEW_CONSUMER can mark end of life after transfer
        ts::next_tx(&mut scenario, NEW_CONSUMER);
        {
            let mut dpp = ts::take_from_sender<DPP>(&scenario);
            dpp::mark_end_of_life(&mut dpp, &clock, ts::ctx(&mut scenario));
            assert!(dpp::status(&dpp) == 1, 0);
            ts::return_to_sender(&scenario, dpp);
        };

        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}

