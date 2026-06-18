package com.backend.common.domain.member.controller;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.global.security.JwtTokenProvider;
import com.backend.common.global.rsdata.RsData;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/test") // SecurityConfig의 permitAll() 범위인 /auth/** 에 맞춤
@Profile({"local", "dev"})       // 💡 local, dev 환경에서만 빈 등록되도록 안전 가드
@RequiredArgsConstructor
public class TestAuthController {

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.expiration-ms:604800000}")
    private long expirationMs;

    /**
     * 포스트맨 테스트용 강제 JWT 쿠키 발급 API
     * 예: GET http://localhost:8080/auth/test/login/1
     */
    @GetMapping("/login/{memberId}")
    public RsData<String> loginAsForTest(
            @PathVariable("memberId") Long memberId,
            HttpServletResponse response
    ) {
        // 1. 더미 데이터 이니셜라이저가 생성한 유저 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 테스트 회원이 DB에 존재하지 않습니다."));

        // 2. 다른 팀원이 구현한 JwtTokenProvider를 이용하여 실제 유효한 JWT 토큰 생성
        String jwtToken = jwtTokenProvider.generateToken(member.getId(), member.getNickname());

        // 3. OAuth2SuccessHandler에 구현된 쿠키 생성 스펙과 동일하게 서빙
        Cookie cookie = new Cookie("access_token", jwtToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMs / 1000));
        response.addCookie(cookie);

        return RsData.of("200", String.format("[%s] 계정으로 토큰 쿠키가 발급되었습니다. 이제 마이페이지 API를 요청해보세요!", member.getNickname()));
    }
}
