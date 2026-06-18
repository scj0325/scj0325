package com.backend.common.domain.project.project.repository;

import com.backend.common.domain.project.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProjectId(Long projectId);

    Optional<ProjectMember> findByProjectIdAndMemberId(Long projectId, Long memberId);

    boolean existsByProjectIdAndMemberId(Long projectId, Long memberId);

    @Query("""
            SELECT pm
            FROM ProjectMember pm
            JOIN FETCH pm.project p
            WHERE pm.member.id = :memberId
              AND pm.memberStatus = 'ACTIVE'
              AND pm.role IN ('LEADER', 'MANAGER')
              AND p.status = 'RECRUITING'
              AND p.recruitmentOpen = true
              AND p.deletedAt IS NULL
            ORDER BY p.createdAt DESC
            """)
    List<ProjectMember> findProposalProjects(@Param("memberId") Long memberId);
}
