package com.backend.common.domain.report.entity;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.report.enums.ReportReasonType;
import com.backend.common.domain.report.enums.ReportStatus;
import com.backend.common.domain.report.enums.ReportTargetType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "reports",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_report_target",
                        columnNames = {
                                "reporter_id",
                                "target_type",
                                "target_id"
                        }
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 신고자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    /**
     * 신고 대상 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 30)
    private ReportTargetType targetType;

    /**
     * 신고 대상 ID
     */
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    /**
     * 신고 사유
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "reason_type", nullable = false, length = 30)
    private ReportReasonType reasonType;

    /**
     * 상세 신고 내용
     */
    @Lob
    @Column(name = "reason_detail")
    private String reasonDetail;

    /**
     * 처리 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status;

    /**
     * 신고 생성일
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 처리 관리자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Member reviewedBy;

    /**
     * 처리 일시
     */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Builder
    public Report(
            Member reporter,
            ReportTargetType targetType,
            Long targetId,
            ReportReasonType reasonType,
            String reasonDetail
    ) {
        this.reporter = reporter;
        this.targetType = targetType;
        this.targetId = targetId;
        this.reasonType = reasonType;
        this.reasonDetail = reasonDetail;
        this.status = ReportStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public void resolve(Member admin) {
        this.status = ReportStatus.RESOLVED;
        this.reviewedBy = admin;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(Member admin) {
        this.status = ReportStatus.REJECTED;
        this.reviewedBy = admin;
        this.reviewedAt = LocalDateTime.now();
    }
}

