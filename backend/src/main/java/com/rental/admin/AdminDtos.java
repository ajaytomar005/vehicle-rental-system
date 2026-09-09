package com.rental.admin;

import java.math.BigDecimal;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record DashboardStats(
            long totalUsers,
            long totalVehicles,
            long activeVehicles,
            long pendingVehicleApprovals,
            long pendingLicenseReviews,
            long totalBookings,
            long completedBookings,
            BigDecimal grossBookingValue
    ) {
    }
}
