package com.Bar.Mar.spring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import java.util.Collections;

@SpringBootApplication
public class SpringEP {

    public static void main(String port) {

        SpringApplication app = new SpringApplication(SpringEP.class);
        app.setDefaultProperties(Collections
                .singletonMap("server.port", port));

        app.setHeadless(false);
        app.run();
    }
}
