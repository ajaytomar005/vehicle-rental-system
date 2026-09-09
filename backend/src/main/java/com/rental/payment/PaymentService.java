package com.rental.payment;

import com.rental.booking.Booking;
import com.rental.booking.BookingRepository;
import com.rental.booking.BookingStatus;
import com.rental.common.ApiException;
import com.rental.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final SecureRandom random = new SecureRandom();

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public PaymentDtos.InitiateResponse initiate(User actor, PaymentDtos.InitiateRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> ApiException.notFound("Booking"));

        if (!booking.getUser().getId().equals(actor.getId())) {
            throw ApiException.forbidden("This is not your booking.");
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw ApiException.badRequest("This booking is not awaiting payment.");
        }

        List<Payment> existing = paymentRepository.findByBookingId(booking.getId());
        boolean alreadySucceeded = existing.stream()
                .anyMatch(p -> p.getStatus() == PaymentStatus.SUCCESS);
        if (alreadySucceeded) {
            throw ApiException.conflict("This booking has already been paid.");
        }

        String orderId = "ord_" + randomToken();
        Payment payment = new Payment(booking, booking.getTotalAmount(),
                PaymentType.RENTAL_AND_DEPOSIT, orderId);
        paymentRepository.save(payment);

        // The actual redirect/checkout session with the gateway is created on the
        // frontend using this order id; we only need to know the order id to reconcile
        // the webhook later.
        return new PaymentDtos.InitiateResponse(orderId, payment.getAmount(), "INR",
                booking.getId(), booking.getBookingReference());
    }

    /*
     * A booking only ever becomes CONFIRMED here, driven by the gateway's webhook.
     * The frontend polling "success" after redirect is not trusted on its own.
     */
    @Transactional
    public void handleWebhook(PaymentDtos.WebhookPayload payload) {
        Payment payment = paymentRepository.findByGatewayOrderId(payload.gatewayOrderId())
                .orElseThrow(() -> ApiException.notFound("Payment order"));

        if (payment.getStatus() != PaymentStatus.CREATED) {
            log.info("Ignoring duplicate webhook for order {}", payload.gatewayOrderId());
            return;
        }

        if ("SUCCESS".equalsIgnoreCase(payload.status())) {
            payment.markSuccess(payload.gatewayPaymentId());
            payment.getBooking().markConfirmed();
            log.info("Payment succeeded for booking {}", payment.getBooking().getBookingReference());
        } else {
            payment.markFailed(payload.failureReason() == null
                    ? "Payment declined" : payload.failureReason());
            log.info("Payment failed for booking {}", payment.getBooking().getBookingReference());
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentDtos.PaymentResponse> forBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .map(PaymentDtos.PaymentResponse::from)
                .toList();
    }

    private String randomToken() {
        StringBuilder sb = new StringBuilder();
        String alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (int i = 0; i < 20; i++) {
            sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return sb.toString();
    }
}
