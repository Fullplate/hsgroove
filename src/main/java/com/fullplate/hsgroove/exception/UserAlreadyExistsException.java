package com.fullplate.hsgroove.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String userId) {
        super("user already exists '" + userId + "'.");
    }
}
