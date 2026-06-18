package com.backend.common.domain.project.project.controller;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.project.application.entity.ProjectApplication;
import com.backend.common.domain.project.application.repository.ProjectApplicationRepository;
import com.backend.common.domain.project.enums.PositionType;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.handler;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class MyPageProjectControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private WebApplicationContext context;

    @Autowired private MemberRepository memberRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectApplicationRepository projectApplicationRepository;

    private Authentication testAuth;
    private Long savedProjectId;
    private Long savedApplicationId;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        Member member = Member.create("성이름", "https://example.com/profile.png");
        memberRepository.save(member);

        // 가짜 시큐리티 세션 객체에 유저 PK를  동기화 바인딩
        CustomMemberDetails mockUserDetails = mock(CustomMemberDetails.class);
        given(mockUserDetails.getMemberId()).willReturn(member.getId());
        given(mockUserDetails.getPassword()).willReturn("");
        given(mockUserDetails.getAuthorities()).willReturn(List.of());

        this.testAuth = new UsernamePasswordAuthenticationToken(mockUserDetails, null, List.of());

        // 404 에러 방지를 위한 영속성 데이터셋 프리-로딩 (H2 적재)
        Project project = Project.builder()
                .title("사이드 프로젝트 매칭 서비스")
                .leader(member) // 내가 방장인 공고 생성
                .build();
        projectRepository.save(project);
        this.savedProjectId = project.getId();

        ProjectApplication application = ProjectApplication.builder()
                .project(project)
                .applicant(member)
                .position(PositionType.BACKEND)
                .build();
        projectApplicationRepository.save(application);
        this.savedApplicationId = application.getId();
    }

    @Test
    @DisplayName("내가 올린 프로젝트 목록 조회 성공")
    void getMyOwnedProjects_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(get("/mypage/projects/owned")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(MyPageProjectController.class))
                .andExpect(handler().methodName("getMyOwnedProjects"))
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("내가 참여중인 프로젝트 목록 조회 성공")
    void getMyParticipatingProjects_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(get("/mypage/projects/participating")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내가 지원한 프로젝트 목록 조회 성공")
    void getMyAppliedProjects_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(get("/mypage/projects/applied")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내가 수행한 프로젝트 목록 조회 성공")
    void getMyCompletedProjects_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(get("/mypage/projects/completed")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내가 최근에 조회한 프로젝트 목록 조회 성공")
    void getMyRecentlyViewedProjects_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(get("/mypage/projects/recent-views")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("최근 본 프로젝트 내역 개별 삭제 성공")
    void deleteRecentlyViewedProject_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(delete("/mypage/projects/recent-views/" + savedProjectId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.message").value("최근 본 프로젝트 목록에서 삭제되었습니다."));
    }

    @Test
    @DisplayName("내가 올린 프로젝트에 들어온 지원 목록 조회 성공")
    void getMyProjectApplications_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(get("/mypage/projects/applications")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"));
    }

    @Test
    @DisplayName("내 프로젝트에 온 지원 수락 처리 성공")
    void handleApplicationAction_accept_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(patch("/mypage/projects/applications/" + savedApplicationId)
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth))
                        .param("accept", "true"))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.message").value("지원을 수락하여 팀원으로 등록했습니다."));
    }

    @Test
    @DisplayName("내가 신청한 프로젝트 지원 취소 성공")
    void cancelProjectApplication_success() throws Exception {
        ResultActions resultActions = mvc
                .perform(patch("/mypage/projects/applications/" + savedApplicationId + "/cancel")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(testAuth)))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.message").value("프로젝트 지원 신청이 성공적으로 취소되었습니다."));
    }
}