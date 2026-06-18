package com.backend.common.domain.member.controller;

import com.backend.common.domain.member.dto.AuthResponse;
import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.global.security.JwtTokenProvider;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:None}")
    private String cookieSameSite;


    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal CustomMemberDetails principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Member member = memberRepository.findById(principal.getMemberId()).orElse(null);
        if (member == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(new AuthResponse(principal.getMemberId(), member.getNickname(), member.getProfileImageUrl()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("access_token",null)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.noContent().build();
    }

    /**
     *  고정 테스트 계정("아무개") 세션 로그인용 API
     */
    @PostMapping("/test-login")
    public ResponseEntity<Void> testLogin(HttpServletResponse response) {
        Member testMember = memberRepository.findByNickname("아무개")
                .orElseGet(() -> memberRepository.save(
                        Member.create("아무개", "https://avatars.githubusercontent.com/u/12345678?v=4")
                ));

        String jwt = jwtTokenProvider.generateToken(testMember.getId(), testMember.getNickname());

        ResponseCookie cookie = ResponseCookie.from("access_token",jwt)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(60 * 60 * 24)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().build();
    }

}
