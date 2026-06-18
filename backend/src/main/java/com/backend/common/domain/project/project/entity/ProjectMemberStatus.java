package com.backend.common.domain.project.project.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProjectMemberStatus {
    ACTIVE("ACTIVE", "참여 중"),
    LEFT("LEFT", "탈퇴함"),
    REMOVED("REMOVED", "추방됨"),
    NEEDFIX("NEEDFIX", "수정 필요"); // 추후 필요 시 확장 가능

    private final String code;
    private final String description;
}
