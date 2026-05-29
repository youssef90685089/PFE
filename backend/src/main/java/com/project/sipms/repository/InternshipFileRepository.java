package com.project.sipms.repository;

import com.project.sipms.entity.InternshipFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InternshipFileRepository extends JpaRepository<InternshipFile, Long> {
    List<InternshipFile> findByCandidateId(Long candidateId);
}
