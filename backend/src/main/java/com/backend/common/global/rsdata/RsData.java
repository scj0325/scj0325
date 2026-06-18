package com.backend.common.global.rsdata;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RsData<T> {
    private String code;
    private String message;
    private T data;

    public static <T> RsData<T> of(String code, String message) {
        return new RsData<>(code, message, null);
    }

    public static <T> RsData<T> of(String code, String message, T data) {
        return new RsData<>(code, message, data);
    }

    @JsonIgnore
    public int getStatusCode() {
        return Integer.parseInt(code);
    }
}
