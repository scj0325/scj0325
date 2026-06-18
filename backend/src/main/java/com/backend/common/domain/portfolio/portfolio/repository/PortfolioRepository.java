package com.backend.common.domain.portfolio.portfolio.repository;

import com.backend.common.domain.portfolio.portfolio.entity.Portfolio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByMemberId(Long memberId);

    @Query("SELECT DISTINCT p FROM Portfolio p " +
            "JOIN p.member m " +
            "LEFT JOIN p.portfolioTechStacks pts " +
            "WHERE p.isPublished = true " +
            "AND (:search IS NULL OR LOWER(m.nickname) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.introduction) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.desiredPosition) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(pts.techStack.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:role IS NULL OR p.desiredPosition = :role) " +
            "AND (:tech IS NULL OR pts.techStack.name = :tech)")
    Page<Portfolio> searchPortfolios(
            @Param("search") String search,
            @Param("role") String role,
            @Param("tech") String tech,
            Pageable pageable
    );

    @Query("""
            SELECT p
            FROM Portfolio p
            WHERE p.isPublished = true
            ORDER BY p.createdAt DESC
            """)
    List<Portfolio> findLatestPublished();

    @Query("SELECT p.id FROM Portfolio p JOIN p.member m WHERE LOWER(m.nickname) LIKE :pattern OR LOWER(p.title) LIKE :pattern")
    List<Long> findIdsByMemberNicknameOrTitle(@Param("pattern") String pattern);
}
