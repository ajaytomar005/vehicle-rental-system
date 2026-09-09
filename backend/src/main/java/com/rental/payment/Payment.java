package com.rental.payment;

import com.rental.booking.Booking;
import com.rental.common.BaseEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 20)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.CREATED;

    @Column(name = "gateway_order_id", nullable = false, unique = true, length = 120)
    private String gatewayOrderId;

    @Column(name = "gateway_payment_id", length = 120)
    private String gatewayPaymentId;

    @Column(name = "failure_reason")
    private String failureReason;

    protected Payment() {
    }

    public Payment(Booking booking, BigDecimal amount, PaymentType paymentType,
                   String gatewayOrderId) {
        this.booking = booking;
        this.amount = amount;
        this.paymentType = paymentType;
        this.gatewayOrderId = gatewayOrderId;
    }

    // Only the gateway webhook (never the browser) is allowed to move a payment to SUCCESS.
    public void markSuccess(String gatewayPaymentId) {
        this.status = PaymentStatus.SUCCESS;
        this.gatewayPaymentId = gatewayPaymentId;
    }

    public void markFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
    }

    public Long getId() { return id; }
    public Booking getBooking() { return booking; }
    public BigDecimal getAmount() { return amount; }
    public PaymentType getPaymentType() { return paymentType; }
    public PaymentStatus getStatus() { return status; }
    public String getGatewayOrderId() { return gatewayOrderId; }
    public String getGatewayPaymentId() { return gatewayPaymentId; }
    public String getFailureReason() { return failureReason; }
}
