package com.backend.common.global.security;

import java.util.Map;

public record OAuth2UserInfo(String providerMemberId, String nickname, String profileImageUrl) {

    @SuppressWarnings("unchecked")
    public static OAuth2UserInfo from(String provider, Map<String, Object> attributes) {
        return switch (provider.toLowerCase()) {
            case "google" -> new OAuth2UserInfo(
                    String.valueOf(attributes.get("sub")),
                    (String) attributes.get("name"),
                    (String) attributes.get("picture")
            );
            case "github" -> new OAuth2UserInfo(
                    String.valueOf(attributes.get("id")),
                    (String) attributes.get("login"),
                    (String) attributes.get("avatar_url")
            );
            case "kakao" -> {
                Map<String, Object> kakaoAccount =
                        (Map<String, Object>) attributes.get("kakao_account");
                Map<String, Object> profile =
                        (Map<String, Object>) kakaoAccount.get("profile");
                yield new OAuth2UserInfo(
                        String.valueOf(attributes.get("id")),
                        (String) profile.get("nickname"),
                        (String) profile.get("profile_image_url")
                );
            }
            default -> throw new IllegalArgumentException("지원하지 않는 OAuth2 provider: " + provider);
        };
    }
}
