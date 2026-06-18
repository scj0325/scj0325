package com.backend.common.domain.portfolio.portfolio.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioLink {
    private String linkType;
    private String url;
}
