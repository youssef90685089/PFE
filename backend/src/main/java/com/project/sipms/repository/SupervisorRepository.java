package com.project.sipms.repository;

import com.project.sipms.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {
    List<Supervisor> findByActiveTrue();
    List<Supervisor> findByDepartment(String department);
    List<Supervisor> findByExpertiseTagsContainingIgnoreCase(String tag);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Supervisor> findByEmailIgnoreCase(String email);
}
