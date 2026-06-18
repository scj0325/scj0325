package com.backend.common.domain.project.project.dto;

public record PositionResponse(
        String role,
        int filled,
        int total
) {
}
