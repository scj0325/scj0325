package com.backend.common.domain.portfolio.proposals.entity;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.portfolio.portfolio.entity.Portfolio;
import com.backend.common.domain.project.enums.SelectionStatus;
import com.backend.common.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 프로젝트 참여 제안 내역 -> 포폴을보고 제안
@Entity
@Table(name = "project_proposals", indexes = {
        @Index(name = "idx_project_portfolio_proposal", columnList = "project_id, portfolio_id", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposer_id", nullable = false)
    private Member proposer;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private SelectionStatus status; // PENDING, ACCEPTED, REJECTED, CANCELLED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ★ 생성자 기반 빌더 패턴 적용
    @Builder
    public ProjectProposal(Project project, Portfolio portfolio, Member proposer, String message) {
        this.project = project;
        this.portfolio = portfolio;
        this.proposer = proposer;
        this.message = message;

        // 비즈니스 룰: 제안서 처음 생성 시 상태와 시간 강제 초기화 (외부 빌더 비노출)
        this.status = SelectionStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ================= 비즈니스 로직 (상태 변경 메서드) =================

    /**
     * 제안 수락 (ACCEPTED)
     */
    public void accept() {
        if (this.status != SelectionStatus.PENDING) {
            throw new IllegalStateException("대기 중인 제안만 수락할 수 있습니다.");
        }
        this.status = SelectionStatus.ACCEPTED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 제안 거절 (REJECTED)
     */
    public void reject() {
        if (this.status != SelectionStatus.PENDING) {
            throw new IllegalStateException("대기 중인 제안만 거절할 수 있습니다.");
        }
        this.status = SelectionStatus.REJECTED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 제안 취소 (CANCELLED) - 제안을 보낸 팀 리더가 철회할 때 사용
     */
    public void cancel() {
        if (this.status != SelectionStatus.PENDING) {
            throw new IllegalStateException("대기 중인 제안만 취소할 수 있습니다.");
        }
        this.status = SelectionStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }
}
