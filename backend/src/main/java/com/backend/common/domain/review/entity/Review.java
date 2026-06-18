package com.backend.common.domain.review.entity;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "peer_reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_peer_review",
                        columnNames = {
                                "project_id",
                                "reviewer_id",
                                "reviewee_id"
                        }
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 평가가 작성된 프로젝트
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * 평가 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Member reviewer;

    /**
     * 평가 대상자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private Member reviewee;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public Review(Project project, Member reviewer, Member reviewee, String content) {
        this.project = project;
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }
}
