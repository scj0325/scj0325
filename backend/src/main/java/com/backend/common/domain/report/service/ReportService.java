package com.backend.common.domain.report.service;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.report.dto.CreateReportRequest;
import com.backend.common.domain.report.entity.Report;
import com.backend.common.domain.report.enums.ReportTargetType;
import com.backend.common.domain.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public Long createReport(Long reporterId, CreateReportRequest request) {

        Member reporter = memberRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId,
                request.targetType(),
                request.targetId())) {

            throw new IllegalArgumentException("이미 신고한 대상입니다.");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.targetType())
                .targetId(request.targetId())
                .reasonType(request.reasonType())
                .reasonDetail(request.reasonDetail())
                .build();

        Report savedReport = reportRepository.save(report);

        return savedReport.getId();
    }

    public boolean isAlreadyReported(Long reporterId, ReportTargetType targetType, Long targetId) {
        return reportRepository.existsByReporterIdAndTargetTypeAndTargetId(reporterId, targetType, targetId);
    }
}
