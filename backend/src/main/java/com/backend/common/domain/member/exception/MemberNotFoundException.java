package com.backend.common.domain.member.exception;

public class MemberNotFoundException extends RuntimeException {
    private final String code;
    public MemberNotFoundException(String code, String message) {
        super(message);
        this.code = code;
    }
    public int getStatusCode() { return Integer.parseInt(code);}
}
