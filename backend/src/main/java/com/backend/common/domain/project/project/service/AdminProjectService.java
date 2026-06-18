package com.backend.common.domain.project.project.service;

import com.backend.common.domain.project.project.dto.ProjectResponse;
import com.backend.common.domain.project.project.entity.Project;
import com.backend.common.domain.project.project.repository.ProjectMemberRepository;
import com.backend.common.domain.project.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectService projectService;

    public List<ProjectResponse> getHiddenProjects() {
        List<Project> projects = projectRepository.findByIsHiddenTrueOrderByUpdatedAtDesc();
        return projectService.convertToResponses(projects);
    }

    @Transactional
    public void unhideProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        project.unhide();
    }
}
