package com.backend.common.domain.portfolio.portfolio.entity;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.techstack.entity.PortfolioTechStack;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "portfolios")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", unique = true, nullable = false)
    private Member member;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PortfolioTechStack> portfolioTechStacks = new ArrayList<>();

//    private String githubUrl;
//    private String blogUrl;
//    private String deployUrl;

    @ElementCollection
    @CollectionTable(name="portfolio_links", joinColumns = @JoinColumn(name = "portfolio_id"))
    private List<PortfolioLink> links = new ArrayList<>();

    private String desiredPosition;
    private boolean isPublished;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder
    public Portfolio(
            Member member,
            String title,
            String introduction,
            List<PortfolioLink> portfolioLinks,
            String desiredPosition,
            boolean isPublished
    ) {
        this.member = member;
        this.title = title;
        this.introduction = introduction;
        this.links = portfolioLinks != null ? new ArrayList<>(portfolioLinks) : new ArrayList<>();
        this.desiredPosition = desiredPosition;
        this.isPublished = isPublished;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    /**
     * 포트폴리오 수정 도메인 메서드 (DDD 패턴)
     */
    public void update(
            String title, String introduction, List<PortfolioLink> portfolioLinks,
            String desiredPosition, boolean isPublished
    ) {
        this.title = title;
        this.introduction = introduction;
        this.links.clear();
        if (portfolioLinks != null) this.links.addAll(portfolioLinks);
        this.desiredPosition = desiredPosition;
        this.isPublished = isPublished;
        this.updatedAt = LocalDateTime.now();
    }

    public void changeDesiredPosition(String desiredPosition) {
        this.desiredPosition = desiredPosition;
        this.updatedAt = LocalDateTime.now();
    }

    public void clearTechStacks() {
        this.portfolioTechStacks.clear();
    }

    public void addTechStacks(List<PortfolioTechStack> newStacks) {
        this.portfolioTechStacks.addAll(newStacks);
    }

    // createPortfolio에서 사용
    public void updateTechStacks(List<PortfolioTechStack> newStacks) {
        this.portfolioTechStacks.clear();
        this.portfolioTechStacks.addAll(newStacks);
    }

}
