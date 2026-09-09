package com.rental.user;

import com.rental.common.ApiException;
import com.rental.common.PageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LicenseService {

    private static final Logger log = LoggerFactory.getLogger(LicenseService.class);

    private final LicenseRepository licenseRepository;
    private final UserRepository userRepository;

    public LicenseService(LicenseRepository licenseRepository, UserRepository userRepository) {
        this.licenseRepository = licenseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public UserDtos.LicenseResponse submit(User user, UserDtos.LicenseRequest request) {
        License license = licenseRepository.findByUserId(user.getId()).orElse(null);

        if (license == null) {
            license = new License(user, request.licenseNumber(), request.documentUrl(),
                    request.expiryDate());
        } else if (license.getStatus() == LicenseStatus.APPROVED) {
            throw ApiException.badRequest("Your licence is already verified.");
        } else {
            license.setLicenseNumber(request.licenseNumber());
            license.setDocumentUrl(request.documentUrl());
            license.setExpiryDate(request.expiryDate());
            license.setStatus(LicenseStatus.PENDING);
        }

        licenseRepository.save(license);

        User managed = userRepository.findById(user.getId()).orElseThrow();
        managed.setKycStatus(KycStatus.PENDING);

        return UserDtos.LicenseResponse.from(license);
    }

    @Transactional(readOnly = true)
    public UserDtos.LicenseResponse mine(Long userId) {
        License license = licenseRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Licence"));
        return UserDtos.LicenseResponse.from(license);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDtos.LicenseResponse> pending(Pageable pageable) {
        return PageResponse.from(licenseRepository.findByStatus(LicenseStatus.PENDING, pageable),
                UserDtos.LicenseResponse::from);
    }

    @Transactional
    public UserDtos.LicenseResponse decide(Long licenseId, UserDtos.LicenseDecisionRequest request) {
        License license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> ApiException.notFound("Licence"));

        User user = userRepository.findById(license.getUser().getId())
                .orElseThrow(() -> ApiException.notFound("Account"));

        if (Boolean.TRUE.equals(request.approve())) {
            license.approve();
            user.setKycStatus(KycStatus.VERIFIED);
        } else {
            license.reject(request.reason() == null || request.reason().isBlank()
                    ? "Document could not be verified" : request.reason());
            user.setKycStatus(KycStatus.REJECTED);
        }

        log.info("Licence {} for user {} decided: approved={}", licenseId, user.getId(),
                request.approve());
        return UserDtos.LicenseResponse.from(license);
    }
}
