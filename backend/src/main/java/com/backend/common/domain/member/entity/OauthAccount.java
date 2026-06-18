package com.backend.common.domain.member.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oauth_accounts", indexes = {
        @Index(name = "idx_provider_user", columnList = "provider, providerMemberId", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OauthAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Enumerated(EnumType.STRING)
    private OauthProvider provider;

    private String providerMemberId;

    public static OauthAccount create(Member member, OauthProvider provider, String providerMemberId) {
        OauthAccount account = new OauthAccount();
        account.member = member;
        account.provider = provider;
        account.providerMemberId = providerMemberId;
        return account;
    }
}
