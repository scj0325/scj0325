package com.backend.common.domain.project.project.dto;

public record PositionCreateRequest(
        String role,
        int total
) {
}

