package com.rental.booking;

import java.util.Set;

public enum BookingStatus {
    PENDING_PAYMENT,
    CONFIRMED,
    ACTIVE,
    COMPLETED,
    CANCELLED,
    EXPIRED;

    private static final Set<BookingStatus> BLOCKING =
            Set.of(PENDING_PAYMENT, CONFIRMED, ACTIVE);

    /** Statuses that hold a vehicle and therefore block an overlapping booking. */
    public boolean blocksSlot() {
        return BLOCKING.contains(this);
    }
}
