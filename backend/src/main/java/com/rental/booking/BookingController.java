package com.rental.booking;

import com.rental.common.PageResponse;
import com.rental.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUser currentUser;

    public BookingController(BookingService bookingService, CurrentUser currentUser) {
        this.bookingService = bookingService;
        this.currentUser = currentUser;
    }

    @PostMapping("/quote")
    @Operation(summary = "Price a rental window without reserving it")
    public BookingDtos.QuoteResponse quote(@Valid @RequestBody BookingDtos.QuoteRequest request) {
        return bookingService.quote(request);
    }

    @GetMapping("/vehicle/{vehicleId}/busy")
    @Operation(summary = "Windows in which the vehicle is already taken")
    public List<BookingDtos.BusyWindow> busy(@PathVariable Long vehicleId) {
        return bookingService.busyWindows(vehicleId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Reserve a vehicle; the booking awaits payment")
    public ResponseEntity<BookingDtos.BookingResponse> create(
            @Valid @RequestBody BookingDtos.CreateRequest request) {
        var booking = bookingService.create(currentUser.require(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/me")
    public PageResponse<BookingDtos.BookingResponse> myBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return bookingService.myBookings(currentUser.requireId(), pageable);
    }

    @GetMapping("/owner")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public PageResponse<BookingDtos.BookingResponse> ownerBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        return bookingService.ownerBookings(currentUser.requireId(), pageable);
    }

    @GetMapping("/{id}")
    public BookingDtos.BookingResponse get(@PathVariable Long id) {
        return bookingService.get(currentUser.require(), id);
    }

    @PostMapping("/{id}/cancel")
    public BookingDtos.BookingResponse cancel(@PathVariable Long id,
                                              @RequestBody(required = false)
                                              BookingDtos.CancelRequest request) {
        String reason = request == null ? null : request.reason();
        return bookingService.cancel(currentUser.require(), id, reason);
    }

    @PostMapping("/{id}/pickup")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public BookingDtos.BookingResponse pickup(@PathVariable Long id) {
        return bookingService.markPickedUp(currentUser.require(), id);
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public BookingDtos.BookingResponse markReturned(@PathVariable Long id) {
        return bookingService.markReturned(currentUser.require(), id);
    }
}
