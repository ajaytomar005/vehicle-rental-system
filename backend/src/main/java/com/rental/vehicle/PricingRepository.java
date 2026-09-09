package com.rental.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingRepository extends JpaRepository<Pricing, Long> {

    Optional<Pricing> findByVehicleId(Long vehicleId);
}
