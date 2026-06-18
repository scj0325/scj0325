package com.backend.common.domain.report.repository;

import com.backend.common.domain.report.entity.Report;
import com.backend.common.domain.report.enums.ReportStatus;
import com.backend.common.domain.report.enums.ReportTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    // 이미 동일한 신고 내역이 있는지 조회
    boolean existsByReporterIdAndTargetTypeAndTargetId(
            Long reporterId,
            ReportTargetType targetType,
            Long targetId
    );

    List<Report> findByStatusOrderByCreatedAtDesc(
            ReportStatus status
    );

    List<Report> findByTargetTypeAndStatusOrderByCreatedAtDesc(
            ReportTargetType targetType,
            ReportStatus status
    );

    List<Report> findByTargetTypeAndStatusAndTargetIdInOrderByCreatedAtDesc(
            ReportTargetType targetType,
            ReportStatus status,
            List<Long> targetIds
    );
}
