package com.project.sipms.repository;

import com.project.sipms.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCandidateIdOrderByScheduledAtDesc(Long candidateId);
    List<Interview> findByStatusOrderByScheduledAtAsc(String status);
    List<Interview> findAllByOrderByScheduledAtDesc();
}