package com.backend.common.domain.portfolio.portfolio.dto;

import com.backend.common.domain.portfolio.portfolio.entity.Portfolio;
import com.backend.common.domain.portfolio.portfolio.entity.PortfolioLink;

import java.util.List;

public record PortfolioListResponse(
        String id,
        String name,
        String avatar,
        String role,
        String bio,
        List<String> techStack,
        String github,
        String portfolio,
        String location,
        boolean featured
) {
    public static PortfolioListResponse from(Portfolio portfolio, boolean featured) {
        return new PortfolioListResponse(
                String.valueOf(portfolio.getMember().getId()),
                portfolio.getMember().getNickname(),
                portfolio.getMember().getProfileImageUrl(),
                portfolio.getDesiredPosition(),
                portfolio.getIntroduction(),
                portfolio.getPortfolioTechStacks().stream()
                        .map(portfolioTechStack -> portfolioTechStack.getTechStack().getName())
                        .toList(),
                findLink(portfolio, "GITHUB"),
                findLink(portfolio, "DEPLOY"),
                null,
                featured
        );
    }

    private static String findLink(Portfolio portfolio, String linkType) {
        return portfolio.getLinks().stream()
                .filter(link -> linkType.equals(link.getLinkType()))
                .map(PortfolioLink::getUrl)
                .findFirst()
                .orElse(null);
    }
}
