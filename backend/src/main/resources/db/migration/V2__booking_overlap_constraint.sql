-- Application code already serialises booking creation with a row lock on the vehicle,
-- but that only protects a single JVM. This exclusion constraint makes overlapping
-- bookings impossible at the database level regardless of how many instances are running.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
    ADD CONSTRAINT excl_bookings_no_overlap
    EXCLUDE USING gist (
        vehicle_id WITH =,
        tstzrange(start_at, end_at) WITH &&
    )
    WHERE (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE'));

ALTER TABLE availability_blocks
    ADD CONSTRAINT excl_blocks_no_overlap
    EXCLUDE USING gist (
        vehicle_id WITH =,
        tstzrange(start_at, end_at) WITH &&
    );
