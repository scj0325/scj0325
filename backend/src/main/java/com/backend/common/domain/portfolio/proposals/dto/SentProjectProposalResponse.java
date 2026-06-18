package com.backend.common.domain.portfolio.proposals.dto;

import com.backend.common.domain.portfolio.proposals.entity.ProjectProposal;

public record SentProjectProposalResponse(
        Long proposalId,
        Long projectId,
        String projectTitle
) {
    public static SentProjectProposalResponse from(ProjectProposal proposal) {
        return new SentProjectProposalResponse(
                proposal.getId(),
                proposal.getProject().getId(),
                proposal.getProject().getTitle()
        );
    }
}
