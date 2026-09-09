package com.rental.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LicenseRepository extends JpaRepository<License, Long> {

    Optional<License> findByUserId(Long userId);

    Page<License> findByStatus(LicenseStatus status, Pageable pageable);
}
