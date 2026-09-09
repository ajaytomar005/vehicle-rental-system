package com.rental.vehicle;

import com.rental.common.ApiException;
import com.rental.common.PageResponse;
import com.rental.user.Role;
import com.rental.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VehicleService {

    private static final Logger log = LoggerFactory.getLogger(VehicleService.class);

    private final VehicleRepository vehicleRepository;
    private final PricingRepository pricingRepository;

    public VehicleService(VehicleRepository vehicleRepository, PricingRepository pricingRepository) {
        this.vehicleRepository = vehicleRepository;
        this.pricingRepository = pricingRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<VehicleDtos.VehicleResponse> search(String city, VehicleType type,
            FuelType fuelType, Integer minSeats, java.math.BigDecimal maxDailyRate, String q,
            java.time.Instant startAt, java.time.Instant endAt, Pageable pageable) {
        var page = vehicleRepository.search(
                city, type == null ? null : type.name(),
                fuelType == null ? null : fuelType.name(),
                minSeats, maxDailyRate, q, startAt, endAt, pageable);
        return PageResponse.from(page, VehicleDtos.VehicleResponse::from);
    }

    @Transactional(readOnly = true)
    public VehicleDtos.VehicleResponse get(Long id) {
        Vehicle vehicle = vehicleRepository.findDetailById(id)
                .orElseThrow(() -> ApiException.notFound("Vehicle"));
        return VehicleDtos.VehicleResponse.from(vehicle);
    }

    @Transactional(readOnly = true)
    public List<String> activeCities() {
        return vehicleRepository.findActiveCities();
    }

    @Transactional
    public VehicleDtos.VehicleResponse create(User owner, VehicleDtos.CreateRequest request) {
        if (vehicleRepository.existsByRegistrationNoIgnoreCase(request.registrationNo())) {
            throw ApiException.conflict("A vehicle with this registration number already exists.");
        }
        if (request.vehicleType() == VehicleType.CAR
                && (request.seats() == null || request.seats() < 2)) {
            throw ApiException.badRequest("Cars must have a seat count of at least 2.");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setOwner(owner);
        vehicle.setVehicleType(request.vehicleType());
        vehicle.setBrand(request.brand().trim());
        vehicle.setModel(request.model().trim());
        vehicle.setYear(request.year());
        vehicle.setRegistrationNo(request.registrationNo().trim().toUpperCase());
        vehicle.setSeats(request.vehicleType().isTwoWheeler() ? null : request.seats());
        vehicle.setFuelType(request.fuelType());
        vehicle.setTransmission(request.transmission());
        vehicle.setCity(request.city().trim());
        vehicle.setAddress(request.address());
        vehicle.setDescription(request.description());
        vehicle.setStatus(VehicleStatus.PENDING_APPROVAL);

        Pricing pricing = new Pricing(vehicle, request.pricing().hourlyRate(),
                request.pricing().dailyRate(), request.pricing().weeklyRate(),
                request.pricing().securityDeposit());
        vehicle.setPricing(pricing);

        List<String> imageUrls = request.imageUrls() == null ? List.of() : request.imageUrls();
        for (int i = 0; i < imageUrls.size(); i++) {
            vehicle.addImage(imageUrls.get(i), i == 0, i);
        }

        vehicleRepository.save(vehicle);
        log.info("Vehicle {} created by owner {}", vehicle.getId(), owner.getId());
        return VehicleDtos.VehicleResponse.from(vehicle);
    }

    @Transactional
    public VehicleDtos.VehicleResponse update(User actor, Long vehicleId,
                                              VehicleDtos.UpdateRequest request) {
        Vehicle vehicle = loadOwned(actor, vehicleId);

        vehicle.setSeats(vehicle.getVehicleType().isTwoWheeler() ? null : request.seats());
        vehicle.setCity(request.city().trim());
        vehicle.setAddress(request.address());
        vehicle.setDescription(request.description());

        Pricing pricing = vehicle.getPricing();
        pricing.setHourlyRate(request.pricing().hourlyRate());
        pricing.setDailyRate(request.pricing().dailyRate());
        pricing.setWeeklyRate(request.pricing().weeklyRate());
        pricing.setSecurityDeposit(request.pricing().securityDeposit());

        return VehicleDtos.VehicleResponse.from(vehicle);
    }

    @Transactional
    public void setActive(User actor, Long vehicleId, boolean active) {
        Vehicle vehicle = loadOwned(actor, vehicleId);
        if (vehicle.getStatus() != VehicleStatus.ACTIVE
                && vehicle.getStatus() != VehicleStatus.INACTIVE) {
            throw ApiException.badRequest(
                    "Only an approved vehicle can be activated or deactivated.");
        }
        vehicle.setStatus(active ? VehicleStatus.ACTIVE : VehicleStatus.INACTIVE);
    }

    @Transactional(readOnly = true)
    public PageResponse<VehicleDtos.VehicleResponse> mine(Long ownerId, Pageable pageable) {
        return PageResponse.from(vehicleRepository.findByOwnerId(ownerId, pageable),
                VehicleDtos.VehicleResponse::from);
    }

    @Transactional(readOnly = true)
    public PageResponse<VehicleDtos.VehicleResponse> pendingApproval(Pageable pageable) {
        return PageResponse.from(
                vehicleRepository.findByStatus(VehicleStatus.PENDING_APPROVAL, pageable),
                VehicleDtos.VehicleResponse::from);
    }

    @Transactional
    public VehicleDtos.VehicleResponse approve(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> ApiException.notFound("Vehicle"));
        vehicle.setStatus(VehicleStatus.ACTIVE);
        log.info("Vehicle {} approved", vehicleId);
        return VehicleDtos.VehicleResponse.from(vehicle);
    }

    @Transactional
    public VehicleDtos.VehicleResponse reject(Long vehicleId, String reason) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> ApiException.notFound("Vehicle"));
        vehicle.setStatus(VehicleStatus.REJECTED);
        vehicle.setDescription((vehicle.getDescription() == null ? "" :
                vehicle.getDescription() + "\n\n") + "Rejected: " + reason);
        log.info("Vehicle {} rejected: {}", vehicleId, reason);
        return VehicleDtos.VehicleResponse.from(vehicle);
    }

    private Vehicle loadOwned(User actor, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findDetailById(vehicleId)
                .orElseThrow(() -> ApiException.notFound("Vehicle"));
        boolean allowed = actor.getRole() == Role.ADMIN
                || vehicle.getOwner().getId().equals(actor.getId());
        if (!allowed) {
            throw ApiException.forbidden("You do not own this vehicle.");
        }
        return vehicle;
    }
}
