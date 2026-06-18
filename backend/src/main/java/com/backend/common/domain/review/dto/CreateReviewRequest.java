package com.backend.common.domain.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
public class CreateReviewRequest {
    @NotNull
    private Long projectId;

    @NotNull
    private Long revieweeId;

    @NotNull
    private Map<String, String> content;
}
