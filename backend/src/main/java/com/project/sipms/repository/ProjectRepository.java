package com.project.sipms.repository;

import com.project.sipms.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findBySubmittedById(Long userId);
    List<Project> findByStatus(Project.ProjectStatus status);
    List<Project> findBySupervisorId(Long supervisorId);
}
