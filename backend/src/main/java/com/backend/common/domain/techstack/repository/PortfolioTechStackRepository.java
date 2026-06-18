package com.backend.common.domain.techstack.repository;

import com.backend.common.domain.techstack.entity.PortfolioTechStack;
import com.backend.common.domain.techstack.entity.TechStack;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioTechStackRepository extends JpaRepository<PortfolioTechStack, Long> {
}
