package com.backend.common.domain.report.dto;

import com.backend.common.domain.report.enums.ReportReasonType;
import com.backend.common.domain.report.enums.ReportTargetType;

public record CreateReportRequest(
        ReportTargetType targetType,
        Long targetId,
        ReportReasonType reasonType,
        String reasonDetail
) {
}
