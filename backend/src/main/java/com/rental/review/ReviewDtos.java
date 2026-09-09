package com.rental.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ReviewDtos {

    private ReviewDtos() {
    }

    public record CreateRequest(
            @NotNull Long bookingId,
            @NotNull @Min(1) @Max(5) Integer rating,
            @Size(max = 1000) String comment
    ) {
    }

    public record ReviewResponse(
            Long id,
            Long vehicleId,
            Long userId,
            String userName,
            Integer rating,
            String comment,
            Instant createdAt
    ) {
        public static ReviewResponse from(Review r) {
            return new ReviewResponse(r.getId(), r.getVehicle().getId(), r.getUser().getId(),
                    r.getUser().getFullName(), r.getRating(), r.getComment(), r.getCreatedAt());
        }
    }

    public record VehicleRatingSummary(Long vehicleId, double averageRating, long reviewCount) {
    }
}
