package com.backend.common.domain.project.project.entity;

import com.backend.common.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_views", indexes = {
        @Index(name = "idx_member_project_view", columnList = "member_id, project_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    private LocalDateTime viewedAt;

    @Builder
    public ProjectView(Member member, Project project) {
        this.member = member;
        this.project = project;
        this.viewedAt = LocalDateTime.now();
    }

}
