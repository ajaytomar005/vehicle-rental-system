package com.rental.vehicle;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "availability_blocks")
public class AvailabilityBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(length = 160)
    private String reason;

    protected AvailabilityBlock() {
    }

    public AvailabilityBlock(Vehicle vehicle, Instant startAt, Instant endAt, String reason) {
        this.vehicle = vehicle;
        this.startAt = startAt;
        this.endAt = endAt;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public Instant getStartAt() { return startAt; }
    public Instant getEndAt() { return endAt; }
    public String getReason() { return reason; }
}
