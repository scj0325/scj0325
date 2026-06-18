package com.backend.common.domain.report.dto;

import com.backend.common.domain.report.entity.Report;
import com.backend.common.domain.report.enums.ReportReasonType;
import com.backend.common.domain.report.enums.ReportStatus;
import com.backend.common.domain.report.enums.ReportTargetType;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ReportResponse(
        Long reportId,
        Long reporterId,
        String reporterNickname,
        ReportTargetType targetType,
        Long targetId,
        String targetTitle,
        String targetMemberNickname,
        String targetMemberProfileImage,
        ReportReasonType reasonType,
        String reasonDetail,
        ReportStatus status,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {

    public static ReportResponse from(Report report) {
        return ReportResponse.builder()
                .reportId(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterNickname(report.getReporter().getNickname())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reasonType(report.getReasonType())
                .reasonDetail(report.getReasonDetail())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .reviewedAt(report.getReviewedAt())
                .build();
    }

    public static ReportResponse of(Report report, String targetTitle, String targetMemberNickname, String targetMemberProfileImage) {
        return ReportResponse.builder()
                .reportId(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterNickname(report.getReporter().getNickname())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .targetTitle(targetTitle)
                .targetMemberNickname(targetMemberNickname)
                .targetMemberProfileImage(targetMemberProfileImage)
                .reasonType(report.getReasonType())
                .reasonDetail(report.getReasonDetail())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .reviewedAt(report.getReviewedAt())
                .build();
    }
}
