package com.backend.common.domain.portfolio.portfolio.dto;

import com.backend.common.domain.portfolio.portfolio.entity.PortfolioLink;

import java.util.List;

public record PortfolioCreateRequest(
        String title,
        String introduction,
        String desiredPosition,
        List<PortfolioLink> portfolioLinks,
        boolean isPublished,
        List<Long> techStackIds
) {
}
