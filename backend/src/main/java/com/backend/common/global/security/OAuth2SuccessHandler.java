package com.backend.common.global.security;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.entity.OauthAccount;
import com.backend.common.domain.member.entity.OauthProvider;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.member.repository.OauthAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final OauthAccountRepository oauthAccountRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.jwt.expiration-ms:604800000}")
    private long expirationMs;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String provider = token.getAuthorizedClientRegistrationId();
        OauthProvider oauthProvider = OauthProvider.valueOf(provider.toUpperCase());

        OAuth2UserInfo userInfo = OAuth2UserInfo.from(provider, token.getPrincipal().getAttributes());

        boolean[] isNew = {false};
        Member member = oauthAccountRepository
                .findByProviderAndProviderMemberId(oauthProvider, userInfo.providerMemberId())
                .map(OauthAccount::getMember)
                .orElseGet(() -> {
                    isNew[0] = true;
                    return createMember(oauthProvider, userInfo);
                });

        if (!isNew[0] && userInfo.profileImageUrl() != null) {
            member.updateProfileImageUrl(userInfo.profileImageUrl());
            memberRepository.save(member);
        }

        if (!isNew[0] && !member.getStatus().equals("ACTIVE")) {
            getRedirectStrategy().sendRedirect(request, response,
                    frontendUrl + "?error=" + member.getStatus());
            return;
        }

        String jwt = jwtTokenProvider.generateToken(member.getId(), member.getNickname());

        ResponseCookie cookie = ResponseCookie.from("access_token",jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(expirationMs / 1000)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());


        String redirectUrl = isNew[0] ? frontendUrl + "/mypage/portfolio/new" : frontendUrl;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private Member createMember(OauthProvider provider, OAuth2UserInfo userInfo) {
        Member member = Member.create(userInfo.nickname(), userInfo.profileImageUrl());
        memberRepository.save(member);
        OauthAccount account = OauthAccount.create(member, provider, userInfo.providerMemberId());
        oauthAccountRepository.save(account);
        return member;
    }
}
