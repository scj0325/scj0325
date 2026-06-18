package com.backend.common.domain.project.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectCategory {
    WEB("Web"),
    MOBILE("Mobile"),
    AI("AI"),
    GAME("Game"),
    OTHER("Other");

    private final String value;

    ProjectCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProjectCategory from(String value) {
        for (ProjectCategory category : values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown project category: " + value);
    }
}
