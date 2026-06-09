package com.project.sipms.service;

import com.project.sipms.common.AuditService;
import com.project.sipms.common.ResourceNotFoundException;
import com.project.sipms.dto.ProjectDto;
import com.project.sipms.entity.Project;
import com.project.sipms.entity.Supervisor;
import com.project.sipms.entity.User;
import com.project.sipms.repository.ProjectRepository;
import com.project.sipms.repository.SupervisorRepository;
import com.project.sipms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SupervisorRepository supervisorRepository;
    private final AuditService auditService;

    public ProjectService(ProjectRepository projectRepository,
                          UserRepository userRepository,
                          SupervisorRepository supervisorRepository,
                          AuditService auditService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.supervisorRepository = supervisorRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        return toDto(projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id)));
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByUserId(Long userId) {
        return projectRepository.findBySubmittedById(userId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getManagedProjects(Long userId) {
        return supervisorRepository.findByUserId(userId)
                .map(supervisor -> projectRepository.findBySupervisorId(supervisor.getId()))
                .orElseGet(List::of)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto createProject(ProjectDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Project project = Project.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .domain(dto.getDomain())
                .technologyTags(dto.getTechnologyTags())
                .submittedBy(user)
                .status(Project.ProjectStatus.SUBMITTED)
                .build();

        ProjectDto result = toDto(projectRepository.save(project));
        auditService.log("CREATE_PROJECT", "PROJECT", result.getId(),
                "Project created: " + result.getTitle() + " by user " + userId);
        return result;
    }

    @Transactional
    public ProjectDto updateProjectStatus(Long id, String status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        project.setStatus(Project.ProjectStatus.valueOf(status));
        ProjectDto result = toDto(projectRepository.save(project));
        auditService.log("UPDATE_PROJECT_STATUS", "PROJECT", id,
                "Project " + result.getTitle() + " status changed to " + status);
        return result;
    }

    @Transactional
    public ProjectDto assignSupervisor(Long projectId, Long supervisorId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        Supervisor supervisor = supervisorRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", supervisorId));
        project.setSupervisor(supervisor);
        ProjectDto result = toDto(projectRepository.save(project));
        auditService.log("ASSIGN_SUPERVISOR", "PROJECT", projectId,
                "Supervisor " + supervisorId + " assigned to project " + result.getTitle());
        return result;
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setDomain(dto.getDomain());
        project.setTechnologyTags(dto.getTechnologyTags());
        
        ProjectDto result = toDto(projectRepository.save(project));
        auditService.log("UPDATE_PROJECT", "PROJECT", id, "Project updated: " + result.getTitle());
        return result;
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        projectRepository.delete(project);
        auditService.log("DELETE_PROJECT", "PROJECT", id, "Project deleted: " + project.getTitle());
    }

    public ProjectDto toDto(Project p) {
        ProjectDto.ProjectDtoBuilder builder = ProjectDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .domain(p.getDomain())
                .technologyTags(p.getTechnologyTags())
                .status(p.getStatus().name())
                .aiScore(p.getAiScore())
                .createdAt(p.getCreatedAt());

        if (p.getSubmittedBy() != null) {
            builder.submittedById(p.getSubmittedBy().getId())
                   .submittedByName(p.getSubmittedBy().getFirstName() + " " + p.getSubmittedBy().getLastName());
        }
        if (p.getSupervisor() != null) {
            builder.supervisorId(p.getSupervisor().getId())
                   .supervisorName(p.getSupervisor().getFullName());
        }
        return builder.build();
    }
}
