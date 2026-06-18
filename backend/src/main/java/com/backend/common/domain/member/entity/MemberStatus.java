package com.backend.common.domain.member.entity;

public enum MemberStatus {
    ACTIVE,     // 활성 계정
    SUSPENDED,  // 임시 정지 계정 (suspension_until과 조합하여 사용)
    BANNED,      // 영구 정지 계정
    WITHDRAWN   // 회원 탈퇴 계정
}
