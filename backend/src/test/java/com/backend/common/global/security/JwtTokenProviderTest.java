package com.backend.common.global.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "secretKey", "test-secret-key-minimum-32-characters-long!!");
        ReflectionTestUtils.setField(provider, "expirationMs", 3600000L);
        provider.init();
    }

    @Test
    void generateToken_thenGetMemberId_success() {
        String token = provider.generateToken(1L, "devuser");
        assertThat(provider.getMemberId(token)).isEqualTo(1L);
    }

    @Test
    void generateToken_thenGetNickname_success() {
        String token = provider.generateToken(1L, "devuser");
        assertThat(provider.getNickname(token)).isEqualTo("devuser");
    }

    @Test
    void isValid_withValidToken_returnsTrue() {
        String token = provider.generateToken(1L, "devuser");
        assertThat(provider.isValid(token)).isTrue();
    }

    @Test
    void isValid_withInvalidToken_returnsFalse() {
        assertThat(provider.isValid("invalid.token.here")).isFalse();
    }
}
