package com.backend.common.domain.project.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SelectionStatus {
    PENDING("PENDING", "대기 중"),
    ACCEPTED("ACCEPTED", "승인됨"),
    REJECTED("REJECTED", "거절됨"),
    CANCELLED("CANCELLED", "취소됨");

    private final String code;
    private final String description;
}
