package com.backend.common.domain.report.controller;

import com.backend.common.domain.report.dto.ReportResponse;
import com.backend.common.domain.report.enums.ReportStatus;
import com.backend.common.domain.report.enums.ReportTargetType;
import com.backend.common.domain.report.service.AdminReportService;
import com.backend.common.global.rsdata.RsData;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {
    private final AdminReportService adminReportService;

    @GetMapping
    public ResponseEntity<RsData<List<ReportResponse>>> getReports(
            @RequestParam(required = false) ReportTargetType targetType,
            @RequestParam(defaultValue = "PENDING") ReportStatus status,
            @RequestParam(required = false) String keyword
    ) {

        List<ReportResponse> reports =
                adminReportService.getReports(
                        targetType,
                        status,
                        keyword
                );

        return ResponseEntity.ok(
                RsData.of(
                        "200",
                        "신고 목록 조회 성공",
                        reports
                )
        );
    }

    @PatchMapping("/{reportId}/resolve")
    public ResponseEntity<RsData<Void>> processReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal CustomMemberDetails memberDetails
    ) {

        adminReportService.resolveReport(
                reportId,
                memberDetails.getMemberId()
        );

        return ResponseEntity.ok(
                RsData.of(
                        "200",
                        "신고가 처리되었습니다."
                )
        );
    }

    @PatchMapping("/{reportId}/reject")
    public ResponseEntity<RsData<Void>> rejectReport(
            @PathVariable Long reportId,
            @AuthenticationPrincipal CustomMemberDetails memberDetails
    ) {

        adminReportService.rejectReport(
                reportId,
                memberDetails.getMemberId()
        );

        return ResponseEntity.ok(
                RsData.of(
                        "200",
                        "신고가 반려되었습니다."
                )
        );
    }
}
