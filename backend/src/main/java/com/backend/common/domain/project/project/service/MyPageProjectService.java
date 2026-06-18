package com.backend.common.domain.project.project.service;

import com.backend.common.domain.project.application.entity.ProjectApplication;
import com.backend.common.domain.project.application.repository.ProjectApplicationRepository;
import com.backend.common.domain.project.enums.SelectionStatus;
import com.backend.common.domain.project.project.entity.Project;
import com.backend.common.domain.project.project.entity.ProjectMember;
import com.backend.common.domain.project.project.entity.ProjectRole;
import com.backend.common.domain.project.project.repository.ProjectMemberRepository;
import com.backend.common.domain.project.project.repository.ProjectRepository;
import com.backend.common.domain.project.project.repository.ProjectViewRepository;
import com.backend.common.global.exception.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MyPageProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final ProjectViewRepository projectViewRepository;
    private final ProjectMemberRepository projectMemberRepository;

    // ================= 마이페이지 프로젝트 조회 5종 =================

    public Page<Project> getMyOwnedProjects(Long memberId, Pageable pageable) {
        return projectRepository.findMyOwnedProjects(memberId, pageable);
    }

    public Page<Project> getMyParticipatingProjects(Long memberId, Pageable pageable) {
        return projectRepository.findMyParticipatingProjects(memberId, pageable);
    }

    public Page<Project> getMyAppliedProjects(Long memberId, Pageable pageable) {
        return projectRepository.findMyAppliedProjects(memberId, pageable);
    }

    public Page<Project> getMyCompletedProjects(Long memberId, Pageable pageable) {
        return projectRepository.findMyCompletedProjects(memberId, pageable);
    }

    public Page<Project> getMyRecentlyViewedProjects(Long memberId, Pageable pageable) {
        return projectRepository.findMyRecentlyViewedProjects(memberId, pageable);
    }

    /**
     * 최근 본 프로젝트 목록 내역 개별 물리 삭제 (Hard Delete)
     */
    @Transactional
    public void deleteRecentlyViewedProject(Long memberId, Long projectId) {
        projectViewRepository.deleteByMemberIdAndProjectId(memberId, projectId);
    }

    // ================= 프로젝트 지원 마이페이지 조회  =================


    /**
     * 내가 올린 프로젝트 중 지원이 온 목록 조회
     */
    public Page<ProjectApplication> getMyProjectApplications(Long memberId, Pageable pageable) {
        return projectApplicationRepository.findMyProjectApplications(memberId, pageable);
    }

    /**
     * 프로젝트 지원 수락 또는 거절 처리
     */
    @Transactional
    @PreAuthorize("@mypageAuthorizer.isProjectLeader(#applicationId, authentication.principal.memberId)")
    public void handleApplicationAction(Long memberId, Long applicationId, boolean isAccept) {

        ProjectApplication application = projectApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("404", "존재하지 않는 지원서입니다."));

        if (isAccept) {
            application.accept();

            ProjectMember projectMember = ProjectMember.builder()
                    .project(application.getProject())
                    .member(application.getApplicant())
                    .position(application.getPosition())
                    .role(ProjectRole.MEMBER)
                    .build();
            projectMemberRepository.save(projectMember);
        } else {
            projectApplicationRepository.delete(application);
        }
    }

    /**
     * 내가 신청한 프로젝트 지원 취소 처리
     */
    @Transactional
    /**
     * [주의] 로컬(HTTP) 환경 vs 배포(HTTPS) 환경 동작 차이 안내
     * * - 로컬 환경 (localhost:3000 -> 8080):
     * 크롬 등 최신 브라우저의 SameSite 쿠키 정책(일반 HTTP 및 크로스 도메인 제한)으로 인해
     * 프론트에서 credentials 옵션을 켜도 JWT 쿠키가 백엔드로 전달되지 않습니다.
     * 이로 인해 SecurityContext가 비어 있게 되어, @PreAuthorize 단계에서 403 Forbidden이 발생합니다.
     * (로컬 테스트 시 검증이 필요하다면 이 어노테이션을 잠시 주석 처리해야 합니다.)
     * * - 배포 환경 (Render 실서버 HTTPS):
     * 보안 프로토콜(HTTPS)이 적용되므로 프론트의 credentials와 백엔드의 allowCredentials(true)
     * 설정이 정상 작동하여 브라우저가 쿠키를 완벽하게 전달합니다.
     * 따라서 jwtAuthenticationFilter가 유저를 정상 식별하므로, @PreAuthorize 문턱을 문제없이 통과(200 OK)합니다.
     */
    @PreAuthorize("@mypageAuthorizer.isApplicant(#applicationId, authentication.principal.memberId)")
    public void cancelProjectApplication(Long memberId, Long projectId) {

        ProjectApplication application = projectApplicationRepository
                .findByApplicantIdAndProjectIdAndStatus(memberId, projectId, SelectionStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("404", "취소 가능한 대기 중인 지원 내역이 존재하지 않습니다."));

        projectApplicationRepository.delete(application);
    }

}
