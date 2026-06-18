package com.backend.common.global.security.userdetails;

import com.backend.common.domain.member.entity.OauthAccount;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@RequiredArgsConstructor
public class CustomMemberDetails implements UserDetails {

    private final Long memberId;
    private final String nickname;
    private final String status;

    public CustomMemberDetails(OauthAccount oauthAccount){
        this.memberId = oauthAccount.getMember().getId();
        this.nickname = oauthAccount.getMember().getNickname();
        this.status = oauthAccount.getMember().getStatus();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public @Nullable String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return this.nickname;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !"BANNED".equals(this.status);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "ACTIVE".equals(this.status);
    }


}
