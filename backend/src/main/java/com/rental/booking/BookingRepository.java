package com.rental.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String reference);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Booking> findByVehicleOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

    @Query("""
           select count(b) > 0 from Booking b
           where b.vehicle.id = :vehicleId
             and b.status in (com.rental.booking.BookingStatus.PENDING_PAYMENT,
                              com.rental.booking.BookingStatus.CONFIRMED,
                              com.rental.booking.BookingStatus.ACTIVE)
             and b.startAt < :endAt
             and b.endAt > :startAt
           """)
    boolean existsOverlapping(@Param("vehicleId") Long vehicleId,
                              @Param("startAt") Instant startAt,
                              @Param("endAt") Instant endAt);

    @Query("""
           select b from Booking b
           where b.vehicle.id = :vehicleId
             and b.status in (com.rental.booking.BookingStatus.PENDING_PAYMENT,
                              com.rental.booking.BookingStatus.CONFIRMED,
                              com.rental.booking.BookingStatus.ACTIVE)
             and b.endAt > :from
           order by b.startAt
           """)
    List<Booking> findUpcomingForVehicle(@Param("vehicleId") Long vehicleId,
                                         @Param("from") Instant from);

    /*
     * Serialises concurrent booking attempts for one vehicle. Taking the vehicle row lock
     * before the overlap check means the check and the insert cannot interleave; the
     * exclusion constraint on bookings is the backstop if this is ever bypassed.
     */
    @Query(value = "SELECT id FROM vehicles WHERE id = :vehicleId FOR UPDATE", nativeQuery = true)
    Optional<Long> lockVehicle(@Param("vehicleId") Long vehicleId);

    @Modifying
    @Query("""
           update Booking b set b.status = com.rental.booking.BookingStatus.EXPIRED,
                                b.cancelledReason = 'Payment was not completed in time'
           where b.status = com.rental.booking.BookingStatus.PENDING_PAYMENT
             and b.createdAt < :cutoff
           """)
    int expireStaleBookings(@Param("cutoff") Instant cutoff);

    @Query("""
           select coalesce(sum(b.rentalAmount), 0) from Booking b
           where b.vehicle.owner.id = :ownerId
             and b.status = com.rental.booking.BookingStatus.COMPLETED
           """)
    BigDecimal totalEarningsForOwner(@Param("ownerId") Long ownerId);

    long countByStatus(BookingStatus status);

    @Query("select coalesce(sum(b.totalAmount), 0) from Booking b where b.status <> "
            + "com.rental.booking.BookingStatus.CANCELLED")
    BigDecimal grossBookingValue();
}
