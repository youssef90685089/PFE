package com.project.sipms.repository;

import com.project.sipms.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByCandidateUserId(Long userId);
    List<Application> findByStatus(Application.ApplicationStatus status);
    List<Application> findBySupervisorId(Long supervisorId);

    java.util.Optional<Application> findFirstByIntakeMethodAndRegisteredById(
            Application.IntakeMethod intakeMethod, Long registeredById);

    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT MONTH(a.createdAt), COUNT(a) FROM Application a WHERE YEAR(a.createdAt) = :year GROUP BY MONTH(a.createdAt)")
    List<Object[]> countByMonthForYear(int year);

    long countByStatus(Application.ApplicationStatus status);
}
