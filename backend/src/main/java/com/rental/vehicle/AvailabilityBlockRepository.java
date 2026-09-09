package com.rental.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface AvailabilityBlockRepository extends JpaRepository<AvailabilityBlock, Long> {

    List<AvailabilityBlock> findByVehicleIdOrderByStartAtAsc(Long vehicleId);

    @Query("""
           select count(b) > 0 from AvailabilityBlock b
           where b.vehicle.id = :vehicleId
             and b.startAt < :endAt
             and b.endAt > :startAt
           """)
    boolean existsOverlap(@Param("vehicleId") Long vehicleId,
                          @Param("startAt") Instant startAt,
                          @Param("endAt") Instant endAt);
}
