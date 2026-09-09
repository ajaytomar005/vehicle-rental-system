package com.rental.vehicle;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class VehicleDtos {

    private VehicleDtos() {
    }

    public record PricingRequest(
            @NotNull @DecimalMin(value = "0.01") BigDecimal hourlyRate,
            @NotNull @DecimalMin(value = "0.01") BigDecimal dailyRate,
            @NotNull @DecimalMin(value = "0.01") BigDecimal weeklyRate,
            @NotNull @DecimalMin(value = "0.00") BigDecimal securityDeposit
    ) {
    }

    public record CreateRequest(
            @NotNull VehicleType vehicleType,
            @NotBlank @Size(max = 60) String brand,
            @NotBlank @Size(max = 60) String model,
            @NotNull @Min(1980) @Max(2100) Integer year,
            @NotBlank @Size(max = 30) String registrationNo,
            @Min(1) @Max(60) Integer seats,
            @NotNull FuelType fuelType,
            Transmission transmission,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 255) String address,
            @Size(max = 2000) String description,
            @NotNull @Valid PricingRequest pricing,
            List<@NotBlank String> imageUrls
    ) {
    }

    public record UpdateRequest(
            @Min(1) @Max(60) Integer seats,
            @NotBlank @Size(max = 80) String city,
            @Size(max = 255) String address,
            @Size(max = 2000) String description,
            @NotNull @Valid PricingRequest pricing
    ) {
    }

    public record ImageResponse(String url, boolean primary) {
        static ImageResponse from(VehicleImage img) {
            return new ImageResponse(img.getImageUrl(), img.isPrimary());
        }
    }

    public record PricingResponse(
            BigDecimal hourlyRate, BigDecimal dailyRate, BigDecimal weeklyRate,
            BigDecimal securityDeposit
    ) {
        static PricingResponse from(Pricing p) {
            if (p == null) return null;
            return new PricingResponse(p.getHourlyRate(), p.getDailyRate(), p.getWeeklyRate(),
                    p.getSecurityDeposit());
        }
    }

    public record VehicleResponse(
            Long id,
            Long ownerId,
            String ownerName,
            VehicleType vehicleType,
            String brand,
            String model,
            Integer year,
            String registrationNo,
            Integer seats,
            FuelType fuelType,
            Transmission transmission,
            String city,
            String address,
            String description,
            VehicleStatus status,
            List<ImageResponse> images,
            PricingResponse pricing,
            Instant createdAt
    ) {
        public static VehicleResponse from(Vehicle v) {
            return new VehicleResponse(
                    v.getId(), v.getOwner().getId(), v.getOwner().getFullName(),
                    v.getVehicleType(), v.getBrand(), v.getModel(), v.getYear(),
                    v.getRegistrationNo(), v.getSeats(), v.getFuelType(), v.getTransmission(),
                    v.getCity(), v.getAddress(), v.getDescription(), v.getStatus(),
                    v.getImages().stream().map(ImageResponse::from).toList(),
                    PricingResponse.from(v.getPricing()), v.getCreatedAt());
        }
    }

    public record RejectRequest(@NotBlank String reason) {
    }
}
