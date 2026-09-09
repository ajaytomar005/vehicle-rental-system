package com.rental.booking;

import java.math.BigDecimal;

public record PriceQuote(
        RateType rateType,
        int units,
        BigDecimal rentalAmount,
        BigDecimal depositAmount,
        BigDecimal totalAmount,
        long totalHours
) {
}
