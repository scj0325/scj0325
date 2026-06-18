package com.backend.common.domain.member.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nickname;

    private String profileImageUrl;

    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, BANNED

    private LocalDateTime suspensionUntil;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public static Member create(String nickname, String profileImageUrl) {
        Member member = new Member();
        member.nickname = nickname;
        member.profileImageUrl = profileImageUrl;
        member.status = "ACTIVE";
        member.createdAt = LocalDateTime.now();
        member.updatedAt = member.createdAt;
        return member;
    }

    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void withdraw() {
        this.status = "WITHDRAWN";
        this.deletedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updateNickName(String nickname){
        this.nickname = nickname;
    }

}
