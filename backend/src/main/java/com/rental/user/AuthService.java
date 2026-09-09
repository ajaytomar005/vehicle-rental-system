package com.rental.user;

import com.rental.common.ApiException;
import com.rental.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public UserDtos.AuthResponse register(UserDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists.");
        }

        // Admin accounts are never self-registered.
        Role role = request.role() == null || request.role() == Role.ADMIN
                ? Role.CUSTOMER
                : request.role();

        User user = new User(request.fullName().trim(), email, request.phone().trim(),
                passwordEncoder.encode(request.password()), role);
        userRepository.save(user);
        log.info("Registered user {} with role {}", user.getId(), role);

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDtos.AuthResponse login(UserDtos.LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.email().trim().toLowerCase(), request.password()));
        } catch (AuthenticationException ex) {
            throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Invalid email or password.");
        }

        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> ApiException.notFound("Account"));
        return buildAuthResponse(user);
    }

    @Transactional
    public UserDtos.UserResponse updateProfile(User user, UserDtos.UpdateProfileRequest request) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> ApiException.notFound("Account"));
        managed.setFullName(request.fullName().trim());
        managed.setPhone(request.phone().trim());
        return UserDtos.UserResponse.from(managed);
    }

    @Transactional
    public void changePassword(User user, UserDtos.ChangePasswordRequest request) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> ApiException.notFound("Account"));
        if (!passwordEncoder.matches(request.currentPassword(), managed.getPasswordHash())) {
            throw ApiException.badRequest("Your current password is incorrect.");
        }
        managed.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    private UserDtos.AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(),
                user.getRole().name());
        return new UserDtos.AuthResponse(token, "Bearer", jwtService.getTokenLifetimeSeconds(),
                UserDtos.UserResponse.from(user));
    }
}
