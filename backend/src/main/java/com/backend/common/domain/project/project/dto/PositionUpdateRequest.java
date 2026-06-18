package com.backend.common.domain.project.project.dto;

public record PositionUpdateRequest(
        String role,
        int total
) {
}
