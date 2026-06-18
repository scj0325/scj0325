package com.backend.common.domain.portfolio.proposals.dto;

import com.backend.common.domain.project.project.entity.Project;

public record ProposalProjectResponse(
        Long id,
        String title
) {
    public static ProposalProjectResponse from(Project project) {
        return new ProposalProjectResponse(project.getId(), project.getTitle());
    }
}
