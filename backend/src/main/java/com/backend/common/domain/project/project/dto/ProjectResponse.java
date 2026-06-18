package com.backend.common.domain.project.project.dto;

import com.backend.common.domain.member.dto.UserResponse;
import com.backend.common.domain.project.enums.ProjectCategory;
import com.backend.common.domain.project.enums.RecruitmentStatus;
import java.util.List;

public record ProjectResponse(
        String id,
        String title,
        String description,
        List<String> goals,
        List<String> techStack,
        List<PositionResponse> positions,
        RecruitmentStatus recruitmentStatus,
        ProjectCategory category,
        UserResponse leader,
        List<UserResponse> teamMembers,
        String deadline,
        String createdAt,
        boolean featured
) {
}
