package com.backend.common.domain.portfolio.portfolio.controller;

import com.backend.common.domain.portfolio.portfolio.dto.PortfolioCreateRequest;
import com.backend.common.domain.portfolio.portfolio.dto.PortfolioListResponse;
import com.backend.common.domain.portfolio.portfolio.dto.PortfolioResponse;
import com.backend.common.domain.portfolio.portfolio.dto.PortfolioUpdateRequest;
import com.backend.common.domain.portfolio.portfolio.service.PortfolioService;
import com.backend.common.domain.portfolio.proposals.dto.MyPageProposalResponse;
import com.backend.common.domain.portfolio.proposals.dto.ProjectProposalCreateRequest;
import com.backend.common.domain.portfolio.proposals.dto.ProposalProjectResponse;
import com.backend.common.domain.portfolio.proposals.dto.SentProjectProposalResponse;
import com.backend.common.global.rsdata.RsData;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    /**
     * 내 포트폴리오 조회
     */
    @GetMapping
    public RsData<Page<PortfolioListResponse>> getPublishedPortfolios(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "tech", required = false) String tech,
            @PageableDefault(size = 9, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return RsData.of(
                "200",
                "포트폴리오 목록 조회 성공",
                portfolioService.getPublishedPortfolios(search, role, tech, pageable)
        );
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public RsData<PortfolioResponse> getMyPortfolio(
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ) {
        PortfolioResponse response = portfolioService.getMyPortfolio(userDetails.getMemberId());
        return RsData.of("200", "내 포트폴리오 조회가 완료되었습니다.", response);
    }

    /**
     * 내 포트폴리오 수정
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public RsData<PortfolioResponse> updatePortfolio(
            @AuthenticationPrincipal CustomMemberDetails userDetails,
            @Valid @RequestBody PortfolioUpdateRequest request
    ) {
        PortfolioResponse response = portfolioService.updatePortfolio(userDetails.getMemberId(), request);
        return RsData.of("200", "포트폴리오 수정이 완료되었습니다.", response);
    }

    /**
     * 내 포폴에 온 제안 목록 조회
     */
    @GetMapping("/me/proposals")
    @PreAuthorize("isAuthenticated()")
    public RsData<Page<MyPageProposalResponse>> getMyReceivedProposals(
            @AuthenticationPrincipal CustomMemberDetails userDetails,
            @PageableDefault(size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<MyPageProposalResponse> responses = portfolioService.getMyReceivedProposals(userDetails.getMemberId(), pageable);
        return RsData.of("200", "받은 프로젝트 제안 목록 조회가 완료되었습니다.", responses);
    }

    /**
     * 받은 프로젝트 제안 수락/거절 액션 처리
     * 패스 배리어블로 proposalId를 받고, 쿼리 스트링으로 accept 여부를 받음 (예: /me/proposals/1?accept=true)
     */
    @PatchMapping("/me/proposals/{proposalId}")
    @PreAuthorize("isAuthenticated()")
    public RsData<Void> handleProposalAction(
            @PathVariable("proposalId") Long proposalId,
            @RequestParam("accept") boolean accept,
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ) {
        portfolioService.handleProposalAction(userDetails.getMemberId(), proposalId, accept);
        String message = accept ? "프로젝트 제안을 수락하여 팀원에 합류했습니다." : "프로젝트 제안을 거절했습니다.";
        return RsData.of("200", message, null);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public RsData<Void> createPortfolio(
            @AuthenticationPrincipal CustomMemberDetails userDetails,
            @Valid @RequestBody PortfolioCreateRequest request
    ) {
        portfolioService.createPortfolio(userDetails.getMemberId(), request);
        return RsData.of("200", "개인 포트폴리오가 등록 되었습니다");
    }

    @GetMapping("/proposal-projects")
    public RsData<List<ProposalProjectResponse>> getProposalProjects(
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InsufficientAuthenticationException("로그인이 필요합니다.");
        }
        return RsData.of(
                "200",
                "제안 가능한 프로젝트 조회가 완료되었습니다.",
                portfolioService.getProposalProjects(userDetails.getMemberId())
        );
    }

    @PostMapping("/{memberId}/proposals")
    public RsData<Void> createProjectProposal(
            @PathVariable Long memberId,
            @RequestBody ProjectProposalCreateRequest request,
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InsufficientAuthenticationException("로그인이 필요합니다.");
        }
        portfolioService.createProjectProposal(
                memberId,
                userDetails.getMemberId(),
                request
        );
        return RsData.of("200", "프로젝트 제안을 보냈습니다.");
    }

    @GetMapping("/{memberId}/proposals/sent")
    public RsData<List<SentProjectProposalResponse>> getPendingSentProposals(
            @PathVariable Long memberId,
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InsufficientAuthenticationException("로그인이 필요합니다.");
        }

        return RsData.of(
                "200",
                "보낸 프로젝트 제안 목록 조회가 완료되었습니다.",
                portfolioService.getPendingSentProposals(memberId, userDetails.getMemberId())
        );
    }

    @DeleteMapping("/proposals/{proposalId}")
    public RsData<Void> cancelProjectProposal(
            @PathVariable Long proposalId,
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InsufficientAuthenticationException("로그인이 필요합니다.");
        }

        portfolioService.cancelProjectProposal(proposalId, userDetails.getMemberId());
        return RsData.of("200", "프로젝트 제안을 취소했습니다.", null);
    }

    @GetMapping("/{memberId}")
    public RsData<PortfolioResponse> getPortfolioDetails(
            @PathVariable("memberId") Long memberId
    ) {
        PortfolioResponse response = portfolioService.getMyPortfolio(memberId);
        return RsData.of("200", "포트폴리오 상세 조회가 완료되었습니다.", response);
    }

}
