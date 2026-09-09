package com.rental.config;

import com.rental.user.KycStatus;
import com.rental.user.Role;
import com.rental.user.User;
import com.rental.user.UserRepository;
import com.rental.vehicle.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Fills an empty database with a handful of demo users and vehicles so the UI has
 * something to show right after first run. Disabled by setting SEED_DEMO_DATA=false.
 */
@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_PASSWORD = "Password123!";

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedEnabled;

    public DemoDataSeeder(UserRepository userRepository, VehicleRepository vehicleRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.seed-demo-data:true}") boolean seedEnabled) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || userRepository.count() > 0) {
            return;
        }

        save("Site Admin", "admin@rental.local", "9990000001", Role.ADMIN, true);
        User owner = save("Rohan Mehta", "owner@rental.local", "9990000002", Role.OWNER, true);
        save("Asha Verma", "customer@rental.local", "9990000003", Role.CUSTOMER, true);

        Vehicle car = vehicle(owner, VehicleType.CAR, "Hyundai", "Creta", 2023,
                "MH12AB1234", 5, FuelType.PETROL, Transmission.AUTOMATIC, "Pune",
                new BigDecimal("120"), new BigDecimal("2200"), new BigDecimal("13000"),
                new BigDecimal("5000"));
        Vehicle scooter = vehicle(owner, VehicleType.SCOOTER, "Honda", "Activa", 2022,
                "MH12CD5678", null, FuelType.PETROL, null, "Pune",
                new BigDecimal("30"), new BigDecimal("400"), new BigDecimal("2200"),
                new BigDecimal("1000"));
        Vehicle bike = vehicle(owner, VehicleType.BIKE, "Royal Enfield", "Classic 350", 2024,
                "MH14EF9012", null, FuelType.PETROL, Transmission.MANUAL, "Mumbai",
                new BigDecimal("60"), new BigDecimal("900"), new BigDecimal("5200"),
                new BigDecimal("3000"));

        vehicleRepository.saveAll(List.of(car, scooter, bike));
        log.info("Seeded demo data: admin/owner/customer accounts and 3 vehicles "
                + "(password for all demo accounts: {})", DEMO_PASSWORD);
    }

    private User save(String name, String email, String phone, Role role, boolean verified) {
        User user = new User(name, email, phone, passwordEncoder.encode(DEMO_PASSWORD), role);
        if (verified) {
            user.setKycStatus(KycStatus.VERIFIED);
        }
        return userRepository.save(user);
    }

    private Vehicle vehicle(User owner, VehicleType type, String brand, String model, int year,
                            String reg, Integer seats, FuelType fuel, Transmission transmission,
                            String city, BigDecimal hourly, BigDecimal daily, BigDecimal weekly,
                            BigDecimal deposit) {
        Vehicle v = new Vehicle();
        v.setOwner(owner);
        v.setVehicleType(type);
        v.setBrand(brand);
        v.setModel(model);
        v.setYear(year);
        v.setRegistrationNo(reg);
        v.setSeats(seats);
        v.setFuelType(fuel);
        v.setTransmission(transmission);
        v.setCity(city);
        v.setStatus(VehicleStatus.ACTIVE);
        v.setDescription("Well maintained " + brand + " " + model + ", ready for your next trip.");
        v.setPricing(new Pricing(v, hourly, daily, weekly, deposit));
        v.addImage(stockPhotoFor(type), true, 0);
        return v;
    }

    private String stockPhotoFor(VehicleType type) {
        return switch (type) {
            case CAR -> "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800";
            case BIKE -> "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
            case SCOOTER -> "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800";
        };
    }
}
