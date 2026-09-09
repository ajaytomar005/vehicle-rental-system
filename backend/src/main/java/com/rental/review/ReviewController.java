package com.rental.review;

import com.rental.common.PageResponse;
import com.rental.security.CurrentUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    public ReviewController(ReviewService reviewService, CurrentUser currentUser) {
        this.reviewService = reviewService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<ReviewDtos.ReviewResponse> create(
            @Valid @RequestBody ReviewDtos.CreateRequest request) {
        var review = reviewService.create(currentUser.require(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public PageResponse<ReviewDtos.ReviewResponse> forVehicle(@PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.forVehicle(vehicleId, PageRequest.of(page, Math.min(size, 50)));
    }

    @GetMapping("/vehicle/{vehicleId}/summary")
    public ReviewDtos.VehicleRatingSummary summary(@PathVariable Long vehicleId) {
        return reviewService.summary(vehicleId);
    }
}
