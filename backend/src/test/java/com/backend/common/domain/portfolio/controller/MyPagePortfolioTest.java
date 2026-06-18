package com.backend.common.domain.portfolio.controller;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.portfolio.portfolio.entity.Portfolio;
import com.backend.common.domain.portfolio.portfolio.entity.PortfolioLink;
import com.backend.common.domain.portfolio.portfolio.repository.PortfolioRepository;
import com.backend.common.domain.portfolio.proposals.entity.ProjectProposal;
import com.backend.common.domain.portfolio.proposals.repository.ProjectProposalRepository;
import com.backend.common.domain.project.project.entity.Project;
import com.backend.common.domain.project.project.repository.ProjectRepository;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class MyPagePortfolioTest {

    @Autowired private MockMvc mvc;
    @Autowired private WebApplicationContext context;

    @Autowired private MemberRepository memberRepository;
    @Autowired private PortfolioRepository portfolioRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectProposalRepository projectProposalRepository;

    private Long savedProposalId;

    // 테스트 요청마다 주입해 줄 실제 시큐리티 가짜 인증 객체 전역 보관
    private Authentication testAuth;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        Member member = Member.create("성이름", "https://example.com/default-profile.png");
        memberRepository.save(member);

        // 저장된 유저의 진짜 ID 값을 가지는 CustomMemberDetails 객체를 Mock으로 생성
        CustomMemberDetails mockUserDetails = mock(CustomMemberDetails.class);
        given(mockUserDetails.getMemberId()).willReturn(member.getId());
        given(mockUserDetails.getPassword()).willReturn("");
        given(mockUserDetails.getAuthorities()).willReturn(List.of());

        // 시큐리티 컨텍스트에 담길 인증용 토큰 발행
        this.testAuth = new UsernamePasswordAuthenticationToken(mockUserDetails, null, List.of());

        Portfolio portfolio = Portfolio.builder()
                .member(member)
                .title("기본 제목")
                .introduction("소개")
                .portfolioLinks(List.of(
                        new PortfolioLink("GITHUB", "https://github.com/test"),
                        new PortfolioLink("DEPLOY", "https://deploy.test.com")
                ))
                .desiredPosition("BACKEND")
                .isPublished(true)
                .build();
        portfolioRepository.save(portfolio);

        Project project = Project.builder()
                .title("테스트 프로젝트")
                .leader(member)
                .build();
        projectRepository.save(project);

        ProjectProposal proposal = ProjectProposal.builder()
                .project(project)
                .portfolio(portfolio)
                .proposer(member)
                .message("같이 해요!")
                .build();
        projectProposalRepository.save(proposal);
        this.savedProposalId = proposal.getId();
    }

    @Test
    @DisplayName("개인 포트폴리오 신규 등록 성공")
    void createPortfolio_success() throws Exception {
        // 포트폴리오가 없는 완전히 새로운 신규 회원 등록
        Member newMember = Member.create("신규유저", "https://example.com/new.png");
        memberRepository.save(newMember);

        // 신규 유저의 ID를 물고 들어가는 가짜 인증 세션 조립
        CustomMemberDetails newMockDetails = mock(CustomMemberDetails.class);
        given(newMockDetails.getMemberId()).willReturn(newMember.getId());
        given(newMockDetails.getPassword()).willReturn("");
        given(newMockDetails.getAuthorities()).willReturn(List.of());

        Authentication newAuth = new UsernamePasswordAuthenticationToken(newMockDetails, null, List.of());

        String content = """
                {
                    "title": "신입 백엔드 포트폴리오",
                    "introduction": "안녕하세요 Java 개발자입니다.",
                    "links": [
                        {"linkType": "GITHUB", "url": "https://github.com/user1"},
                        {"linkType": "BLOG", "url": "https://user1.tistory.com"},
                        {"linkType": "DEPLOY", "url": "https://user1.com"}
                    ],
                    "desiredPosition": "BACKEND",
                    "isPublished": true,
                    "techStackIds": []
                }
                """;

        // 기존 testAuth 대신 방금  newAuth를 .with()에 주입해 요청을 보냄
        mvc.perform(post("/portfolios")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(newAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(content))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내 포트폴리오 상세 조회 성공")
    void getMyPortfolio_success() throws Exception {
        mvc.perform(get("/portfolios/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내 포트폴리오 내용 및 기술 스택 수정 성공")
    void updatePortfolio_success() throws Exception {
        String content = """
                {
                    "title": "수정된 포트폴리오 제목",
                    "introduction": "수정된 자기소개 내용입니다.",
                    "portfolioLinks": [
                        {"linkType": "GITHUB", "url": "https://github.com/changed"},
                        {"linkType": "BLOG", "url": "https://changed.blog"},
                        {"linkType": "DEPLOY", "url": "https://changed.deploy"}
                    ],
                    "desiredPosition": "BACKEND",
                    "isPublished": true,
                    "techStacks": ["Java", "Spring Boot"]
                }
                """;

        mvc.perform(put("/portfolios/me")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(content))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내 포트폴리오에 온 프로젝트 제안 내역 조회 성공")
    void getMyReceivedProposals_success() throws Exception {
        mvc.perform(get("/portfolios/me/proposals")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("받은 프로젝트 제안 거절 액션 처리 성공")
    void handleProposalAction_reject_success() throws Exception {
        mvc.perform(patch("/portfolios/me/proposals/" + savedProposalId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth))
                        .param("accept", "false"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }
}