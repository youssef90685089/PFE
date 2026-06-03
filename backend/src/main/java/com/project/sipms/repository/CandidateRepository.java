package com.project.sipms.repository;

import com.project.sipms.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmail(String email);
    Optional<Candidate> findByUserId(Long userId);
    boolean existsByEmail(String email);
    boolean existsByUserId(Long userId);

    /** Fetch all candidates with their linked User eagerly to avoid LazyInitializationException */
    @Query("SELECT c FROM Candidate c LEFT JOIN FETCH c.user")
    List<Candidate> findAllWithUser();
}
