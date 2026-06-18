package com.backend.common.domain.member.controller;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class MemberControllerTest {

    @Autowired private WebApplicationContext context;
    @Autowired private MemberRepository memberRepository;

    private MockMvc mvc;
    private Authentication testAuth;
    private Member testMember;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        testMember = Member.create("탈퇴테스터", "https://example.com/profile.png");
        memberRepository.save(testMember);

        CustomMemberDetails userDetails = new CustomMemberDetails(
                testMember.getId(), testMember.getNickname(), "ACTIVE"
        );
        testAuth = new UsernamePasswordAuthenticationToken(userDetails, null, List.of());
    }

    @Test
    @DisplayName("인증된 회원이 탈퇴하면 status가 WITHDRAWN으로 변경되고 deletedAt이 설정된다")
    void withdrawMember_success() throws Exception {
        mvc.perform(delete("/members/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.message").value("회원 탈퇴 성공"));

        Member withdrawn = memberRepository.findById(testMember.getId()).orElseThrow();
        assertThat(withdrawn.getStatus()).isEqualTo("WITHDRAWN");
        assertThat(withdrawn.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("인증되지 않은 요청은 탈퇴가 거부된다")
    void withdrawMember_unauthenticated() throws Exception {
        mvc.perform(delete("/members/me"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
}
