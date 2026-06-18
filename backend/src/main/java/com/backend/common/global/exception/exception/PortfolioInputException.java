package com.backend.common.global.exception.exception;

import lombok.Getter;

@Getter
public class PortfolioInputException extends RuntimeException {

    private final String code;

    public PortfolioInputException(String code, String message) {
        super(message);
        this.code = code;
    }

    public int getStatusCode() { return Integer.parseInt(code);}
}
