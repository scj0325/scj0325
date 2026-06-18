package com.backend.common.domain.project.application.dto;

public record ProjectApplicationCreateRequest(
        String position,
        String message
) {
}
