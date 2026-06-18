package com.backend.common.domain.project.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum PositionType {
    BACKEND("BACKEND", "백엔드"),
    FRONTEND("FRONTEND", "프론트엔드"),
    FULL_STACK("FULL_STACK", "풀스택"),
    DESIGNER("DESIGNER", "디자이너"),
    PRODUCT_MANAGER("PRODUCT_MANAGER", "기획자"),
    ERROR("error","에러");

    private final String code;
    private final String description;

    /**
     * 영문 코드나 한글 명칭을 던지면 매칭되는 이넘 상수를 안전하게 반환하는 정적 메서드
     */
    public static PositionType fromDescriptionOrCode(String value) {
        if (value == null || value.trim().isEmpty()) {
            return ERROR;
        }

        String trimmed = value.trim();
        return Arrays.stream(PositionType.values())
                .filter(p -> p.name().equalsIgnoreCase(trimmed) ||
                        p.getDescription().equals(trimmed) ||
                        p.toRequiredFormat().equals(trimmed))
                .findFirst()
                .orElse(ERROR);
    }

    public String toRequiredFormat() {
        return switch (this) {
            case BACKEND -> "백엔드 개발자";
            case FRONTEND -> "프론트엔드 개발자";
            case FULL_STACK -> "풀스택 개발자";
            case DESIGNER -> "디자이너";
            case PRODUCT_MANAGER -> "프로덕트 매니저";
            case ERROR -> "알 수 없는 포지션";
        };
    }

}
