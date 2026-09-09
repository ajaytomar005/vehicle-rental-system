package com.rental.vehicle;

public enum VehicleType {
    CAR, BIKE, SCOOTER;

    public boolean isTwoWheeler() {
        return this == BIKE || this == SCOOTER;
    }
}
