package com.backend.common.domain.portfolio.controller;

import com.backend.common.domain.portfolio.portfolio.controller.PortfolioController;
import com.backend.common.domain.portfolio.portfolio.dto.PortfolioCreateRequest;
import com.backend.common.domain.portfolio.portfolio.service.PortfolioService;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PortfolioControllerTest {

    @Mock
    private PortfolioService portfolioService;

    @InjectMocks
    private PortfolioController portfolioController;

    private MockMvc mockMvc;
    private CustomMemberDetails userDetails;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(portfolioController)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();

        userDetails = new CustomMemberDetails(1L, "testUser", "ACTIVE");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );
    }

    private static final String CREATE_REQUEST_JSON = """
            {
              "title": "내 포트폴리오",
              "introduction": "소개글입니다",
              "portfolioLinks": [
                {"linkType": "GITHUB", "url": "https://github.com/test"},
                {"linkType": "BLOG", "url": "https://blog.test.com"},
                {"linkType": "DEPLOY", "url": "https://deploy.test.com"}
              ],
              "desiredPosition": "백엔드 개발자",
              "techStackIds": [1, 2],
              "isPublished": true
            }
            """;

    private static final String CREATE_REQUEST_EMPTY_JSON = """
            {
              "title": "제목",
              "introduction": "소개",
              "desiredPosition": "백엔드",
              "techStackIds": [],
              "isPublished": false
            }
            """;

    @Test
    @DisplayName("포트폴리오 등록 성공 - 200 응답")
    void createPortfolio_success() throws Exception {
        willDoNothing().given(portfolioService).createPortfolio(eq(1L), any(PortfolioCreateRequest.class));

        mockMvc.perform(post("/api/portfolios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_REQUEST_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200"))
                .andExpect(jsonPath("$.message").value("개인 포트폴리오가 등록 되었습니다"));
    }

    @Test
    @DisplayName("포트폴리오 등록 실패 - 서비스 예외 전파 확인")
    void createPortfolio_serviceThrows_propagatesException() {
        willThrow(new NoSuchElementException("Member not found"))
                .given(portfolioService).createPortfolio(eq(1L), any(PortfolioCreateRequest.class));

        assertThatThrownBy(() ->
                mockMvc.perform(post("/api/portfolios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CREATE_REQUEST_EMPTY_JSON))
        ).hasCauseInstanceOf(NoSuchElementException.class);
    }
}
