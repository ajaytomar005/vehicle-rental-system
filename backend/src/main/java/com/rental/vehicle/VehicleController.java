package com.rental.vehicle;

import com.rental.common.PageResponse;
import com.rental.security.CurrentUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@Tag(name = "Vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final CurrentUser currentUser;

    public VehicleController(VehicleService vehicleService, CurrentUser currentUser) {
        this.vehicleService = vehicleService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public PageResponse<VehicleDtos.VehicleResponse> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) VehicleType type,
            @RequestParam(required = false) FuelType fuel,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) BigDecimal maxDailyRate,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Instant startAt,
            @RequestParam(required = false) Instant endAt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.DESC, "created_at"));
        return vehicleService.search(city, type, fuel, minSeats, maxDailyRate, q,
                startAt, endAt, pageable);
    }

    @GetMapping("/cities")
    public List<String> cities() {
        return vehicleService.activeCities();
    }

    @GetMapping("/{id}")
    public VehicleDtos.VehicleResponse get(@PathVariable Long id) {
        return vehicleService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<VehicleDtos.VehicleResponse> create(
            @Valid @RequestBody VehicleDtos.CreateRequest request) {
        var created = vehicleService.create(currentUser.require(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public VehicleDtos.VehicleResponse update(@PathVariable Long id,
                                              @Valid @RequestBody VehicleDtos.UpdateRequest request) {
        return vehicleService.update(currentUser.require(), id, request);
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public void activate(@PathVariable Long id) {
        vehicleService.setActive(currentUser.require(), id, true);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public void deactivate(@PathVariable Long id) {
        vehicleService.setActive(currentUser.require(), id, false);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public PageResponse<VehicleDtos.VehicleResponse> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return vehicleService.mine(currentUser.requireId(), PageRequest.of(page, Math.min(size, 50)));
    }
}
