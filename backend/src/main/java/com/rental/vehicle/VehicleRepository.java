package com.rental.vehicle;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Page<Vehicle> findByOwnerId(Long ownerId, Pageable pageable);

    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);

    boolean existsByRegistrationNoIgnoreCase(String registrationNo);

    @Query("select v from Vehicle v left join fetch v.images left join fetch v.pricing "
            + "left join fetch v.owner where v.id = :id")
    Optional<Vehicle> findDetailById(@Param("id") Long id);

    @Query(value = """
            SELECT DISTINCT ON (v.id) v.city
            FROM vehicles v
            WHERE v.status = 'ACTIVE'
            """, nativeQuery = true)
    List<String> findActiveCities();

    /*
     * Search intentionally runs as a native query: the date filter needs range overlap
     * semantics against both bookings and owner blackout windows, which is far clearer
     * in SQL than in JPQL. Passing NULL for any filter disables that filter.
     */
    @Query(value = """
            SELECT v.* FROM vehicles v
            JOIN pricing p ON p.vehicle_id = v.id
            WHERE v.status = 'ACTIVE'
              AND (:city IS NULL OR lower(v.city) = lower(cast(:city AS text)))
              AND (:vehicleType IS NULL OR v.vehicle_type = cast(:vehicleType AS text))
              AND (:fuelType IS NULL OR v.fuel_type = cast(:fuelType AS text))
              AND (:minSeats IS NULL OR v.seats >= :minSeats)
              AND (:maxDailyRate IS NULL OR p.daily_rate <= :maxDailyRate)
              AND (:search IS NULL OR (v.brand || ' ' || v.model) ILIKE '%' || cast(:search AS text) || '%')
              AND (
                    cast(:startAt AS timestamptz) IS NULL
                 OR NOT EXISTS (
                        SELECT 1 FROM bookings b
                        WHERE b.vehicle_id = v.id
                          AND b.status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE')
                          AND tstzrange(b.start_at, b.end_at)
                              && tstzrange(cast(:startAt AS timestamptz), cast(:endAt AS timestamptz))
                    )
              )
              AND (
                    cast(:startAt AS timestamptz) IS NULL
                 OR NOT EXISTS (
                        SELECT 1 FROM availability_blocks ab
                        WHERE ab.vehicle_id = v.id
                          AND tstzrange(ab.start_at, ab.end_at)
                              && tstzrange(cast(:startAt AS timestamptz), cast(:endAt AS timestamptz))
                    )
              )
            """,
            countQuery = """
            SELECT count(*) FROM vehicles v
            JOIN pricing p ON p.vehicle_id = v.id
            WHERE v.status = 'ACTIVE'
              AND (:city IS NULL OR lower(v.city) = lower(cast(:city AS text)))
              AND (:vehicleType IS NULL OR v.vehicle_type = cast(:vehicleType AS text))
              AND (:fuelType IS NULL OR v.fuel_type = cast(:fuelType AS text))
              AND (:minSeats IS NULL OR v.seats >= :minSeats)
              AND (:maxDailyRate IS NULL OR p.daily_rate <= :maxDailyRate)
              AND (:search IS NULL OR (v.brand || ' ' || v.model) ILIKE '%' || cast(:search AS text) || '%')
              AND (
                    cast(:startAt AS timestamptz) IS NULL
                 OR NOT EXISTS (
                        SELECT 1 FROM bookings b
                        WHERE b.vehicle_id = v.id
                          AND b.status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE')
                          AND tstzrange(b.start_at, b.end_at)
                              && tstzrange(cast(:startAt AS timestamptz), cast(:endAt AS timestamptz))
                    )
              )
              AND (
                    cast(:startAt AS timestamptz) IS NULL
                 OR NOT EXISTS (
                        SELECT 1 FROM availability_blocks ab
                        WHERE ab.vehicle_id = v.id
                          AND tstzrange(ab.start_at, ab.end_at)
                              && tstzrange(cast(:startAt AS timestamptz), cast(:endAt AS timestamptz))
                    )
              )
            """,
            nativeQuery = true)
    Page<Vehicle> search(@Param("city") String city,
                         @Param("vehicleType") String vehicleType,
                         @Param("fuelType") String fuelType,
                         @Param("minSeats") Integer minSeats,
                         @Param("maxDailyRate") java.math.BigDecimal maxDailyRate,
                         @Param("search") String search,
                         @Param("startAt") Instant startAt,
                         @Param("endAt") Instant endAt,
                         Pageable pageable);
}
