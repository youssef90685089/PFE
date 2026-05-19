package com.project.sipms.security;

import com.project.sipms.entity.User;
import com.project.sipms.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class QuizTimeLimitInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;
    
    // 48 hours in minutes = 2880
    private static final int QUIZ_TIME_LIMIT_HOURS = 48;

    public QuizTimeLimitInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        
        // Only check quiz-related endpoints
        if (!path.contains("/quiz") && !path.contains("/api/quiz")) {
            return true;
        }

        // Skip if no user ID in request (not a user-specific quiz)
        String userIdParam = request.getParameter("userId");
        if (userIdParam == null) {
            return true;
        }

        try {
            Long userId = Long.parseLong(userIdParam);
            var userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                response.sendError(404, "User not found");
                return false;
            }

            User user = userOpt.get();
            
            // Check if this is a candidate
            boolean isCandidate = user.getRoles().stream()
                    .anyMatch(r -> r.getName().equals("ROLE_CANDIDATE"));
            
            if (!isCandidate) {
                return true; // Not a candidate, allow access
            }

            // Check status
            String status = user.getStatus();
            if ("quiz_completed".equals(status) || "quiz_failed".equals(status)) {
                return true; // Already completed or failed
            }

            // Check time limit
            LocalDateTime quizCreatedAt = user.getQuizCreatedAt();
            if (quizCreatedAt == null) {
                quizCreatedAt = user.getCreatedAt(); // Fallback to account creation
            }

            long hoursSinceCreation = ChronoUnit.HOURS.between(quizCreatedAt, LocalDateTime.now());
            
            if (hoursSinceCreation > QUIZ_TIME_LIMIT_HOURS) {
                // Time expired - update status and block
                user.setStatus("quiz_failed");
                userRepository.save(user);
                
                response.sendError(403, "Quiz time expired. You had 48 hours to complete the quiz.");
                return false;
            }

            return true;

        } catch (NumberFormatException e) {
            return true; // Invalid user ID format, allow
        }
    }
}