-- ============================================================
-- SIPMS — Smart Internship & Project Management System
-- Database Schema (MySQL 8.0)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────
-- 1. ROLES TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id`   BIGINT       NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50)  NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 2. USERS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`            BIGINT        NOT NULL AUTO_INCREMENT,
    `first_name`    VARCHAR(100)  NOT NULL,
    `last_name`     VARCHAR(100)  NOT NULL,
    `email`         VARCHAR(255)  NOT NULL UNIQUE,
    `password_hash` VARCHAR(255)  NOT NULL,
    `phone`         VARCHAR(20)   DEFAULT NULL,
    `avatar_url`    VARCHAR(500)  DEFAULT NULL,
    `active`        BOOLEAN       NOT NULL DEFAULT TRUE,
    `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 3. USER_ROLES (Many-to-Many Join)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 4. SUPERVISORS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `supervisors`;
CREATE TABLE `supervisors` (
    `id`             BIGINT        NOT NULL AUTO_INCREMENT,
    `user_id`        BIGINT        DEFAULT NULL,
    `full_name`      VARCHAR(200)  NOT NULL,
    `email`          VARCHAR(255)  NOT NULL,
    `department`     VARCHAR(200)  NOT NULL,
    `expertise_tags` VARCHAR(1000) NOT NULL COMMENT 'Comma-separated expertise keywords',
    `max_interns`    INT           NOT NULL DEFAULT 5,
    `current_interns`INT           NOT NULL DEFAULT 0,
    `bio`            TEXT          DEFAULT NULL,
    `active`         BOOLEAN       NOT NULL DEFAULT TRUE,
    `created_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_supervisors_department` (`department`),
    INDEX `idx_supervisors_active` (`active`),
    CONSTRAINT `fk_supervisors_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 5. CANDIDATES TABLE (extends user profile)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `candidates`;
CREATE TABLE `candidates` (
    `id`             BIGINT        NOT NULL AUTO_INCREMENT,
    `user_id`        BIGINT        NOT NULL UNIQUE,
    `university`     VARCHAR(300)  DEFAULT NULL,
    `degree`         VARCHAR(200)  DEFAULT NULL,
    `graduation_year`INT           DEFAULT NULL,
    `skills_tags`    VARCHAR(1000) DEFAULT NULL COMMENT 'Comma-separated skills',
    `cv_file_path`   VARCHAR(500)  DEFAULT NULL,
    `photo_path`     VARCHAR(500)  DEFAULT NULL,
    `bio`            TEXT          DEFAULT NULL,
    `created_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_candidates_user` (`user_id`),
    CONSTRAINT `fk_candidates_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 6. PROJECTS TABLE (internship project ideas)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
    `id`              BIGINT        NOT NULL AUTO_INCREMENT,
    `title`           VARCHAR(300)  NOT NULL,
    `description`     TEXT          NOT NULL,
    `domain`          VARCHAR(200)  DEFAULT NULL,
    `technology_tags` VARCHAR(1000) DEFAULT NULL COMMENT 'Comma-separated technologies',
    `submitted_by`    BIGINT        DEFAULT NULL COMMENT 'user_id of candidate',
    `supervisor_id`   BIGINT        DEFAULT NULL,
    `status`          ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
    `ai_score`        DOUBLE        DEFAULT NULL COMMENT 'AI-generated relevance score',
    `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_projects_status` (`status`),
    INDEX `idx_projects_submitted_by` (`submitted_by`),
    INDEX `idx_projects_supervisor` (`supervisor_id`),
    CONSTRAINT `fk_projects_submitted_by` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_projects_supervisor`   FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 7. APPLICATIONS TABLE (internship applications lifecycle)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
    `id`              BIGINT   NOT NULL AUTO_INCREMENT,
    `candidate_id`    BIGINT   NOT NULL,
    `project_id`      BIGINT   DEFAULT NULL,
    `supervisor_id`   BIGINT   DEFAULT NULL,
    `status`          ENUM('PENDING','UNDER_REVIEW','QUIZ_PENDING','QUIZ_COMPLETED','AI_EVALUATING','MANAGER_REVIEW','ACCEPTED','REJECTED') NOT NULL DEFAULT 'PENDING',
    `intake_method`   ENUM('ONLINE','PHYSICAL') NOT NULL DEFAULT 'ONLINE',
    `registered_by`   BIGINT   DEFAULT NULL COMMENT 'Receptionist user_id for physical intake',
    `manager_notes`   TEXT     DEFAULT NULL,
    `decision_date`   TIMESTAMP DEFAULT NULL,
    `ai_match_score`  DOUBLE   DEFAULT NULL,
    `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_applications_candidate` (`candidate_id`),
    INDEX `idx_applications_status` (`status`),
    INDEX `idx_applications_project` (`project_id`),
    INDEX `idx_applications_supervisor` (`supervisor_id`),
    CONSTRAINT `fk_applications_candidate`  FOREIGN KEY (`candidate_id`)  REFERENCES `candidates`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_applications_project`    FOREIGN KEY (`project_id`)    REFERENCES `projects`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_applications_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_applications_registered` FOREIGN KEY (`registered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 8. DOCUMENTS TABLE (uploaded files)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT       NOT NULL,
    `file_name`      VARCHAR(300) NOT NULL,
    `file_path`      VARCHAR(500) NOT NULL,
    `file_type`      VARCHAR(100) NOT NULL,
    `file_size`      BIGINT       DEFAULT NULL,
    `document_type`  ENUM('CV','COVER_LETTER','TRANSCRIPT','ID_CARD','PHOTO','OTHER') NOT NULL DEFAULT 'OTHER',
    `uploaded_by`    BIGINT       DEFAULT NULL,
    `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_documents_application` (`application_id`),
    CONSTRAINT `fk_documents_application` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_documents_uploader`    FOREIGN KEY (`uploaded_by`)    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 9. QUIZZES TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT,
    `title`         VARCHAR(300) NOT NULL,
    `description`   TEXT         DEFAULT NULL,
    `duration_mins` INT          NOT NULL DEFAULT 30,
    `passing_score` INT          NOT NULL DEFAULT 60 COMMENT 'Percentage',
    `total_marks`   INT          NOT NULL DEFAULT 100,
    `active`        BOOLEAN      NOT NULL DEFAULT TRUE,
    `created_by`    BIGINT       DEFAULT NULL,
    `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_quizzes_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 10. QUIZ_QUESTIONS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `quiz_id`        BIGINT       NOT NULL,
    `question_text`  TEXT         NOT NULL,
    `option_a`       VARCHAR(500) NOT NULL,
    `option_b`       VARCHAR(500) NOT NULL,
    `option_c`       VARCHAR(500) NOT NULL,
    `option_d`       VARCHAR(500) NOT NULL,
    `correct_option` CHAR(1)      NOT NULL COMMENT 'A, B, C, or D',
    `marks`          INT          NOT NULL DEFAULT 5,
    `order_index`    INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_quiz_questions_quiz` (`quiz_id`),
    CONSTRAINT `fk_quiz_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 11. QUIZ_ATTEMPTS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `quiz_attempts`;
CREATE TABLE `quiz_attempts` (
    `id`            BIGINT    NOT NULL AUTO_INCREMENT,
    `quiz_id`       BIGINT    NOT NULL,
    `candidate_id`  BIGINT    NOT NULL,
    `application_id`BIGINT    DEFAULT NULL,
    `score`         INT       DEFAULT NULL,
    `total_marks`   INT       DEFAULT NULL,
    `percentage`    DOUBLE    DEFAULT NULL,
    `passed`        BOOLEAN   DEFAULT NULL,
    `started_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `completed_at`  TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_quiz_attempts_candidate` (`candidate_id`),
    INDEX `idx_quiz_attempts_quiz` (`quiz_id`),
    INDEX `idx_quiz_attempts_application` (`application_id`),
    CONSTRAINT `fk_quiz_attempts_quiz`        FOREIGN KEY (`quiz_id`)       REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_quiz_attempts_candidate`   FOREIGN KEY (`candidate_id`)  REFERENCES `candidates`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_quiz_attempts_application` FOREIGN KEY (`application_id`)REFERENCES `applications`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 12. QUIZ_ANSWERS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `quiz_answers`;
CREATE TABLE `quiz_answers` (
    `id`          BIGINT  NOT NULL AUTO_INCREMENT,
    `attempt_id`  BIGINT  NOT NULL,
    `question_id` BIGINT  NOT NULL,
    `selected_option` CHAR(1) DEFAULT NULL COMMENT 'A, B, C, or D',
    `is_correct`  BOOLEAN DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_quiz_answers_attempt` (`attempt_id`),
    CONSTRAINT `fk_quiz_answers_attempt`  FOREIGN KEY (`attempt_id`)  REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_quiz_answers_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT       NOT NULL,
    `title`      VARCHAR(300) NOT NULL,
    `message`    TEXT         NOT NULL,
    `type`       ENUM('INFO','SUCCESS','WARNING','ERROR') NOT NULL DEFAULT 'INFO',
    `is_read`    BOOLEAN      NOT NULL DEFAULT FALSE,
    `link`       VARCHAR(500) DEFAULT NULL COMMENT 'Optional deep-link to related page',
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user` (`user_id`),
    INDEX `idx_notifications_read` (`is_read`),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 14. AUDIT_LOG TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`     BIGINT       DEFAULT NULL,
    `action`      VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id`   BIGINT       DEFAULT NULL,
    `details`     TEXT         DEFAULT NULL COMMENT 'JSON payload of changes',
    `ip_address`  VARCHAR(50)  DEFAULT NULL,
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_log_user` (`user_id`),
    INDEX `idx_audit_log_action` (`action`),
    INDEX `idx_audit_log_created` (`created_at`),
    CONSTRAINT `fk_audit_log_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- 15. AI_RANKINGS TABLE
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `ai_rankings`;
CREATE TABLE `ai_rankings` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT,
    `ranking_type`   ENUM('PROJECT_RANK','CANDIDATE_MATCH') NOT NULL,
    `reference_id`   BIGINT       NOT NULL COMMENT 'project_id or candidate_id',
    `supervisor_id`  BIGINT       DEFAULT NULL,
    `score`          DOUBLE       NOT NULL,
    `reasoning`      TEXT         DEFAULT NULL COMMENT 'AI explanation of the score',
    `ranked_by`      BIGINT       DEFAULT NULL COMMENT 'manager who triggered ranking',
    `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_ai_rankings_type` (`ranking_type`),
    INDEX `idx_ai_rankings_ref` (`reference_id`),
    CONSTRAINT `fk_ai_rankings_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors`(`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_ai_rankings_user`       FOREIGN KEY (`ranked_by`)     REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
