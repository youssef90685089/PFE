package com.project.sipms.common;

/**
 * Exception for business logic violations.
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
