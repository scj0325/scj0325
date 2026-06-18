package com.backend.common.domain.member.dto;

import java.util.List;

public record UserResponse(
        String id,
        String name,
        String avatar,
        String role,
        String bio,
        List<String> techStack,
        String github,
        String portfolio,
        String location,
        boolean featured
) {
}
