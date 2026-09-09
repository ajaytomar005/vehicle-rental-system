package com.rental.user;

import com.rental.security.CurrentUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile")
public class ProfileController {

    private final AuthService authService;
    private final LicenseService licenseService;
    private final CurrentUser currentUser;

    public ProfileController(AuthService authService, LicenseService licenseService,
                             CurrentUser currentUser) {
        this.authService = authService;
        this.licenseService = licenseService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    public UserDtos.UserResponse me() {
        return UserDtos.UserResponse.from(currentUser.require());
    }

    @PutMapping("/me")
    public UserDtos.UserResponse update(@Valid @RequestBody UserDtos.UpdateProfileRequest request) {
        return authService.updateProfile(currentUser.require(), request);
    }

    @PostMapping("/password")
    public void changePassword(@Valid @RequestBody UserDtos.ChangePasswordRequest request) {
        authService.changePassword(currentUser.require(), request);
    }

    @PostMapping("/license")
    public UserDtos.LicenseResponse submitLicense(@Valid @RequestBody UserDtos.LicenseRequest request) {
        return licenseService.submit(currentUser.require(), request);
    }

    @GetMapping("/license")
    public UserDtos.LicenseResponse myLicense() {
        return licenseService.mine(currentUser.requireId());
    }
}
