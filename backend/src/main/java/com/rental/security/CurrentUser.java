package com.rental.security;

import com.rental.common.ApiException;
import com.rental.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public User require() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AppUserDetails details)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return details.getUser();
    }

    public Long requireId() {
        return require().getId();
    }
}
