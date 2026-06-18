package com.backend.common.domain.report.controller;

import com.backend.common.domain.report.dto.CreateReportRequest;
import com.backend.common.domain.report.dto.CreateReportResponse;
import com.backend.common.domain.report.enums.ReportTargetType;
import com.backend.common.domain.report.service.ReportService;
import com.backend.common.global.rsdata.RsData;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<RsData<CreateReportResponse>> createReport(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @RequestBody CreateReportRequest request
    ) {

        Long reportId = reportService.createReport(memberDetails.getMemberId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        RsData.of(
                                "201",
                                "신고가 접수되었습니다.",
                                new CreateReportResponse(reportId)
                        )
                );
    }

    @GetMapping("/check")
    public ResponseEntity<RsData<Boolean>> checkAlreadyReported(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @RequestParam ReportTargetType targetType,
            @RequestParam Long targetId
    ) {
        boolean isReported = reportService.isAlreadyReported(memberDetails.getMemberId(), targetType, targetId);
        return ResponseEntity.ok(
                RsData.of(
                        "200",
                        "이미 신고한 내역이 있는지 조회 성공",
                        isReported
                )
        );
    }
}
