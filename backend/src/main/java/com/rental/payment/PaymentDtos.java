package com.rental.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public final class PaymentDtos {

    private PaymentDtos() {
    }

    public record InitiateRequest(@NotNull Long bookingId) {
    }

    public record InitiateResponse(
            String gatewayOrderId,
            BigDecimal amount,
            String currency,
            Long bookingId,
            String bookingReference
    ) {
    }

    /**
     * Payload shape the payment gateway posts to our webhook. Field names mirror the
     * common Razorpay/Stripe pattern of orderId + paymentId + a status string; the
     * signature header is verified separately in the controller before this is parsed.
     */
    public record WebhookPayload(
            @NotBlank String gatewayOrderId,
            @NotBlank String gatewayPaymentId,
            @NotBlank String status,
            String failureReason
    ) {
    }

    public record PaymentResponse(
            Long id,
            Long bookingId,
            BigDecimal amount,
            PaymentType paymentType,
            PaymentStatus status,
            String gatewayOrderId,
            String gatewayPaymentId,
            Instant createdAt
    ) {
        public static PaymentResponse from(Payment p) {
            return new PaymentResponse(p.getId(), p.getBooking().getId(), p.getAmount(),
                    p.getPaymentType(), p.getStatus(), p.getGatewayOrderId(),
                    p.getGatewayPaymentId(), p.getCreatedAt());
        }
    }
}
