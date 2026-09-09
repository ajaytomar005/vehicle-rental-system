package com.rental.booking;

import com.rental.common.BaseEntity;
import com.rental.user.User;
import com.rental.vehicle.Vehicle;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings")
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", nullable = false, unique = true, length = 20)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "rate_type", nullable = false, length = 20)
    private RateType rateType;

    @Column(nullable = false)
    private Integer units;

    @Column(name = "rental_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal rentalAmount;

    @Column(name = "deposit_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;

    @Column(name = "cancelled_reason")
    private String cancelledReason;

    @Column(name = "picked_up_at")
    private Instant pickedUpAt;

    @Column(name = "returned_at")
    private Instant returnedAt;

    protected Booking() {
    }

    public Booking(String bookingReference, User user, Vehicle vehicle,
                   Instant startAt, Instant endAt, PriceQuote quote) {
        this.bookingReference = bookingReference;
        this.user = user;
        this.vehicle = vehicle;
        this.startAt = startAt;
        this.endAt = endAt;
        this.rateType = quote.rateType();
        this.units = quote.units();
        this.rentalAmount = quote.rentalAmount();
        this.depositAmount = quote.depositAmount();
        this.totalAmount = quote.totalAmount();
    }

    public void markConfirmed() {
        this.status = BookingStatus.CONFIRMED;
    }

    public void markPickedUp() {
        this.status = BookingStatus.ACTIVE;
        this.pickedUpAt = Instant.now();
    }

    public void markReturned() {
        this.status = BookingStatus.COMPLETED;
        this.returnedAt = Instant.now();
    }

    public void cancel(String reason) {
        this.status = BookingStatus.CANCELLED;
        this.cancelledReason = reason;
    }

    public void expire() {
        this.status = BookingStatus.EXPIRED;
        this.cancelledReason = "Payment was not completed in time";
    }

    public Long getId() { return id; }
    public String getBookingReference() { return bookingReference; }
    public User getUser() { return user; }
    public Vehicle getVehicle() { return vehicle; }
    public Instant getStartAt() { return startAt; }
    public Instant getEndAt() { return endAt; }
    public RateType getRateType() { return rateType; }
    public Integer getUnits() { return units; }
    public BigDecimal getRentalAmount() { return rentalAmount; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BookingStatus getStatus() { return status; }
    public String getCancelledReason() { return cancelledReason; }
    public Instant getPickedUpAt() { return pickedUpAt; }
    public Instant getReturnedAt() { return returnedAt; }
}
