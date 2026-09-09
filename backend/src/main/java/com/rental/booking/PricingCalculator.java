package com.rental.booking;

import com.rental.vehicle.Pricing;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;

/*
 * Money is BigDecimal end to end. Every rental is priced by breaking the duration into
 * weeks + days + hours, then capping each remainder at the next tier up so a customer is
 * never charged more than the cheaper larger bucket would cost (25 hours bills as one
 * day plus one hour, but 8 days never bills more than a week plus a day).
 */
@Component
public class PricingCalculator {

    private static final int HOURS_PER_DAY = 24;
    private static final int HOURS_PER_WEEK = HOURS_PER_DAY * 7;
    private static final int SCALE = 2;

    public PriceQuote quote(Pricing pricing, Instant startAt, Instant endAt) {
        long totalHours = billableHours(startAt, endAt);

        long weeks = totalHours / HOURS_PER_WEEK;
        long remainder = totalHours % HOURS_PER_WEEK;
        long days = remainder / HOURS_PER_DAY;
        long hours = remainder % HOURS_PER_DAY;

        BigDecimal hourCost = pricing.getHourlyRate().multiply(BigDecimal.valueOf(hours));
        if (hourCost.compareTo(pricing.getDailyRate()) > 0) {
            hourCost = BigDecimal.ZERO;
            days += 1;
        }

        BigDecimal dayCost = pricing.getDailyRate().multiply(BigDecimal.valueOf(days));
        if (dayCost.add(hourCost).compareTo(pricing.getWeeklyRate()) > 0) {
            dayCost = BigDecimal.ZERO;
            hourCost = BigDecimal.ZERO;
            weeks += 1;
        }

        BigDecimal weekCost = pricing.getWeeklyRate().multiply(BigDecimal.valueOf(weeks));
        BigDecimal rental = weekCost.add(dayCost).add(hourCost).setScale(SCALE, RoundingMode.HALF_UP);
        BigDecimal deposit = pricing.getSecurityDeposit().setScale(SCALE, RoundingMode.HALF_UP);

        RateType rateType;
        int units;
        if (weeks > 0) {
            rateType = RateType.WEEKLY;
            units = (int) weeks;
        } else if (days > 0) {
            rateType = RateType.DAILY;
            units = (int) days;
        } else {
            rateType = RateType.HOURLY;
            units = (int) Math.max(hours, 1);
        }

        return new PriceQuote(rateType, units, rental, deposit, rental.add(deposit), totalHours);
    }

    /** Any started hour is a charged hour, with a one hour floor. */
    long billableHours(Instant startAt, Instant endAt) {
        long minutes = Duration.between(startAt, endAt).toMinutes();
        long hours = (minutes + 59) / 60;
        return Math.max(hours, 1);
    }
}
