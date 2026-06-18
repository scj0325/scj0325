package com.backend.common.domain.portfolio.portfolio.dto;

import com.backend.common.domain.portfolio.portfolio.entity.PortfolioLink;

import java.util.List;

/**
 * 포트폴리오 수정 요청 DTO
 */
public record PortfolioUpdateRequest(
        String title,
        String introduction,
        List<PortfolioLink> portfolioLinks,
        String desiredPosition,
        boolean isPublished,
        List<String> techStacks // 💡 수정할 기술 스택 이름 리스트
) {
}
