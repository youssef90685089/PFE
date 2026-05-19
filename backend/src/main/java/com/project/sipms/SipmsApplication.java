package com.project.sipms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * SIPMS — Smart Internship & Project Management System
 * Main application entry point.
 */
@SpringBootApplication
@EnableAsync
public class SipmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SipmsApplication.class, args);
    }
}
