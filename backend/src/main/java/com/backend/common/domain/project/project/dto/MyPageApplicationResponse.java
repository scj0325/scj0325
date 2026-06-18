package com.backend.common.domain.project.project.dto;

import com.backend.common.domain.project.application.entity.ProjectApplication;
import java.time.LocalDateTime;

public record MyPageApplicationResponse(
        Long applicationId,   // 지원서 PK (수락/거절 액션 처리용)
        Long projectId,       // 프로젝트 ID
        String projectTitle,  // 내 프로젝트 제목
        String applicantName, // 지원자 닉네임
        String message,       // 지원 메시지 ("저 백엔드 참여하고 싶어요")
        String status,        // PENDING, ACCEPTED 등
        LocalDateTime createdAt
) {
    public static MyPageApplicationResponse from(ProjectApplication application) {
        return new MyPageApplicationResponse(
                application.getId(),
                application.getProject().getId(),
                application.getProject().getTitle(),
                application.getApplicant().getNickname(),
                application.getMessage(),
                application.getStatus().name(),
                application.getCreatedAt()
        );
    }
}
