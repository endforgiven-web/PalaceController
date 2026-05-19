package jPlusLibs.spring;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.net.URI;

public class HTTPUtils {

    public static <T> ResponseEntity<T> jsonCreate(T val) {
        return create(val, MediaType.APPLICATION_JSON);
    }

    public static <T> ResponseEntity<T> create(T val, MediaType mediaType) {
        return ResponseEntity
                .created(URI.create(""))
                .contentType(mediaType)
                .body(val);
    }
}
