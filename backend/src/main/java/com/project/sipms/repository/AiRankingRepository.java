package com.project.sipms.repository;

import com.project.sipms.entity.AiRanking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiRankingRepository extends JpaRepository<AiRanking, Long> {
    List<AiRanking> findByRankingTypeOrderByScoreDesc(AiRanking.RankingType type);
    List<AiRanking> findBySupervisorIdOrderByScoreDesc(Long supervisorId);
}
