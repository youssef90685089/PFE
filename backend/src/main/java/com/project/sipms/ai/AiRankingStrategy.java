package com.project.sipms.ai;

import com.project.sipms.dto.AiRankingDto;
import com.project.sipms.dto.CvProjectMatchDto;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Project;
import com.project.sipms.entity.Supervisor;

import java.util.List;

/**
 * Strategy interface for AI-based ranking.
 * Implementations can range from simple keyword matching to full LLM/API integration.
 * Swap implementations by changing the active @Primary bean.
 */
public interface AiRankingStrategy {

    /**
     * Rank projects by relevance/quality scoring.
     * @param projects List of projects to rank
     * @return Ranked list with scores and reasoning
     */
    List<AiRankingDto> rankProjects(List<Project> projects);

    /**
     * Match candidates to a supervisor based on CV skills vs expertise.
     * @param supervisor The supervisor to match against
     * @param candidates List of candidates to score
     * @return Ranked list of candidates with match scores
     */
    List<AiRankingDto> matchCandidates(Supervisor supervisor, List<Candidate> candidates);

    /**
     * Generate a 4-week project roadmap based on CV text.
     * @param cvText The text extracted from the candidate's CV
     * @return A structured roadmap string
     */
    String generateRoadmap(String cvText);

    /**
     * Match CV text to available projects and generate roadmap
     * @param cvText The text extracted from the candidate's CV
     * @param projects List of available projects to match against
     * @return Combined roadmap and project matches
     */
    CvProjectMatchDto matchCvToProjects(String cvText, List<Project> projects);
}
