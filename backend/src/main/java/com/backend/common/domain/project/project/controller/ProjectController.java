package com.backend.common.domain.project.project.controller;

import com.backend.common.domain.project.application.dto.ProjectApplicationCreateRequest;
import com.backend.common.domain.project.application.dto.ProjectApplicationCreateResponse;
import com.backend.common.domain.project.exception.ProjectNotFoundException;
import com.backend.common.domain.project.project.dto.ProjectCreateRequest;
import com.backend.common.domain.project.project.dto.ProjectPermissionResponse;
import com.backend.common.domain.project.project.dto.ProjectResponse;
import com.backend.common.domain.project.project.dto.ProjectUpdateRequest;
import com.backend.common.domain.project.project.service.ProjectService;
import com.backend.common.global.rsdata.RsData;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public RsData<Page<ProjectResponse>> getProjects(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "tech", required = false) String tech,
            @RequestParam(value = "status", required = false) String status,
            @PageableDefault(size = 6, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProjectResponse> projectPage = projectService.getProjects(search, category, tech, status, pageable);
        
        return RsData.of("200", "프로젝트 목록 조회 성공", projectPage);
    }

    @GetMapping("/{id}")
    public RsData<ProjectResponse> getProject(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomMemberDetails userDetails) {
        try {
            ProjectResponse response = projectService.getProject(id);

            if (userDetails != null && userDetails.getMemberId() != null) {
                projectService.makeProjectView(id, userDetails.getMemberId());
            }

            return RsData.of("200", "프로젝트 조회 성공", response);
        } catch (NoSuchElementException ex) {
            throw new ProjectNotFoundException("404","Project not found");
        }
    }

    @PostMapping
    public ResponseEntity<RsData<ProjectResponse>> createProject(
            @RequestBody ProjectCreateRequest req,
            @AuthenticationPrincipal CustomMemberDetails principal
    ) {
        if (principal == null) {
            throw new InsufficientAuthenticationException("Login is required");
        }

        ProjectResponse project = projectService.createProject(req, principal.getMemberId());
        return ResponseEntity.ok(RsData.of("200", "프로젝트 생성 성공", project));
    }
    @GetMapping("/{id}/permissions")
    public RsData<ProjectPermissionResponse> getProjectPermissions(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomMemberDetails principal
    ) {
        boolean canEdit = principal != null
                && projectService.canEditProject(id, principal.getMemberId());
        boolean isMember = principal != null
                && projectService.isProjectMember(id, principal.getMemberId());
        Long pendingApplicationId = principal == null
                ? null
                : projectService.findPendingApplicationId(id, principal.getMemberId()).orElse(null);
        return RsData.of(
                "200",
                "프로젝트 권한 조회 성공",
                new ProjectPermissionResponse(canEdit, isMember, pendingApplicationId)
        );
    }

    @PutMapping("/{id}")
    public RsData<ProjectResponse> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectUpdateRequest req,
            @AuthenticationPrincipal CustomMemberDetails principal
    ) {
        if (principal == null) {
            throw new InsufficientAuthenticationException("Login is required");
        }

        return RsData.of(
                "200",
                "프로젝트 수정 성공",
                projectService.updateProject(id, req, principal.getMemberId())
        );
    }

    @PostMapping("/{id}/applications")
    public RsData<ProjectApplicationCreateResponse> applyProject(
            @PathVariable Long id,
            @RequestBody ProjectApplicationCreateRequest request,
            @AuthenticationPrincipal CustomMemberDetails principal
    ) {
        if (principal == null) {
            throw new InsufficientAuthenticationException("Login is required");
        }

        Long applicationId = projectService.applyProject(id, principal.getMemberId(), request);
        return RsData.of(
                "200",
                "프로젝트 지원 신청이 완료되었습니다.",
                new ProjectApplicationCreateResponse(applicationId)
        );
    }
}
