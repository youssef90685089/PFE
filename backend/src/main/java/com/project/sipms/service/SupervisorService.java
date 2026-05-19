package com.project.sipms.service;

import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.common.BusinessException;
import com.project.sipms.dto.SupervisorDto;
import com.project.sipms.entity.Supervisor;
import com.project.sipms.repository.SupervisorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupervisorService {

    private final SupervisorRepository supervisorRepository;

    public SupervisorService(SupervisorRepository supervisorRepository) {
        this.supervisorRepository = supervisorRepository;
    }

    public List<SupervisorDto> getAllSupervisors() {
        return supervisorRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<SupervisorDto> getActiveSupervisors() {
        return supervisorRepository.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public SupervisorDto getSupervisorById(Long id) {
        return toDto(supervisorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", id)));
    }

    @Transactional
    public SupervisorDto createSupervisor(SupervisorDto dto) {
        // Validate email uniqueness
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            if (supervisorRepository.existsByEmailIgnoreCase(dto.getEmail())) {
                throw new BusinessException("A supervisor with this email already exists: " + dto.getEmail());
            }
        }
        
        // Validate required fields
        if (dto.getFullName() == null || dto.getFullName().isEmpty()) {
            throw new BusinessException("Full name is required");
        }
        if (dto.getEmail() == null || dto.getEmail().isEmpty()) {
            throw new BusinessException("Email is required");
        }
        if (dto.getDepartment() == null || dto.getDepartment().isEmpty()) {
            throw new BusinessException("Department is required");
        }
        
        Supervisor supervisor = Supervisor.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail().toLowerCase().trim())
                .department(dto.getDepartment())
                .expertiseTags(dto.getExpertiseTags() != null ? dto.getExpertiseTags() : "")
                .maxInterns(dto.getMaxInterns() > 0 ? dto.getMaxInterns() : 3)
                .currentInterns(0)  // Default to 0
                .bio(dto.getBio())
                .active(true)  // Default to active
                .build();
        return toDto(supervisorRepository.save(supervisor));
    }

    @Transactional
    public SupervisorDto updateSupervisor(Long id, SupervisorDto dto) {
        Supervisor s = supervisorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", id));
        
        // Check email uniqueness if email is being changed
        if (dto.getEmail() != null && !dto.getEmail().equals(s.getEmail())) {
            if (supervisorRepository.existsByEmailIgnoreCase(dto.getEmail())) {
                throw new BusinessException("A supervisor with this email already exists: " + dto.getEmail());
            }
            s.setEmail(dto.getEmail().toLowerCase().trim());
        }
        
        if (dto.getFullName() != null) s.setFullName(dto.getFullName());
        if (dto.getDepartment() != null) s.setDepartment(dto.getDepartment());
        if (dto.getExpertiseTags() != null) s.setExpertiseTags(dto.getExpertiseTags());
        if (dto.getBio() != null) s.setBio(dto.getBio());
        if (dto.getMaxInterns() > 0) s.setMaxInterns(dto.getMaxInterns());
        
        return toDto(supervisorRepository.save(s));
    }

    @Transactional
    public void deleteSupervisor(Long id) {
        if (!supervisorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supervisor", id);
        }
        supervisorRepository.deleteById(id);
    }

    public SupervisorDto toDto(Supervisor s) {
        return SupervisorDto.builder()
                .id(s.getId())
                .fullName(s.getFullName())
                .email(s.getEmail())
                .department(s.getDepartment())
                .expertiseTags(s.getExpertiseTags())
                .maxInterns(s.getMaxInterns())
                .currentInterns(s.getCurrentInterns())
                .bio(s.getBio())
                .active(s.isActive())
                .build();
    }
}
