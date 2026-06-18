package com.backend.common.domain.project.application.repository;

import com.backend.common.domain.project.application.entity.ProjectApplication;
import com.backend.common.domain.project.enums.SelectionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long> {

    /**
     * 내가 올린 프로젝트 중 지원이 온 목록 조회
     * 조건: 프로젝트의 팀 리더가 '나(memberId)'이고, 대기(PENDING) 상태인 지원서들
     */
    @Query(value = "SELECT pa FROM ProjectApplication pa " +
            "JOIN pa.project p " +
            "WHERE p.leader.id = :memberId AND p.deletedAt IS NULL",
            countQuery = "SELECT count(pa) FROM ProjectApplication pa " +
                    "JOIN pa.project p " +
                    "WHERE p.leader.id = :memberId AND p.deletedAt IS NULL")
    Page<ProjectApplication> findMyProjectApplications(@Param("memberId") Long memberId, Pageable pageable);

    @Query("SELECT pa FROM ProjectApplication pa " +
            "WHERE pa.project.id = :projectId " +
            "AND pa.applicant.id = :memberId " +
            "AND pa.status = 'PENDING'")
    Optional<ProjectApplication> findPendingApplication(
            @Param("projectId") Long projectId,
            @Param("memberId") Long memberId
    );

    Optional<ProjectApplication> findByProjectIdAndApplicantId(Long projectId, Long applicantId);

    /**
     * 내가 지원한 프로젝트 중
     * 아직 모집중인 프로젝트인 프로젝트에 대한
     * 나의 지원들 조회
     */
    Optional<ProjectApplication> findByApplicantIdAndProjectIdAndStatus(
            Long applicantId,
            Long projectId,
            SelectionStatus status
    );

}
