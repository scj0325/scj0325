package com.backend.common.domain.portfolio.proposals.dto;

import com.backend.common.domain.portfolio.proposals.entity.ProjectProposal;
import java.time.LocalDateTime;

public record MyPageProposalResponse(
        Long proposalId,       // 제안서 PK (수락/거절 액션 처리용)
        Long projectId,        // 프로젝트 상세페이지 이동용 ID
        String projectTitle,   // 제안이 온 프로젝트 제목
        String proposerName,   // 제안을 보낸 팀 리더 닉네임
        String message,        // 제안 메시지 본문
        String status,         // PENDING, ACCEPTED, REJECTED, CANCELLED
        LocalDateTime createdAt
) {
    public static MyPageProposalResponse from(ProjectProposal proposal) {
        return new MyPageProposalResponse(
                proposal.getId(),
                proposal.getProject().getId(),
                proposal.getProject().getTitle(),
                proposal.getProposer().getNickname(),
                proposal.getMessage(),
                proposal.getStatus().name(),
                proposal.getCreatedAt()
        );
    }
}