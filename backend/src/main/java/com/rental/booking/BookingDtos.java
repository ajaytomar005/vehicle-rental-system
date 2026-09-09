package com.rental.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public final class BookingDtos {

    private BookingDtos() {
    }

    public record QuoteRequest(
            @NotNull Long vehicleId,
            @NotNull Instant startAt,
            @NotNull Instant endAt
    ) {
    }

    public record QuoteResponse(
            Long vehicleId,
            Instant startAt,
            Instant endAt,
            RateType rateType,
            int units,
            long totalHours,
            BigDecimal rentalAmount,
            BigDecimal depositAmount,
            BigDecimal totalAmount,
            boolean available
    ) {
    }

    public record CreateRequest(
            @NotNull Long vehicleId,
            @NotNull @Future Instant startAt,
            @NotNull Instant endAt
    ) {
    }

    public record BookingResponse(
            Long id,
            String bookingReference,
            Long vehicleId,
            String vehicleName,
            String vehicleImageUrl,
            String city,
            Long customerId,
            String customerName,
            Instant startAt,
            Instant endAt,
            RateType rateType,
            int units,
            BigDecimal rentalAmount,
            BigDecimal depositAmount,
            BigDecimal totalAmount,
            BookingStatus status,
            String cancelledReason,
            Instant pickedUpAt,
            Instant returnedAt,
            Instant createdAt
    ) {
        public static BookingResponse from(Booking b) {
            var v = b.getVehicle();
            return new BookingResponse(
                    b.getId(),
                    b.getBookingReference(),
                    v.getId(),
                    v.getBrand() + " " + v.getModel(),
                    v.primaryImageUrl(),
                    v.getCity(),
                    b.getUser().getId(),
                    b.getUser().getFullName(),
                    b.getStartAt(),
                    b.getEndAt(),
                    b.getRateType(),
                    b.getUnits(),
                    b.getRentalAmount(),
                    b.getDepositAmount(),
                    b.getTotalAmount(),
                    b.getStatus(),
                    b.getCancelledReason(),
                    b.getPickedUpAt(),
                    b.getReturnedAt(),
                    b.getCreatedAt()
            );
        }
    }

    public record BusyWindow(Instant startAt, Instant endAt) {
    }

    public record CancelRequest(String reason) {
    }
}
