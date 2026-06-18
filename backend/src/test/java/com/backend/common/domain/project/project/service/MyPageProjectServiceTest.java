package com.backend.common.domain.project.project.service;

import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.project.application.entity.ProjectApplication;
import com.backend.common.domain.project.application.repository.ProjectApplicationRepository;
import com.backend.common.domain.project.enums.PositionType;
import com.backend.common.domain.project.enums.SelectionStatus;
import com.backend.common.domain.project.project.entity.Project;
import com.backend.common.domain.project.project.entity.ProjectMember;
import com.backend.common.domain.project.project.repository.ProjectMemberRepository;
import com.backend.common.domain.project.project.repository.ProjectRepository;
import com.backend.common.domain.project.project.repository.ProjectViewRepository;
import com.backend.common.global.exception.exception.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MyPageProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private ProjectApplicationRepository projectApplicationRepository;
    @Mock private ProjectViewRepository projectViewRepository;
    @Mock private ProjectMemberRepository projectMemberRepository;

    @InjectMocks private MyPageProjectService myPageProjectService;

    // ================= 최근 본 목록 삭제 테스트 =================

    @Test
    @DisplayName("최근 본 프로젝트 내역 개별 삭제 - 레포지토리 호출 위임 검증")
    void deleteRecentlyViewedProject_success() {
        // when
        myPageProjectService.deleteRecentlyViewedProject(1L, 10L);

        // then
        verify(projectViewRepository, times(1)).deleteByMemberIdAndProjectId(1L, 10L);
    }

    // ================= 프로젝트 공고 지원서 승인/거절 테스트 =================

    @Test
    @DisplayName("들어온 지원서 수락 성공 - 팀원 명부에 자동 추가")
    void handleApplicationAction_accept_success() {
        // given
        ProjectApplication application = mock(ProjectApplication.class);
        Project project = mock(Project.class);
        Member applicant = mock(Member.class);

        given(projectApplicationRepository.findById(50L)).willReturn(Optional.of(application));
        given(application.getProject()).willReturn(project);
        given(application.getApplicant()).willReturn(applicant);
        given(application.getPosition()).willReturn(PositionType.BACKEND);

        // when
        myPageProjectService.handleApplicationAction(1L, 50L, true);

        // then
        verify(application, times(1)).accept(); // 엔티티 행위 메서드 호출 검증
        verify(projectMemberRepository, times(1)).save(any(ProjectMember.class));
    }

    @Test
    @DisplayName("들어온 지원서 거절 성공 - 지원 내역 삭제 후 팀원 배치 안 됨")
    void handleApplicationAction_reject_success() {
        // given
        ProjectApplication application = mock(ProjectApplication.class);
        given(projectApplicationRepository.findById(50L)).willReturn(Optional.of(application));

        // when
        myPageProjectService.handleApplicationAction(1L, 50L, false);

        // then
        verify(projectApplicationRepository, times(1)).delete(application);
        verify(projectMemberRepository, never()).save(any());
    }

    // ================= 내가 신청한 지원 취소(철회) 테스트 =================

    @Test
    @DisplayName("내가 넣은 프로젝트 지원 취소 성공")
    void cancelProjectApplication_success() {
        // given
        ProjectApplication application = mock(ProjectApplication.class);
        given(projectApplicationRepository.findById(50L)).willReturn(Optional.of(application));
        given(application.getStatus()).willReturn(SelectionStatus.PENDING);

        // when
        myPageProjectService.cancelProjectApplication(1L, 50L);

        // then
        verify(projectApplicationRepository, times(1)).delete(application);
    }

    @Test
    @DisplayName("지원 취소 실패 - 내역 없음 예외")
    void cancelProjectApplication_notFound_throws() {
        // given
        given(projectApplicationRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> myPageProjectService.cancelProjectApplication(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
