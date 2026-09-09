package com.rental.payment;

import com.rental.security.CurrentUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentUser currentUser;

    public PaymentController(PaymentService paymentService, CurrentUser currentUser) {
        this.paymentService = paymentService;
        this.currentUser = currentUser;
    }

    @PostMapping("/initiate")
    public PaymentDtos.InitiateResponse initiate(@Valid @RequestBody PaymentDtos.InitiateRequest request) {
        return paymentService.initiate(currentUser.require(), request);
    }

    // Signature verification for the configured gateway (Razorpay/Stripe) belongs here,
    // ahead of handleWebhook, once real gateway credentials are wired in.
    @PostMapping("/webhook")
    public void webhook(@Valid @RequestBody PaymentDtos.WebhookPayload payload) {
        paymentService.handleWebhook(payload);
    }

    @GetMapping("/booking/{bookingId}")
    public List<PaymentDtos.PaymentResponse> forBooking(@PathVariable Long bookingId) {
        return paymentService.forBooking(bookingId);
    }
}
