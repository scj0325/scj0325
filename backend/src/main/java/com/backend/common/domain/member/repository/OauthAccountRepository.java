package com.backend.common.domain.member.repository;

import com.backend.common.domain.member.entity.OauthAccount;
import com.backend.common.domain.member.entity.OauthProvider;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OauthAccountRepository extends JpaRepository<OauthAccount, Long> {
    @EntityGraph(attributePaths = {"member"})
    Optional<OauthAccount> findByProviderAndProviderMemberId(OauthProvider provider, String providerMemberId);
}
