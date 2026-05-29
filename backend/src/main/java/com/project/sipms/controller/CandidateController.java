package com.project.sipms.controller;

import com.project.sipms.common.ApiResponse;
import com.project.sipms.dto.CandidateDto;
import com.project.sipms.dto.CreateCandidateRequest;
import com.project.sipms.dto.InternshipFileDto;
import com.project.sipms.dto.UserDto;
import com.project.sipms.dto.ApproveAndSendQuizRequest;
import com.project.sipms.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    // ── Candidate CRUD (Admin / Receptionist) ──────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<CandidateDto>> createCandidate(@Valid @RequestBody CreateCandidateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Candidate created", candidateService.createCandidate(req)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<CandidateDto>>> getAllCandidates() {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getAllCandidates()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<ApiResponse<CandidateDto>> getCandidate(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getCandidateById(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok(ApiResponse.ok("Candidate deleted", null));
    }

    // ── Internship Files ───────────────────────────────────────────────

    @PostMapping("/{candidateId}/internship-files")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<InternshipFileDto>> addInternshipFile(
            @PathVariable Long candidateId,
            @Valid @RequestBody InternshipFileDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Internship file added",
                candidateService.addInternshipFile(candidateId, dto)));
    }

    @GetMapping("/{candidateId}/internship-files")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<InternshipFileDto>>> getInternshipFiles(@PathVariable Long candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getInternshipFiles(candidateId)));
    }

    @DeleteMapping("/internship-files/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Void>> deleteInternshipFile(@PathVariable Long fileId) {
        candidateService.deleteInternshipFile(fileId);
        return ResponseEntity.ok(ApiResponse.ok("Internship file deleted", null));
    }

    @PostMapping("/{candidateId}/internship-files/with-document")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<ApiResponse<InternshipFileDto>> addInternshipFileWithDocument(
            @PathVariable Long candidateId,
            @RequestParam("year") Integer year,
            @RequestParam("university") String university,
            @RequestParam("degree") String degree,
            @RequestParam("skillsTags") String skillsTags,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        InternshipFileDto dto = InternshipFileDto.builder()
                .year(year)
                .university(university)
                .degree(degree)
                .skillsTags(skillsTags)
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Internship file added",
                candidateService.addInternshipFileWithDocument(candidateId, dto, file)));
    }

    // ── Manager Action: Approve & Send Quiz ───────────────────────────

    /**
     * NEW ENDPOINT: Manager approves candidate and sends quiz invitation
     * Creates user account and sends welcome email with temp password
     */
    @PostMapping("/{candidateId}/approve-and-send-quiz")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> approveAndSendQuiz(
            @PathVariable Long candidateId,
            @RequestBody(required = false) ApproveAndSendQuizRequest req) {
        if (req == null) {
            req = new ApproveAndSendQuizRequest();
        }
        var user = candidateService.approveAndSendQuiz(candidateId, req);
        return ResponseEntity.ok(ApiResponse.ok("Candidate approved and quiz invitation sent successfully", toUserDto(user)));
    }

    // ── Manager Action: Send Quiz & Invite (Legacy) ────────────────────

    /**
     * LEGACY ENDPOINT: Kept for backward compatibility
     * Use /approve-and-send-quiz instead
     */

    @PostMapping("/{candidateId}/invite")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserDto>> sendQuizAndInvite(@PathVariable Long candidateId) {
        var user = candidateService.inviteAndSendQuiz(candidateId, null);
        return ResponseEntity.ok(ApiResponse.ok("User account created and quiz invite sent", toUserDto(user)));
    }

    private UserDto toUserDto(com.project.sipms.entity.User u) {
        return UserDto.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .roles(u.getRoles().stream().map(r -> r.getName()).collect(java.util.stream.Collectors.toList()))
                .active(u.isActive())
                .build();
    }
}
