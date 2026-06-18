package com.backend.common.domain.review.controller;

import com.backend.common.domain.review.dto.CreateReviewRequest;
import com.backend.common.domain.review.dto.ReviewResponse;
import com.backend.common.domain.review.service.ReviewService;
import com.backend.common.global.rsdata.RsData;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<RsData<Long>> createReview(
            @AuthenticationPrincipal CustomMemberDetails userDetails,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        Long reviewId = reviewService.createReview(
                userDetails.getMemberId(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RsData.of("201", "리뷰가 성공적으로 생성되었습니다.", reviewId));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<RsData<List<ReviewResponse>>> getReviews(
            @PathVariable Long userId
    ) {
        List<ReviewResponse> reviews = reviewService.findByRevieweeId(userId);

        return ResponseEntity.ok(
                RsData.of("200", "리뷰 목록 조회 성공", reviews)
        );
    }
}
