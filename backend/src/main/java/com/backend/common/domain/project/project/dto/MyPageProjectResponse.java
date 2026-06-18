package com.backend.common.domain.project.project.dto;

import com.backend.common.domain.project.enums.PositionType;
import com.backend.common.domain.project.project.entity.Project;
import java.time.LocalDate;
import java.util.List;

public record MyPageProjectResponse(
        Long id,
        String title,
        String description,
        LocalDate deadline,
        String leaderNickname,
        Long leaderId,
        List<PositionType> recruitingPositions,  // 프론트 컴포넌트 배지용
        List<String> techStacks,          // 실제 DB의 기술 스택 명칭 리스트
        String statusText                 // RECRUITING, IN_PROGRESS 등
) {
    public static MyPageProjectResponse from(Project project, List<PositionType> recruitingPositions) {

        // 엔티티의 중간 매핑 테이블을 타고 들어가 진짜 스택 명칭만 가공 추출
        List<String> dynamicTechStacks = project.getProjectTechStacks().stream()
                .map(pts -> pts.getTechStack().getName())
                .toList();

        return new MyPageProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getDeadline(),
                project.getLeader().getNickname(),
                project.getLeader().getId(),
                recruitingPositions,
                dynamicTechStacks,
                project.getStatus().name()
        );
    }
}
