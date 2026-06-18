package com.backend.common.domain.techstack.controller;

import com.backend.common.domain.project.project.service.ProjectService;
import com.backend.common.domain.techstack.dto.TechStackResponse;
import com.backend.common.domain.techstack.repository.TechStackRepository;
import com.backend.common.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tech-stacks")
@RequiredArgsConstructor
public class TechStackController {

    private final ProjectService projectService;
    private final TechStackRepository techStackRepository;

    @GetMapping
    public RsData<List<String>> getPopularTechStacks() {
        return RsData.of("200", "기술 스택 목록 조회 성공", projectService.getPopularTechStacks());
    }

    @GetMapping("/all")
    public RsData<List<TechStackResponse>> getAllTechStacks() {
        List<TechStackResponse> result = techStackRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .map(ts -> new TechStackResponse(ts.getId(), ts.getName()))
                .toList();
        return RsData.of("200", "전체 기술 스택 목록 조회 성공", result);
    }
}
