package com.backend.common.domain.project.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectPosition {

    @Column(name = "position_role")
    private String role;

    @Column(name = "position_total")
    private int total;

    @Builder
    public ProjectPosition(String role, int total) {
        this.role = role;
        this.total = total;
    }

    public void changeRole(String role) {
        this.role = role;
    }
}

