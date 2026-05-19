package com.project.sipms.repository;

import com.project.sipms.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByCandidateId(Long candidateId);
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByApplicationId(Long applicationId);
    boolean existsByCandidateIdAndQuizId(Long candidateId, Long quizId);
}
