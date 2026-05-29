package com.project.sipms.service;

import com.project.sipms.entity.Application;
import com.project.sipms.repository.ApplicationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final ApplicationRepository applicationRepository;

    @Value("${app.email.from:uuuser7890@gmail.com}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    public EmailService(JavaMailSender mailSender,
                        ApplicationRepository applicationRepository) {
        this.mailSender = mailSender;
        this.applicationRepository = applicationRepository;
    }

    // ── Application Status Emails ────────────────────────────────────────────

    @Async
    public void sendApplicationStatusUpdate(Long applicationId) {
        if (!emailEnabled) {
            log.debug("Email disabled, skipping notification for application {}", applicationId);
            return;
        }

        Application app = applicationRepository.findById(applicationId).orElse(null);
        if (app == null) {
            log.warn("Application {} not found for email", applicationId);
            return;
        }

        String email = app.getCandidate().getUser().getEmail();
        String candidateName = app.getCandidate().getUser().getFirstName();
        String status = app.getStatus().name();
        String subject;
        String body;

        switch (status) {
            case "ACCEPTED" -> {
                subject = "Congratulations! Your Application Has Been Accepted";
                body = buildAcceptedEmail(candidateName, app);
            }
            case "REJECTED" -> {
                subject = "Application Status Update";
                body = buildRejectedEmail(candidateName, app);
            }
            case "QUIZ_PENDING" -> {
                subject = "Quiz Available - Complete Your Assessment";
                body = buildQuizEmail(candidateName, app);
            }
            default -> {
                subject = "Application Status Update";
                body = buildDefaultEmail(candidateName, status);
            }
        }

        sendPlainEmail(email, subject, body);
    }

    @Async
    public void sendQuizReminder(Long applicationId) {
        if (!emailEnabled) return;

        Application app = applicationRepository.findById(applicationId).orElse(null);
        if (app == null) return;

        String email = app.getCandidate().getUser().getEmail();
        String candidateName = app.getCandidate().getUser().getFirstName();

        sendPlainEmail(email, "Reminder: Complete Your Technical Quiz",
                buildQuizReminderEmail(candidateName));
    }

    // ── Welcome Email (HTML) ──────────────────────────────────────────────────

    @Async
    public void sendWelcomeEmail(String to, String name, String tempPassword, String loginUrl) {
        if (!emailEnabled) {
            log.info("⚠️  Email disabled — skipping welcome email for {}", to);
            return;
        }
        log.info("📧 Sending welcome email to: {} ({})", to, name);
        String subject = "Welcome to SIPMS — Your Account Has Been Created";
        String html = buildWelcomeEmailHtml(name, to, tempPassword, loginUrl);
        sendHtmlEmail(to, subject, html);
    }

    /**
     * Send candidate welcome email with credentials and quiz deadline notice (48 hours)
     */
    @Async
    public void sendCandidateWelcomeEmail(String to, String name, String tempPassword, String loginUrl, String quizTitle) {
        if (!emailEnabled) {
            log.info("⚠️  Email disabled — skipping candidate welcome email for {}", to);
            return;
        }
        log.info("📧 Sending CANDIDATE welcome email to: {} ({}) - quiz: {}", to, name, quizTitle);
        String subject = "Welcome to SIPMS — Your Account & Quiz Information";
        String html = buildCandidateWelcomeEmailHtml(name, to, tempPassword, loginUrl, quizTitle);
        sendHtmlEmail(to, subject, html);
    }

    // ── Quiz Result Email (HTML) ──────────────────────────────────────────────

    @Async
    public void sendQuizResultEmail(String to, String name, double percentage, boolean passed,
                                    String quizTitle) {
        if (!emailEnabled) return;
        String subject = passed ? "Quiz Passed — " + quizTitle : "Quiz Result — " + quizTitle;
        String html = buildQuizResultHtml(name, quizTitle, percentage, passed);
        sendHtmlEmail(to, subject, html);
    }

    // ── Internal Helpers ──────────────────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);   // true = isHtml
            mailSender.send(message);
            log.info("✅ HTML email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("❌ Failed to send HTML email to {}: {} | Error: {}", to, subject, e.getMessage(), e);
            e.printStackTrace();
            throw new RuntimeException("Email send failed: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending HTML email to {}: {}", to, e.getMessage(), e);
            e.printStackTrace();
            throw new RuntimeException("Email send failed: " + e.getMessage(), e);
        }
    }

    private void sendPlainEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("✅ Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage(), e);
            e.printStackTrace();
        }
    }

    // ── Email Body Builders ───────────────────────────────────────────────────

    private String buildWelcomeEmailHtml(String name, String email, String password, String loginUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f6f9;">
                <div style="background: linear-gradient(135deg, #007EA7, #00A8E8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">CLINISYS</h1>
                    <p style="color: #E0F7FA; margin: 8px 0 0 0; font-size: 14px;">Management Portal</p>
                </div>

                <div style="background: white; padding: 36px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <h2 style="color: #007EA7; margin-top: 0; font-size: 22px;">Welcome to CLINISYS! &#x1F389;</h2>

                    <p>Dear <strong>%s</strong>,</p>
                    <p>Your account has been created by the administration. Use the credentials below to access the portal.</p>

                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #007EA7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 6px 0;"><strong>&#x1F517; Login URL:</strong> <a href="%s" style="color: #007EA7;">%s</a></p>
                        <p style="margin: 6px 0;"><strong>&#x1F4E7; Email:</strong> %s</p>
                        <p style="margin: 12px 0 6px 0;"><strong>&#x1F511; Password:</strong></p>
                        <div style="background: #1e293b; color: #7dd3fc; font-family: monospace; font-size: 20px; letter-spacing: 3px; padding: 14px 20px; border-radius: 6px; text-align: center; margin-top: 8px;">%s</div>
                    </div>

                    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
                        <p style="margin: 0; color: #c2410c; font-weight: bold;">&#x26A0; Security notice:</p>
                        <p style="margin: 6px 0 0 0; color: #7c2d12;">Please change your password after your first login. Do not share these credentials with anyone.</p>
                    </div>

                    <div style="text-align: center; margin: 28px 0 10px;">
                        <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #007EA7, #00A8E8); color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Login to Portal &rarr;</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">If you did not expect this email, please contact your administrator.<br>
                    <strong>CLINISYS Team</strong></p>
                </div>

                <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
                    <p>This is an automated message &mdash; please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(name, loginUrl, loginUrl, email, password, loginUrl);
    }

    private String buildQuizResultHtml(String name, String quizTitle, double percentage, boolean passed) {
        String color = passed ? "#16a34a" : "#dc2626";
        String bgColor = passed ? "#f0fdf4" : "#fef2f2";
        String borderColor = passed ? "#86efac" : "#fca5a5";
        String emoji = passed ? "🏆" : "📊";
        String statusText = passed ? "PASSED" : "FAILED";

        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f6f9;">
                <div style="background: linear-gradient(135deg, #007EA7, #00A8E8); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">SIPMS — Quiz Results</h1>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <p>Dear <strong>%s</strong>,</p>
                    <p>Your quiz <strong>"%s"</strong> has been graded. Here are your results:</p>

                    <div style="background: %s; border: 1px solid %s; border-radius: 10px; padding: 24px; text-align: center; margin: 20px 0;">
                        <div style="font-size: 48px; margin-bottom: 8px;">%s</div>
                        <div style="font-size: 42px; font-weight: bold; color: %s;">%.1f%%</div>
                        <div style="font-size: 18px; font-weight: bold; color: %s; margin-top: 6px; letter-spacing: 2px;">%s</div>
                    </div>

                    <p style="color: #64748b; font-size: 14px;">Log in to your dashboard to view detailed results and next steps.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;"><strong>SIPMS Team</strong></p>
                </div>
            </body>
            </html>
            """.formatted(name, quizTitle, bgColor, borderColor, emoji, color, percentage, color, statusText);
    }

    private String buildAcceptedEmail(String name, Application app) {
        return """
            Dear %s,

            Congratulations! We are pleased to inform you that your internship application has been ACCEPTED.

            Application ID: %d
            Decision Date: %s

            Next Steps:
            1. You will receive further instructions regarding onboarding
            2. Please check your dashboard for details

            Best regards,
            SIPMS Team
            """.formatted(name, app.getId(),
                app.getDecisionDate() != null
                    ? app.getDecisionDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "N/A");
    }

    private String buildRejectedEmail(String name, Application app) {
        return """
            Dear %s,

            Thank you for your interest in our internship program.
            After careful consideration, we regret to inform you that your application was not selected.

            Application ID: %d

            We encourage you to apply for future opportunities.

            Best regards,
            SIPMS Team
            """.formatted(name, app.getId());
    }

    private String buildQuizEmail(String name, Application app) {
        return """
            Dear %s,

            Your technical quiz is now available. Please complete it within 48 hours to proceed.

            Application ID: %d

            Log in to your dashboard to access the quiz.

            Best regards,
            SIPMS Team
            """.formatted(name, app.getId());
    }

    private String buildQuizReminderEmail(String name) {
        return """
            Dear %s,

            This is a reminder that you have a pending technical quiz.
            Please log in to complete it at your earliest convenience.

            Best regards,
            SIPMS Team
            """.formatted(name);
    }

    private String buildDefaultEmail(String name, String status) {
        return """
            Dear %s,

            Your application status has been updated to: %s

            Log in to your dashboard for more details.

            Best regards,
            SIPMS Team
            """.formatted(name, status);
    }

    /**
     * Build HTML email for candidate welcome with quiz deadline notice
     */
    private String buildCandidateWelcomeEmailHtml(String name, String email, String password, String loginUrl, String quizTitle) {
        String quizInfoHtml = (quizTitle != null && !quizTitle.isEmpty())
            ? String.format("""
                <div style="background: #e8f5e9; border: 1px solid #a5d6a7; border-left: 4px solid #2e7d32; border-radius: 8px; padding: 16px 18px; margin: 20px 0;">
                    <p style="margin: 0; color: #1b5e20; font-weight: bold; font-size: 16px;">&#x1F4DD; Assigned Quiz: <span style="color: #2e7d32;">%s</span></p>
                    <p style="margin: 8px 0 0 0; color: #33691e; font-size: 14px;">A technical quiz has been created and assigned to you. Please log in and complete it within 48 hours.</p>
                </div>
                """, quizTitle)
            : "";

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f6f9;">
                <div style="background: linear-gradient(135deg, #007EA7, #00A8E8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">SIPMS</h1>
                    <p style="color: #E0F7FA; margin: 8px 0 0 0; font-size: 14px;">Smart Internship Project Management System</p>
                </div>

                <div style="background: white; padding: 36px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <h2 style="color: #007EA7; margin-top: 0; font-size: 22px;">Welcome to SIPMS! &#x1F680;</h2>

                    <p>Dear <strong>%s</strong>,</p>
                    <p>Your candidate account has been created. Use the credentials below to access the portal and complete your technical assessment.</p>

                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #007EA7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 6px 0;"><strong>&#x1F517; Login URL:</strong> <a href="%s" style="color: #007EA7;">%s</a></p>
                        <p style="margin: 6px 0;"><strong>&#x1F4E7; Email:</strong> %s</p>
                        <p style="margin: 12px 0 6px 0;"><strong>&#x1F511; Password:</strong></p>
                        <div style="background: #1e293b; color: #7dd3fc; font-family: monospace; font-size: 18px; letter-spacing: 2px; padding: 14px 20px; border-radius: 6px; text-align: center; margin-top: 8px; word-break: break-all;">%s</div>
                    </div>

                    %s

                    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px 18px; margin: 20px 0;">
                        <p style="margin: 0 0 8px 0; color: #c2410c; font-weight: bold; font-size: 16px;">&#x23F0; Important: Quiz Deadline</p>
                        <p style="margin: 0; color: #7c2d12; font-size: 14px;"><strong>Your technical assessment quiz will be available for 48 hours only.</strong> Please log in and complete it as soon as possible to proceed with your application.</p>
                    </div>

                    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937;">Next Steps:</p>
                        <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                            <li>Log in to the portal using the credentials above</li>
                            <li>Complete your profile information</li>
                            <li>Take the technical assessment quiz within 48 hours</li>
                            <li>Upload your CV</li>
                            <li>Wait for evaluation results</li>
                        </ol>
                    </div>

                    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400e;">&#x26A0; <strong>Security Notice:</strong> Please change your password after your first login. Do not share these credentials with anyone.</p>
                    </div>

                    <div style="text-align: center; margin: 28px 0 10px;">
                        <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #007EA7, #00A8E8); color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Login to Portal &rarr;</a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #64748b; font-size: 13px; margin: 0;">If you have any questions, please contact the recruitment team.<br>
                    <strong>SIPMS Team</strong></p>
                </div>

                <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
                    <p>This is an automated message &mdash; please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(name, loginUrl, loginUrl, email, password, quizInfoHtml, loginUrl);
    }}
