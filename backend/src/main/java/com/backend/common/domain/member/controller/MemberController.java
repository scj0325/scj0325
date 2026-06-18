package com.backend.common.domain.member.controller;

import com.backend.common.domain.member.dto.NicknameUpdateRequest;
import com.backend.common.domain.member.entity.Member;
import com.backend.common.domain.member.exception.MemberNotFoundException;
import com.backend.common.domain.member.repository.MemberRepository;
import com.backend.common.domain.member.dto.UserResponse;
import com.backend.common.domain.project.project.service.ProjectService;
import com.backend.common.global.rsdata.RsData;
import com.backend.common.global.security.userdetails.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {

    private final ProjectService projectService;
    private final MemberRepository memberRepository;

    private static final Set<String> FORBIDDEN = Set.of("admin", "test", "root", "system", "master", "bot",
            "관리자", "운영자", "어드민", "테스트", "시스템", "마스터", "루트", "tester","테스터");

    @GetMapping
    public RsData<List<UserResponse>> getMembers() {
        return RsData.of("200", "회원 목록 조회 성공", projectService.getMembers());
    }

    @GetMapping("/{id}")
    public RsData<UserResponse> getMember(@PathVariable Long id) {
        try {
            return RsData.of("200", "회원 조회 성공", projectService.getMember(id));
        } catch (NoSuchElementException ex) {
            throw new MemberNotFoundException("404","Member not found");
        }
    }

    /*
    *  회원 탈퇴
    * */
    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public RsData<Void> withdrawMember(
            @AuthenticationPrincipal CustomMemberDetails userDetails
    ){
        Member member = memberRepository.findById(userDetails.getMemberId())
                .orElseThrow(() -> new MemberNotFoundException("404","회원 정보가 없습니다."));

        member.withdraw();
        memberRepository.save(member);
        return RsData.of("200","회원 탈퇴 성공");
    }

    /*
    *  프로필 닉네임 수정
    * */
    @PatchMapping("/me/nickname")
    @PreAuthorize("isAuthenticated()")
    public RsData<Void> updateNickName(
            @AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestBody NicknameUpdateRequest request
            ){
        Member member = memberRepository.findById(userDetails.getMemberId())
                .orElseThrow(() -> new MemberNotFoundException("404","회원 정보가 없습니다."));

        String newNickname = request.nickname().trim();

        if(member.getNickname().equals(newNickname))
            return RsData.of("400","현재 닉네임과 동일합니다.");

        if(memberRepository.findByNickname(newNickname).isPresent())
            return RsData.of("400","이미 사용 중인 동일합니다.");

        if(FORBIDDEN.stream().anyMatch(w -> normalize(newNickname).contains(w)))
            return RsData.of("400","사용할 수 없는 닉네임 입니다.");

        member.updateNickName(newNickname);
        memberRepository.save(member);
        return RsData.of("200","닉네임 수정 성공");
    }


    private String normalize(String s){
        return s.toLowerCase()
                .replace("4","a").replace("@","a")
                .replace("3","e")
                .replace("1","i").replace("!","i")
                .replace("0","o")
                .replace("5","s").replace("$","s");

    }
}
