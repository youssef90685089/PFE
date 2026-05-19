package com.project.sipms.repository;

import com.project.sipms.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByActiveTrue();
    List<Quiz> findBySpecialtyAndActiveTrue(String specialty);
    Optional<Quiz> findFirstBySpecialtyAndActiveTrue(String specialty);
    Optional<Quiz> findFirstBySpecialtyIgnoreCaseAndActiveTrue(String specialty);
}
