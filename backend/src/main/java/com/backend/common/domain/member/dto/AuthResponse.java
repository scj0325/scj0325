package com.backend.common.domain.member.dto;

public record AuthResponse(Long memberId, String nickname, String profileImageUrl) {
}
