package com.rental.booking;

import com.rental.common.ApiException;
import com.rental.common.PageResponse;
import com.rental.user.Role;
import com.rental.user.User;
import com.rental.vehicle.AvailabilityBlockRepository;
import com.rental.vehicle.Vehicle;
import com.rental.vehicle.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private static final Duration MIN_RENTAL = Duration.ofHours(1);
    private static final Duration MAX_RENTAL = Duration.ofDays(30);
    private static final Duration MAX_LEAD_TIME = Duration.ofDays(180);
    private static final String REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final AvailabilityBlockRepository blockRepository;
    private final PricingCalculator pricingCalculator;
    private final SecureRandom random = new SecureRandom();

    public BookingService(BookingRepository bookingRepository,
                          VehicleRepository vehicleRepository,
                          AvailabilityBlockRepository blockRepository,
                          PricingCalculator pricingCalculator) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.blockRepository = blockRepository;
        this.pricingCalculator = pricingCalculator;
    }

    @Transactional(readOnly = true)
    public BookingDtos.QuoteResponse quote(BookingDtos.QuoteRequest request) {
        Vehicle vehicle = loadBookableVehicle(request.vehicleId());
        validateWindow(request.startAt(), request.endAt());

        PriceQuote quote = pricingCalculator.quote(vehicle.getPricing(),
                request.startAt(), request.endAt());
        boolean available = isAvailable(vehicle.getId(), request.startAt(), request.endAt());

        return new BookingDtos.QuoteResponse(
                vehicle.getId(), request.startAt(), request.endAt(),
                quote.rateType(), quote.units(), quote.totalHours(),
                quote.rentalAmount(), quote.depositAmount(), quote.totalAmount(),
                available);
    }

    @Transactional
    public BookingDtos.BookingResponse create(User customer, BookingDtos.CreateRequest request) {
        if (!customer.isKycVerified()) {
            throw ApiException.forbidden(
                    "Your driving licence must be verified before you can book a vehicle.");
        }

        Vehicle vehicle = loadBookableVehicle(request.vehicleId());
        validateWindow(request.startAt(), request.endAt());

        if (vehicle.getOwner().getId().equals(customer.getId())) {
            throw ApiException.badRequest("You cannot book your own vehicle.");
        }

        // Serialise concurrent attempts on this vehicle before re-checking availability.
        bookingRepository.lockVehicle(vehicle.getId());

        if (!isAvailable(vehicle.getId(), request.startAt(), request.endAt())) {
            throw ApiException.conflict(
                    "This vehicle is not available for the selected dates.");
        }

        PriceQuote quote = pricingCalculator.quote(vehicle.getPricing(),
                request.startAt(), request.endAt());
        Booking booking = new Booking(nextReference(), customer, vehicle,
                request.startAt(), request.endAt(), quote);
        bookingRepository.save(booking);

        log.info("Booking {} created for vehicle {} by user {}",
                booking.getBookingReference(), vehicle.getId(), customer.getId());
        return BookingDtos.BookingResponse.from(booking);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingDtos.BookingResponse> myBookings(Long userId, Pageable pageable) {
        return PageResponse.from(
                bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable),
                BookingDtos.BookingResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingDtos.BookingResponse> ownerBookings(Long ownerId, Pageable pageable) {
        return PageResponse.from(
                bookingRepository.findByVehicleOwnerIdOrderByCreatedAtDesc(ownerId, pageable),
                BookingDtos.BookingResponse::from);
    }

    @Transactional(readOnly = true)
    public BookingDtos.BookingResponse get(User actor, Long bookingId) {
        return BookingDtos.BookingResponse.from(loadVisibleBooking(actor, bookingId));
    }

    @Transactional(readOnly = true)
    public List<BookingDtos.BusyWindow> busyWindows(Long vehicleId) {
        List<BookingDtos.BusyWindow> windows = new java.util.ArrayList<>(
                bookingRepository.findUpcomingForVehicle(vehicleId, Instant.now()).stream()
                        .map(b -> new BookingDtos.BusyWindow(b.getStartAt(), b.getEndAt()))
                        .toList());
        blockRepository.findByVehicleIdOrderByStartAtAsc(vehicleId).stream()
                .filter(b -> b.getEndAt().isAfter(Instant.now()))
                .forEach(b -> windows.add(new BookingDtos.BusyWindow(b.getStartAt(), b.getEndAt())));
        windows.sort(java.util.Comparator.comparing(BookingDtos.BusyWindow::startAt));
        return windows;
    }

    @Transactional
    public BookingDtos.BookingResponse cancel(User actor, Long bookingId, String reason) {
        Booking booking = loadVisibleBooking(actor, bookingId);

        if (booking.getStatus() == BookingStatus.ACTIVE) {
            throw ApiException.badRequest(
                    "This rental is already in progress and cannot be cancelled.");
        }
        if (!booking.getStatus().blocksSlot()) {
            throw ApiException.badRequest("This booking can no longer be cancelled.");
        }

        booking.cancel(reason == null || reason.isBlank() ? "Cancelled by user" : reason);
        return BookingDtos.BookingResponse.from(booking);
    }

    /** Owner or admin hands the vehicle over; the rental clock starts here. */
    @Transactional
    public BookingDtos.BookingResponse markPickedUp(User actor, Long bookingId) {
        Booking booking = loadManagedBooking(actor, bookingId);
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw ApiException.badRequest("Only a confirmed booking can be picked up.");
        }
        booking.markPickedUp();
        return BookingDtos.BookingResponse.from(booking);
    }

    @Transactional
    public BookingDtos.BookingResponse markReturned(User actor, Long bookingId) {
        Booking booking = loadManagedBooking(actor, bookingId);
        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw ApiException.badRequest("Only an active rental can be returned.");
        }
        booking.markReturned();
        return BookingDtos.BookingResponse.from(booking);
    }

    private boolean isAvailable(Long vehicleId, Instant startAt, Instant endAt) {
        return !bookingRepository.existsOverlapping(vehicleId, startAt, endAt)
                && !blockRepository.existsOverlap(vehicleId, startAt, endAt);
    }

    private Vehicle loadBookableVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findDetailById(vehicleId)
                .orElseThrow(() -> ApiException.notFound("Vehicle"));
        if (!vehicle.isBookable()) {
            throw ApiException.badRequest("This vehicle is not currently available to rent.");
        }
        if (vehicle.getPricing() == null) {
            throw ApiException.badRequest("This vehicle has no pricing configured yet.");
        }
        return vehicle;
    }

    private void validateWindow(Instant startAt, Instant endAt) {
        if (!endAt.isAfter(startAt)) {
            throw ApiException.badRequest("The return time must be after the pickup time.");
        }
        Duration duration = Duration.between(startAt, endAt);
        if (duration.compareTo(MIN_RENTAL) < 0) {
            throw ApiException.badRequest("The minimum rental duration is one hour.");
        }
        if (duration.compareTo(MAX_RENTAL) > 0) {
            throw ApiException.badRequest("The maximum rental duration is 30 days.");
        }
        if (startAt.isAfter(Instant.now().plus(MAX_LEAD_TIME))) {
            throw ApiException.badRequest("Bookings can be made up to 180 days in advance.");
        }
    }

    private Booking loadVisibleBooking(User actor, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Booking"));
        boolean allowed = actor.getRole() == Role.ADMIN
                || booking.getUser().getId().equals(actor.getId())
                || booking.getVehicle().getOwner().getId().equals(actor.getId());
        if (!allowed) {
            throw ApiException.forbidden("You do not have access to this booking.");
        }
        return booking;
    }

    private Booking loadManagedBooking(User actor, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Booking"));
        boolean allowed = actor.getRole() == Role.ADMIN
                || booking.getVehicle().getOwner().getId().equals(actor.getId());
        if (!allowed) {
            throw ApiException.forbidden("Only the vehicle owner can update this booking.");
        }
        return booking;
    }

    private String nextReference() {
        StringBuilder sb = new StringBuilder("VR");
        for (int i = 0; i < 8; i++) {
            sb.append(REFERENCE_ALPHABET.charAt(random.nextInt(REFERENCE_ALPHABET.length())));
        }
        return sb.toString();
    }
}
