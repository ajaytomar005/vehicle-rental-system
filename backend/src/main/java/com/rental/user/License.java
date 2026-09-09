package com.rental.user;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "licenses")
public class License {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", nullable = false, length = 40)
    private String licenseNumber;

    @Column(name = "document_url", nullable = false, length = 500)
    private String documentUrl;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LicenseStatus status = LicenseStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected License() {
    }

    public License(User user, String licenseNumber, String documentUrl, LocalDate expiryDate) {
        this.user = user;
        this.licenseNumber = licenseNumber;
        this.documentUrl = documentUrl;
        this.expiryDate = expiryDate;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void approve() {
        this.status = LicenseStatus.APPROVED;
        this.rejectionReason = null;
        this.reviewedAt = Instant.now();
    }

    public void reject(String reason) {
        this.status = LicenseStatus.REJECTED;
        this.rejectionReason = reason;
        this.reviewedAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public LicenseStatus getStatus() { return status; }
    public void setStatus(LicenseStatus status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public Instant getReviewedAt() { return reviewedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
