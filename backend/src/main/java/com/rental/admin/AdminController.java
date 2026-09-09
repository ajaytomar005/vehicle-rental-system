package com.rental.admin;

import com.rental.booking.BookingRepository;
import com.rental.booking.BookingStatus;
import com.rental.common.PageResponse;
import com.rental.user.LicenseService;
import com.rental.user.UserDtos;
import com.rental.user.UserRepository;
import com.rental.vehicle.VehicleDtos;
import com.rental.vehicle.VehicleRepository;
import com.rental.vehicle.VehicleService;
import com.rental.vehicle.VehicleStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin")
public class AdminController {

    private final VehicleService vehicleService;
    private final LicenseService licenseService;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;

    public AdminController(VehicleService vehicleService, LicenseService licenseService,
                           UserRepository userRepository, VehicleRepository vehicleRepository,
                           BookingRepository bookingRepository) {
        this.vehicleService = vehicleService;
        this.licenseService = licenseService;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/stats")
    public AdminDtos.DashboardStats stats() {
        return new AdminDtos.DashboardStats(
                userRepository.count(),
                vehicleRepository.count(),
                vehicleRepository.findByStatus(VehicleStatus.ACTIVE, PageRequest.of(0, 1))
                        .getTotalElements(),
                vehicleRepository.findByStatus(VehicleStatus.PENDING_APPROVAL, PageRequest.of(0, 1))
                        .getTotalElements(),
                licenseService.pending(PageRequest.of(0, 1)).totalElements(),
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.COMPLETED),
                bookingRepository.grossBookingValue()
        );
    }

    @GetMapping("/vehicles/pending")
    public PageResponse<VehicleDtos.VehicleResponse> pendingVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return vehicleService.pendingApproval(PageRequest.of(page, Math.min(size, 50)));
    }

    @PostMapping("/vehicles/{id}/approve")
    public VehicleDtos.VehicleResponse approveVehicle(@PathVariable Long id) {
        return vehicleService.approve(id);
    }

    @PostMapping("/vehicles/{id}/reject")
    public VehicleDtos.VehicleResponse rejectVehicle(@PathVariable Long id,
                                                      @Valid @RequestBody VehicleDtos.RejectRequest request) {
        return vehicleService.reject(id, request.reason());
    }

    @GetMapping("/licenses/pending")
    public PageResponse<UserDtos.LicenseResponse> pendingLicenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return licenseService.pending(PageRequest.of(page, Math.min(size, 50)));
    }

    @PostMapping("/licenses/{id}/decide")
    public UserDtos.LicenseResponse decideLicense(@PathVariable Long id,
            @Valid @RequestBody UserDtos.LicenseDecisionRequest request) {
        return licenseService.decide(id, request);
    }
}
