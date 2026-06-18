package com.backend.common.domain.bookmark.entity;

import com.backend.common.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookmarks", indexes = {
        @Index(name = "idx_member_bookmark_target", columnList = "member_id, target_type, target_id", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private String targetType; // PROJECT, PORTFOLIO
    private Long targetId;

    private LocalDateTime createdAt;
}
