package com.backend.common.domain.project.project.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProjectRole {
    LEADER("LEADER", "팀 리더"),
    MANAGER("MANAGER", "부리더"),
    MEMBER("MEMBER", "일반 팀원");

    private final String code;
    private final String description;
}
