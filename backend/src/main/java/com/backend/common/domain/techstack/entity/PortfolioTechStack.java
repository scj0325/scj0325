package com.backend.common.domain.techstack.entity;

import com.backend.common.domain.portfolio.portfolio.entity.Portfolio;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "portfolio_tech_stacks", indexes = {
        @Index(name = "idx_portfolio_tech_stack", columnList = "portfolio_id, tech_stack_id", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PortfolioTechStack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tech_stack_id", nullable = false)
    private TechStack techStack;

    @Builder
    public PortfolioTechStack(Portfolio portfolio, TechStack techStack) {
        this.portfolio = portfolio;
        this.techStack = techStack;
    }
}
