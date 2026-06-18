package com.backend.common.domain.project.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProjectStatus {
    RECRUITING("RECRUITING", "모집 중"),
    IN_PROGRESS("IN_PROGRESS", "진행 중"),
    COMPLETED("COMPLETED", "완료"),
    DISBANDED("DISBANDED", "해산"),
    CANCELLED("CANCELLED", "취소");

    private final String code;
    private final String description;
}
