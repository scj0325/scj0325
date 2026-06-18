package com.backend.common.domain.review.dto;

import com.backend.common.domain.review.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
public class ReviewResponse {

    private Long reviewId;

    private String projectTitle;

    //private Long reviewerId;
    //private String reviewerNickname;

    //private Long revieweeId;
    //private String revieweeNickname;

    private Map<String, String> content;

    private LocalDateTime createdAt;

    public static ReviewResponse of(Review review, Map<String, String> parsedContent) {
        return ReviewResponse.builder()
                .reviewId(review.getId())
                .projectTitle(review.getProject().getTitle())
                //.reviewerId(review.getReviewer().getId())
                //.reviewerNickname(review.getReviewer().getNickname())
                //.revieweeId(review.getReviewee().getId())
                //.revieweeNickname(review.getReviewee().getNickname())
                .content(parsedContent)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
