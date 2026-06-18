package com.backend.common.domain.project.exception;

public class ProjectNotFoundException extends RuntimeException {
    private final String code;
    public ProjectNotFoundException(String code, String message) {
        super(message);
        this.code = code;
    }
    public int getStatusCode() { return Integer.parseInt(code);}
}
