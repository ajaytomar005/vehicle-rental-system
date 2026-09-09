package com.rental.review;

import com.rental.booking.Booking;
import com.rental.booking.BookingRepository;
import com.rental.booking.BookingStatus;
import com.rental.common.ApiException;
import com.rental.common.PageResponse;
import com.rental.user.User;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public ReviewDtos.ReviewResponse create(User actor, ReviewDtos.CreateRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> ApiException.notFound("Booking"));

        if (!booking.getUser().getId().equals(actor.getId())) {
            throw ApiException.forbidden("You can only review your own bookings.");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw ApiException.badRequest("You can only review a completed rental.");
        }
        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw ApiException.conflict("You have already reviewed this booking.");
        }

        Review review = new Review(booking, booking.getVehicle(), actor, request.rating(),
                request.comment());
        reviewRepository.save(review);
        return ReviewDtos.ReviewResponse.from(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewDtos.ReviewResponse> forVehicle(Long vehicleId, Pageable pageable) {
        return PageResponse.from(
                reviewRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId, pageable),
                ReviewDtos.ReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public ReviewDtos.VehicleRatingSummary summary(Long vehicleId) {
        double avg = reviewRepository.averageRating(vehicleId).doubleValue();
        long count = reviewRepository.countByVehicleId(vehicleId);
        return new ReviewDtos.VehicleRatingSummary(vehicleId, Math.round(avg * 10) / 10.0, count);
    }
}
