package com.backend.common.domain.project.project.controller;

import com.backend.common.domain.project.project.dto.ProjectResponse;
import com.backend.common.domain.project.project.service.AdminProjectService;
import com.backend.common.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {

    private final AdminProjectService adminProjectService;

    @GetMapping("/hidden")
    public ResponseEntity<RsData<List<ProjectResponse>>> getHiddenProjects() {
        List<ProjectResponse> projects = adminProjectService.getHiddenProjects();
        return ResponseEntity.ok(
                RsData.of("200", "숨겨진 프로젝트 목록 조회 성공", projects)
        );
    }

    @PatchMapping("/{projectId}/unhide")
    public ResponseEntity<RsData<Void>> unhideProject(@PathVariable Long projectId) {
        adminProjectService.unhideProject(projectId);
        return ResponseEntity.ok(
                RsData.of("200", "프로젝트 숨김이 해제되었습니다.")
        );
    }
}
