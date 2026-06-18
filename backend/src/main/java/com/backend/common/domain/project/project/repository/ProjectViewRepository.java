package com.backend.common.domain.project.project.repository;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.project.project.entity.Project;
import com.backend.common.domain.project.project.entity.ProjectView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectViewRepository extends JpaRepository<ProjectView, Long> {

    boolean existsByProjectAndMember(Project project, Member member);

    /**
     * 특정 회원의 최근 본 프로젝트 조회 이력 단건 삭제
     */
    @Modifying
    @Query("DELETE FROM ProjectView pv WHERE pv.member.id = :memberId AND pv.project.id = :projectId")
    void deleteByMemberIdAndProjectId(@Param("memberId") Long memberId, @Param("projectId") Long projectId);
}
