package com.rental.user;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;

public final class UserDtos {

    private UserDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 160) String email,
            @NotBlank @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$",
                    message = "Enter a valid phone number") String phone,
            @NotBlank @Size(min = 8, max = 72,
                    message = "Password must be at least 8 characters") String password,
            Role role
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record AuthResponse(
            String accessToken,
            String tokenType,
            long expiresInSeconds,
            UserResponse user
    ) {
    }

    public record UserResponse(
            Long id,
            String fullName,
            String email,
            String phone,
            Role role,
            KycStatus kycStatus,
            boolean enabled,
            Instant createdAt
    ) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(),
                    u.getRole(), u.getKycStatus(), u.isEnabled(), u.getCreatedAt());
        }
    }

    public record UpdateProfileRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$",
                    message = "Enter a valid phone number") String phone
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 72) String newPassword
    ) {
    }

    public record LicenseRequest(
            @NotBlank @Size(max = 40) String licenseNumber,
            @NotBlank @Size(max = 500) String documentUrl,
            @NotNull @Future(message = "The licence must not be expired") LocalDate expiryDate
    ) {
    }

    public record LicenseResponse(
            Long id,
            Long userId,
            String userName,
            String licenseNumber,
            String documentUrl,
            LocalDate expiryDate,
            LicenseStatus status,
            String rejectionReason,
            Instant reviewedAt,
            Instant createdAt
    ) {
        public static LicenseResponse from(License l) {
            return new LicenseResponse(l.getId(), l.getUser().getId(), l.getUser().getFullName(),
                    l.getLicenseNumber(), l.getDocumentUrl(), l.getExpiryDate(), l.getStatus(),
                    l.getRejectionReason(), l.getReviewedAt(), l.getCreatedAt());
        }
    }

    public record LicenseDecisionRequest(
            @NotNull Boolean approve,
            String reason
    ) {
    }
}
