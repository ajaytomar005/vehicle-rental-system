package com.rental.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId, Pageable pageable);

    Optional<Review> findByBookingId(Long bookingId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.vehicle.id = :vehicleId")
    BigDecimal averageRating(@Param("vehicleId") Long vehicleId);

    long countByVehicleId(Long vehicleId);
}
