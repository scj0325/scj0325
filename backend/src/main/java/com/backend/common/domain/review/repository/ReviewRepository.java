package com.backend.common.domain.review.repository;

import com.backend.common.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByProjectIdAndReviewerIdAndRevieweeId(
            Long projectId,
            Long reviewerId,
            Long revieweeId
    );

    List<Review> findByRevieweeId(Long revieweeId);

    List<Review> findByProjectId(Long projectId);
}
