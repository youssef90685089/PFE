package com.project.sipms.service;

import com.project.sipms.common.BusinessException;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.CreateInterviewRequest;
import com.project.sipms.dto.InterviewDto;
import com.project.sipms.dto.UpdateInterviewResultRequest;
import com.project.sipms.entity.Candidate;
import com.project.sipms.entity.Interview;
import com.project.sipms.repository.CandidateRepository;
import com.project.sipms.repository.InterviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;

    public InterviewService(InterviewRepository interviewRepository, CandidateRepository candidateRepository) {
        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getAllInterviews() {
        return interviewRepository.findAllByOrderByScheduledAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getInterviewsByStatus(String status) {
        return interviewRepository.findByStatusOrderByScheduledAtAsc(status).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getInterviewsByCandidate(Long candidateId) {
        return interviewRepository.findByCandidateIdOrderByScheduledAtDesc(candidateId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InterviewDto scheduleInterview(CreateInterviewRequest req) {
        Candidate candidate = candidateRepository.findById(req.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", req.getCandidateId()));

        Interview interview = Interview.builder()
                .candidate(candidate)
                .scheduledAt(req.getScheduledAt() != null ? req.getScheduledAt() : java.time.LocalDateTime.now().plusDays(1))
                .interviewer(req.getInterviewer())
                .type(req.getType() != null ? req.getType() : "TECHNICAL")
                .status("SCHEDULED")
                .build();

        interview = interviewRepository.save(interview);
        return toDto(interview);
    }

    @Transactional
    public InterviewDto updateResult(Long interviewId, UpdateInterviewResultRequest req) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", interviewId));

        if (req.getScore() != null) interview.setScore(req.getScore());
        if (req.getNotes() != null) interview.setNotes(req.getNotes());
        if (req.getFeedback() != null) interview.setFeedback(req.getFeedback());
        if (req.getStatus() != null) interview.setStatus(req.getStatus());

        interview = interviewRepository.save(interview);
        return toDto(interview);
    }

    @Transactional
    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Interview", id);
        }
        interviewRepository.deleteById(id);
    }

    private InterviewDto toDto(Interview i) {
        return InterviewDto.builder()
                .id(i.getId())
                .candidateId(i.getCandidate().getId())
                .candidateName(i.getCandidate().getFirstName() + " " + i.getCandidate().getLastName())
                .candidateEmail(i.getCandidate().getEmail())
                .applicationId(i.getApplication() != null ? i.getApplication().getId() : null)
                .scheduledAt(i.getScheduledAt())
                .interviewer(i.getInterviewer())
                .type(i.getType())
                .status(i.getStatus())
                .score(i.getScore())
                .notes(i.getNotes())
                .feedback(i.getFeedback())
                .createdAt(i.getCreatedAt())
                .build();
    }
}