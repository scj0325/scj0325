package com.backend.common.domain.project.project.entity;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.project.enums.ProjectCategory;
import com.backend.common.domain.project.enums.ProjectStatus;
import com.backend.common.domain.techstack.entity.ProjectTechStack;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private Member leader;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ProjectCategory category;

    @Column(columnDefinition = "TEXT")
    private String goal;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    private boolean recruitmentOpen;
    private boolean isHidden;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectTechStack> projectTechStacks = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_positions", joinColumns = @JoinColumn(name = "project_id"))
    private List<ProjectPosition> positions = new ArrayList<>();

    @Builder
    public Project(
            Member leader,
            String title,
            String description,
            ProjectCategory category,
            String goal,
            LocalDate deadline,
            List<ProjectPosition> positions
    ) {
        this.leader = leader;
        this.title = title;
        this.description = description;
        this.category = category;
        this.goal = goal;
        this.deadline = deadline;
        this.positions = positions != null ? positions : new ArrayList<>();

        // 중요: 기본값이나 초기화 로직은 빌더 파라미터로 받지 않고 내부에서 강제 세팅
        this.status = ProjectStatus.RECRUITING; // 처음 만들 땐 무조건 모집중
        this.recruitmentOpen = true;            // 처음 만들 땐 무조건 활성화
        this.isHidden = false;                  // 처음엔 노출 상태
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void hide() {
        this.isHidden = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void unhide() {
        this.isHidden = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void addProjectTechStack(ProjectTechStack projectTechStack) {
        this.projectTechStacks.add(projectTechStack);
    }

    public void updateProjectTechStacks(List<ProjectTechStack> projectTechStacks) {
        this.projectTechStacks.clear();
        this.projectTechStacks.addAll(projectTechStacks);
        this.updatedAt = LocalDateTime.now();
    }

    public void update(
            String title,
            String description,
            ProjectCategory category,
            String goal,
            LocalDate deadline,
            boolean recruitmentOpen,
            List<ProjectPosition> positions
    ) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.goal = goal;
        this.deadline = deadline;
        this.recruitmentOpen = recruitmentOpen;
        this.positions.clear();
        this.positions.addAll(positions);
        this.updatedAt = LocalDateTime.now();
    }

    // ================= 비즈니스 로직 (상태 변경 메서드) =================

    /**
     * 1. 프로젝트 진행 시작 (IN_PROGRESS)
     * 허용 조건: RECRUITING 상태에서만 시작 가능
     */
    public void startProject() {
        if (this.status != ProjectStatus.RECRUITING) {
            throw new IllegalStateException("모집 중인 프로젝트만 진행 상태로 변경할 수 있습니다.");
        }
        this.status = ProjectStatus.IN_PROGRESS;
        this.recruitmentOpen = false; // 진행이 시작되면 팀원 모집은 자동으로 마감
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 2. 프로젝트 성공적 완료 (COMPLETED)
     * 허용 조건: IN_PROGRESS(진행 중) 상태에서만 완료 가능
     */
    public void completeProject() {
        if (this.status != ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("진행 중인 프로젝트만 완료 처리할 수 있습니다.");
        }
        this.status = ProjectStatus.COMPLETED;
        this.recruitmentOpen = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 3. 프로젝트 중도 해산/폭파 (DISBANDED)
     * 허용 조건: 시작 전(RECRUITING)이거나 진행 중(IN_PROGRESS)일 때만 폭파 가능
     * (이미 완수된 프로젝트나 취소된 프로젝트는 폭파 불가)
     */
    public void disbandProject() {
        if (this.status == ProjectStatus.COMPLETED || this.status == ProjectStatus.CANCELLED) {
            throw new IllegalStateException("이미 종료되었거나 취소된 프로젝트는 해산할 수 없습니다.");
        }
        this.status = ProjectStatus.DISBANDED;
        this.recruitmentOpen = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 4. 프로젝트 시작 전 취소 (CANCELLED)
     * 허용 조건: 팀원을 모집하던 중(RECRUITING) 아예 엎어지는 경우에만 가능
     */
    public void cancelProject() {
        if (this.status != ProjectStatus.RECRUITING) {
            throw new IllegalStateException("모집 중인 상태에서만 프로젝트를 취소할 수 있습니다.");
        }
        this.status = ProjectStatus.CANCELLED;
        this.recruitmentOpen = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 5. 모집 일시 중지 및 재개 (Recruitment Open/Close 관련 보조 메서드)
     * 프로젝트 상태가 RECRUITING 일 때만 수동으로 켜고 끌 수 있음
     */
    public void toggleRecruitment(boolean open) {
        if (this.status != ProjectStatus.RECRUITING) {
            throw new IllegalStateException("모집 중인 프로젝트만 모집 여부를 변경할 수 있습니다.");
        }
        this.recruitmentOpen = open;
        this.updatedAt = LocalDateTime.now();
    }

    /*
      더미데이터 만드는 용
     */
    public void changeStatus(ProjectStatus projectStatus) {
        this.status = projectStatus;
        if (projectStatus == ProjectStatus.COMPLETED) {
            this.recruitmentOpen = false;
        }
        this.updatedAt = LocalDateTime.now();
    }

    // 더미 데이터 초기화용 강제 상태 전이 메서드
    public void forceSetRecruitmentOpen(boolean recruitmentOpen) {
        this.recruitmentOpen = recruitmentOpen;
        this.updatedAt = LocalDateTime.now();
    }
}
