package com.backend.common.domain.techstack.repository;

import com.backend.common.domain.techstack.entity.TechStack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechStackRepository extends JpaRepository<TechStack, Long> {

    /**
     * 기술 스택 이름으로 단건 조회
     * - PortfolioService 등에서 마스터 테이블 검증 및 재활용 시 사용됩니다.
     */
    Optional<TechStack> findByName(String name);

}
