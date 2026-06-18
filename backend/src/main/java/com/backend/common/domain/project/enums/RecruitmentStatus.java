package com.backend.common.domain.project.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum RecruitmentStatus {
    OPEN("Open"),
    CLOSED("Closed"),
    COMPLETED("Completed"),
    STOPPED("Stopped");

    private final String value;

    RecruitmentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
