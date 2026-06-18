package com.backend.common.domain.review.service;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.project.enums.ProjectStatus;
import com.backend.common.domain.project.project.entity.Project;
import com.backend.common.domain.project.project.repository.ProjectMemberRepository;
import com.backend.common.domain.project.project.repository.ProjectRepository;
import com.backend.common.domain.review.dto.CreateReviewRequest;
import com.backend.common.domain.review.dto.ReviewResponse;
import com.backend.common.domain.review.entity.Review;
import com.backend.common.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Long createReview(Long reviewerId, CreateReviewRequest request) {
        // 1. 프로젝트 존재 및 상태 확인
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        if (project.getStatus() != ProjectStatus.COMPLETED) {
            throw new IllegalStateException("완료된 프로젝트에 대해서만 리뷰를 작성할 수 있습니다.");
        }

        // 2. 리뷰어와 리뷰 대상자가 해당 프로젝트의 팀원인지 확인
        if (!projectMemberRepository.existsByProjectIdAndMemberId(project.getId(), reviewerId)) {
            throw new IllegalArgumentException("리뷰어는 해당 프로젝트의 팀원이어야 합니다.");
        }

        if (!projectMemberRepository.existsByProjectIdAndMemberId(project.getId(), request.getRevieweeId())) {
            throw new IllegalArgumentException("리뷰 대상자는 해당 프로젝트의 팀원이어야 합니다.");
        }

        // 3. 중복 리뷰 여부 확인
        if (reviewRepository.existsByProjectIdAndReviewerIdAndRevieweeId(
                project.getId(), reviewerId, request.getRevieweeId())) {
            throw new IllegalStateException("이미 이 프로젝트에서 해당 팀원에게 리뷰를 작성했습니다.");
        }

        Member reviewer = memberRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰어입니다."));

        Member reviewee = memberRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰 대상자입니다."));

        // 4. Map을 JSON 문자열로 변환
        String contentJson;
        try {
            contentJson = objectMapper.writeValueAsString(request.getContent());
        } catch (Exception e) {
            throw new RuntimeException("리뷰 내용을 처리하는 중 오류가 발생했습니다.", e);
            }

        Review review = Review.builder()
                .project(project)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .content(contentJson)
                .build();

        return reviewRepository.save(review).getId();
    }

    public List<ReviewResponse> findByRevieweeId(Long revieweeId) {
        return reviewRepository.findByRevieweeId(revieweeId).stream()
                .map(review -> {
                    Map<String, String> parsedContent = parseContent(review.getContent());
                    return ReviewResponse.of(review, parsedContent);
                    })
                .collect(Collectors.toList());
    }

    private Map<String, String> parseContent(String contentJson) {
        try {
            return objectMapper.readValue(
                    contentJson,
                    new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return Collections.singletonMap("a1", contentJson);
        }
    }
}
