package com.backend.common.domain.report.service;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.report.dto.ReportResponse;
import com.backend.common.domain.report.entity.Report;
import com.backend.common.domain.report.enums.ReportStatus;
import com.backend.common.domain.report.enums.ReportTargetType;
import com.backend.common.domain.report.repository.ReportRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {
    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;
    private final com.backend.common.domain.portfolio.portfolio.repository.PortfolioRepository portfolioRepository;
    private final com.backend.common.domain.project.project.repository.ProjectRepository projectRepository;

    public List<ReportResponse> getReports(
            ReportTargetType targetType,
            ReportStatus status,
            String keyword
    ) {

        List<Report> reports;

        if (targetType == null) {
            reports = reportRepository
                    .findByStatusOrderByCreatedAtDesc(status);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
            List<Long> targetIds;
            if (targetType == ReportTargetType.PROJECT) {
                targetIds = projectRepository.findIdsByTitle(searchPattern);
            } else {
                targetIds = portfolioRepository.findIdsByMemberNicknameOrTitle(searchPattern);
            }

            if (targetIds == null || targetIds.isEmpty()) {
                return List.of();
            }

            reports = reportRepository
                    .findByTargetTypeAndStatusAndTargetIdInOrderByCreatedAtDesc(targetType, status, targetIds);
        } else {
            reports = reportRepository
                    .findByTargetTypeAndStatusOrderByCreatedAtDesc(targetType, status);
        }


        return reports.stream()
                .map(report -> {
                    String targetTitle = null;
                    String targetMemberNickname = null;
                    String targetMemberProfileImage = null;

                    if (report.getTargetType() == ReportTargetType.PORTFOLIO) {
                        var portfolio = portfolioRepository.findById(report.getTargetId()).orElse(null);
                        if (portfolio != null) {
                            targetTitle = portfolio.getTitle();
                            targetMemberNickname = portfolio.getMember().getNickname();
                            targetMemberProfileImage = portfolio.getMember().getProfileImageUrl();
                        }
                    } else if (report.getTargetType() == ReportTargetType.PROJECT) {
                        var project = projectRepository.findById(report.getTargetId()).orElse(null);
                        if (project != null) {
                            targetTitle = project.getTitle();
                            targetMemberNickname = project.getLeader().getNickname();
                            targetMemberProfileImage = project.getLeader().getProfileImageUrl();
                        }
                    }

                    return ReportResponse.of(report, targetTitle, targetMemberNickname, targetMemberProfileImage);
                })
                .toList();
    }

    @Transactional
    public void resolveReport(Long reportId, Long adminId) {

        Report report = reportRepository.findById(reportId)
                .orElseThrow(EntityNotFoundException::new);

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 신고입니다.");
        }

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 관리자입니다."));

        report.resolve(admin);

        // 프로젝트 신고 처리 시 해당 프로젝트 숨김 처리
        if (report.getTargetType() == ReportTargetType.PROJECT) {
            projectRepository.findById(report.getTargetId())
                    .ifPresent(com.backend.common.domain.project.project.entity.Project::hide);
        }
    }

    @Transactional
    public void rejectReport(Long reportId, Long adminId) {

        Report report = reportRepository.findById(reportId)
                .orElseThrow(EntityNotFoundException::new);

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 신고입니다.");
        }

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 관리자입니다."));

        report.reject(admin);
    }
}
