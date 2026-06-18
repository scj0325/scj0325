package com.backend.common.domain.member.repository;

import com.backend.common.domain.techstack.entity.MemberTechStack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberTechStackRepository extends JpaRepository<MemberTechStack, Long> {

    List<MemberTechStack> findByMemberId(Long memberId);
}
