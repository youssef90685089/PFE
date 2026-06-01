package com.project.sipms.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Central Spring Security configuration.
 * Stateless JWT-based authentication with RBAC endpoint protection.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter,
                          JwtAuthenticationEntryPoint unauthorizedHandler) {
        this.jwtFilter = jwtFilter;
        this.unauthorizedHandler = unauthorizedHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless JWT API
            .csrf(csrf -> csrf.disable())

            // Enable CORS with our configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless session management
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Handle unauthorized access
            .exceptionHandling(ex ->
                ex.authenticationEntryPoint(unauthorizedHandler))

            // Endpoint authorization rules
            .authorizeHttpRequests(auth -> auth
                // Preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public endpoints
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/dev/**").permitAll()
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Admin-only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Candidates list — Receptionist also needs this
                .requestMatchers(HttpMethod.GET, "/api/users/candidates").hasAnyRole("ADMIN", "RECEPTIONIST")
                // All other /users/** endpoints are admin-only
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "RECEPTIONIST")

                // Receptionist can read quizzes to assign them; Manager/Admin can also write
                // Quizzes — refined access rules
                .requestMatchers(HttpMethod.GET, "/api/quizzes", "/api/quizzes/**").hasAnyRole("ADMIN", "MANAGER", "RECEPTIONIST", "CANDIDATE")
                .requestMatchers(HttpMethod.POST, "/api/quizzes/submit").hasRole("CANDIDATE")
                .requestMatchers(HttpMethod.POST, "/api/quizzes/*/assign/*").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers(HttpMethod.POST, "/api/quizzes", "/api/quizzes/").permitAll()
                .requestMatchers("/api/quizzes", "/api/quizzes/**").permitAll()
                .requestMatchers("/api/ai/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/dashboard/manager/**").hasAnyRole("ADMIN", "MANAGER")

                // Receptionist endpoints
                .requestMatchers("/api/reception/**").hasAnyRole("ADMIN", "RECEPTIONIST")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
