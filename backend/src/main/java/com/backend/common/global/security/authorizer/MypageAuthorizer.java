package com.backend.common.global.security.authorizer;

import com.backend.common.domain.portfolio.proposals.entity.ProjectProposal;
import com.backend.common.domain.portfolio.proposals.repository.ProjectProposalRepository;
import com.backend.common.domain.project.application.entity.ProjectApplication;
import com.backend.common.domain.project.application.repository.ProjectApplicationRepository;
import com.backend.common.domain.project.enums.SelectionStatus;
import com.backend.common.global.exception.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("mypageAuthorizer")
@RequiredArgsConstructor
public class MypageAuthorizer {

    private final ProjectProposalRepository projectProposalRepository;
    private final ProjectApplicationRepository projectApplicationRepository;

    /**
     * 제안 인가: 제안을 받은 본인(포토폴리오 소유자)이 맞는지 검증
     */
    public boolean isProposalRecipient(Long proposalId, Long memberId) {
        if (memberId == null) return false;

        ProjectProposal proposal = projectProposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("404", "존재하지 않는 제안 요청입니다."));

        return proposal.getPortfolio().getMember().getId().equals(memberId);
    }

    /**
     * 지원서 인가 (수락/거절용): 해당 프로젝트의 방장(Leader)이 맞는지 검증
     */
    public boolean isProjectLeader(Long applicationId, Long memberId) {
        if (memberId == null) return false;

        ProjectApplication application = projectApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("404", "존재하지 않는 지원 내역입니다."));

        return application.getProject().getLeader().getId().equals(memberId);
    }

    /**
     * 지원서 인가 (취소용): 지원서를 작성한 지원자(Applicant) 본인이 맞는지 검증
     */
    public boolean isApplicant(Long projectId, Long memberId) {
        if (memberId == null || projectId == null) return false;

        // 프로젝트 ID와 로그인한 멤버 ID, 그리고 대기 상태인 지원서가 존재하는지 확인
        return projectApplicationRepository
                .findByApplicantIdAndProjectIdAndStatus(memberId, projectId, SelectionStatus.PENDING)
                .isPresent();
    }
}
