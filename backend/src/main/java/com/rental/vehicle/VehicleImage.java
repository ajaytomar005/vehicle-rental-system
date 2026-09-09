package com.rental.vehicle;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle_images")
public class VehicleImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected VehicleImage() {
    }

    VehicleImage(Vehicle vehicle, String imageUrl, boolean primary, int sortOrder) {
        this.vehicle = vehicle;
        this.imageUrl = imageUrl;
        this.primary = primary;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public String getImageUrl() { return imageUrl; }
    public boolean isPrimary() { return primary; }
    public int getSortOrder() { return sortOrder; }
}
