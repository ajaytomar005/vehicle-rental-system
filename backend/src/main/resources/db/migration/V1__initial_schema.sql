CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(120)  NOT NULL,
    email           VARCHAR(160)  NOT NULL UNIQUE,
    phone           VARCHAR(20)   NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL,
    kyc_status      VARCHAR(20)   NOT NULL DEFAULT 'NOT_SUBMITTED',
    enabled         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE licenses (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number   VARCHAR(40)  NOT NULL,
    document_url     VARCHAR(500) NOT NULL,
    expiry_date      DATE         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(255),
    reviewed_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
    id              BIGSERIAL PRIMARY KEY,
    owner_id        BIGINT        NOT NULL REFERENCES users(id),
    vehicle_type    VARCHAR(20)   NOT NULL,
    brand           VARCHAR(60)   NOT NULL,
    model           VARCHAR(60)   NOT NULL,
    year            INT           NOT NULL,
    registration_no VARCHAR(30)   NOT NULL UNIQUE,
    seats           INT,
    fuel_type       VARCHAR(20)   NOT NULL,
    transmission    VARCHAR(20),
    city            VARCHAR(80)   NOT NULL,
    address         VARCHAR(255),
    description     TEXT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING_APPROVAL',
    version         BIGINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_city_type ON vehicles(city, vehicle_type);
CREATE INDEX idx_vehicles_status ON vehicles(status);

CREATE TABLE vehicle_images (
    id          BIGSERIAL PRIMARY KEY,
    vehicle_id  BIGINT       NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);

CREATE TABLE pricing (
    id               BIGSERIAL PRIMARY KEY,
    vehicle_id       BIGINT        NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
    hourly_rate      NUMERIC(12,2) NOT NULL,
    daily_rate       NUMERIC(12,2) NOT NULL,
    weekly_rate      NUMERIC(12,2) NOT NULL,
    security_deposit NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_pricing_positive CHECK (
        hourly_rate > 0 AND daily_rate > 0 AND weekly_rate > 0 AND security_deposit >= 0
    )
);

-- Owner-declared blackout windows (servicing, personal use). Booking overlaps are
-- checked against this table as well as against confirmed bookings.
CREATE TABLE availability_blocks (
    id          BIGSERIAL PRIMARY KEY,
    vehicle_id  BIGINT      NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ NOT NULL,
    reason      VARCHAR(160),
    CONSTRAINT chk_block_range CHECK (end_at > start_at)
);

CREATE INDEX idx_blocks_vehicle_range ON availability_blocks(vehicle_id, start_at, end_at);

CREATE TABLE bookings (
    id                BIGSERIAL PRIMARY KEY,
    booking_reference VARCHAR(20)   NOT NULL UNIQUE,
    user_id           BIGINT        NOT NULL REFERENCES users(id),
    vehicle_id        BIGINT        NOT NULL REFERENCES vehicles(id),
    start_at          TIMESTAMPTZ   NOT NULL,
    end_at            TIMESTAMPTZ   NOT NULL,
    rate_type         VARCHAR(20)   NOT NULL,
    units             INT           NOT NULL,
    rental_amount     NUMERIC(12,2) NOT NULL,
    deposit_amount    NUMERIC(12,2) NOT NULL,
    total_amount      NUMERIC(12,2) NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING_PAYMENT',
    cancelled_reason  VARCHAR(255),
    picked_up_at      TIMESTAMPTZ,
    returned_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_booking_range CHECK (end_at > start_at)
);

CREATE INDEX idx_bookings_vehicle_range ON bookings(vehicle_id, start_at, end_at);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE TABLE payments (
    id                BIGSERIAL PRIMARY KEY,
    booking_id        BIGINT        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount            NUMERIC(12,2) NOT NULL,
    payment_type      VARCHAR(20)   NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'CREATED',
    gateway_order_id  VARCHAR(120)  NOT NULL UNIQUE,
    gateway_payment_id VARCHAR(120),
    failure_reason    VARCHAR(255),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);

CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    booking_id  BIGINT       NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    vehicle_id  BIGINT       NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id     BIGINT       NOT NULL REFERENCES users(id),
    rating      INT          NOT NULL,
    comment     VARCHAR(1000),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
