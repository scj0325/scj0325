package com.backend.common.domain.portfolio.proposals.repository;

import com.backend.common.domain.portfolio.proposals.entity.ProjectProposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectProposalRepository extends JpaRepository<ProjectProposal, Long> {

    boolean existsByProjectIdAndPortfolioId(Long projectId, Long portfolioId);

    /**
     * 내 포폴에 온 제안 목록 조회
     * 조건: 제안 대상 포트폴리오의 주인이 '나(memberId)'이고, 대기(PENDING) 상태인 제안서들
     */
    @Query(value = "SELECT pp FROM ProjectProposal pp " +
            "JOIN pp.portfolio p " +
            "WHERE p.member.id = :memberId",
            countQuery = "SELECT count(pp) FROM ProjectProposal pp " +
                    "JOIN pp.portfolio p " +
                    "WHERE p.member.id = :memberId")
    Page<ProjectProposal> findMyReceivedProposals(@Param("memberId") Long memberId, Pageable pageable);

    @Query("SELECT pp FROM ProjectProposal pp " +
            "JOIN FETCH pp.project p " +
            "WHERE pp.portfolio.member.id = :targetMemberId " +
            "AND pp.proposer.id = :proposerId " +
            "AND pp.status = 'PENDING' " +
            "ORDER BY pp.createdAt DESC")
    List<ProjectProposal> findPendingSentProposals(
            @Param("targetMemberId") Long targetMemberId,
            @Param("proposerId") Long proposerId
    );
}
