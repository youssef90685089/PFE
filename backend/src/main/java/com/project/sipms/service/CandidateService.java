package com.project.sipms.service;

import com.project.sipms.common.BusinessException;
import com.project.sipms.common.FileStorageService;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.CandidateDto;
import com.project.sipms.entity.Candidate;
import com.project.sipms.repository.CandidateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final FileStorageService fileStorageService;

    public CandidateService(CandidateRepository candidateRepository,
                          FileStorageService fileStorageService) {
        this.candidateRepository = candidateRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<CandidateDto> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CandidateDto getCandidateById(Long id) {
        return toDto(candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", id)));
    }

    public CandidateDto getCandidateByUserId(Long userId) {
        return toDto(candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found for user: " + userId)));
    }

    @Transactional
    public CandidateDto updateProfile(Long userId, CandidateDto dto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found for user: " + userId));

        if (dto.getUniversity() != null) candidate.setUniversity(dto.getUniversity());
        if (dto.getDegree() != null) candidate.setDegree(dto.getDegree());
        if (dto.getGraduationYear() != null) candidate.setGraduationYear(dto.getGraduationYear());
        if (dto.getSkillsTags() != null) candidate.setSkillsTags(dto.getSkillsTags());
        if (dto.getBio() != null) candidate.setBio(dto.getBio());

        return toDto(candidateRepository.save(candidate));
    }

    @Transactional
    public String uploadCV(Long userId, MultipartFile file) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found for user: " + userId));

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
            !contentType.equals("application/msword") &&
            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new BusinessException("Invalid file type. Only PDF and DOCX files are allowed.");
        }

        // Validate file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("File size exceeds 10MB limit.");
        }

        // Store file
        String filePath = fileStorageService.storeFile(file, "cv");
        
        // Update candidate record
        candidate.setCvFilePath(filePath);
        candidateRepository.save(candidate);

        return filePath;
    }

    public CandidateDto toDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .fullName(c.getUser().getFirstName() + " " + c.getUser().getLastName())
                .email(c.getUser().getEmail())
                .university(c.getUniversity())
                .degree(c.getDegree())
                .graduationYear(c.getGraduationYear())
                .skillsTags(c.getSkillsTags())
                .cvFilePath(c.getCvFilePath())
                .photoPath(c.getPhotoPath())
                .bio(c.getBio())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
