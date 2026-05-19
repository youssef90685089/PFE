-- ============================================
-- SIPMS RECRUITMENT MODULE - DATABASE SCHEMA
-- ============================================

-- 1. ADD COLUMNS TO EXISTING USERS TABLE (for candidates)
ALTER TABLE users 
ADD COLUMN specialty VARCHAR(100) AFTER last_name,
ADD COLUMN status ENUM('pending_quiz', 'quiz_completed', 'quiz_failed', 'interview_scheduled', 'hired', 'rejected') DEFAULT 'pending_quiz' AFTER specialty,
ADD COLUMN quiz_created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status,
ADD COLUMN quiz_completed_at DATETIME NULL AFTER quiz_created_at,
ADD COLUMN quiz_score INT NULL AFTER quiz_completed_at;

-- 2. CREATE SPECIALTIES TABLE (for filtering)
CREATE TABLE IF NOT EXISTS specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERT DEFAULT SPECIALTIES
INSERT IGNORE INTO specialties (name, description) VALUES 
('Web Development', 'Web development and frontend technologies'),
('Security', 'Cybersecurity and network security'),
('Power BI', 'Business Intelligence and data analytics'),
('Data Science', 'Machine learning and data analysis'),
('Cloud Computing', 'AWS, Azure, GCP cloud services'),
('Mobile Development', 'iOS and Android development'),
('DevOps', 'CI/CD and infrastructure'),
('Backend Development', 'Server-side programming');

-- 4. CREATE QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    specialty_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    questions_count INT DEFAULT 10,
    passing_score INT DEFAULT 70,
    time_limit_minutes INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);

-- 5. CREATE QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    points INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- 6. CREATE QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT,
    passed BOOLEAN,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- 7. SAMPLE QUIZ FOR WEB DEVELOPMENT
INSERT INTO quizzes (specialty_id, title, description, questions_count, passing_score, time_limit_minutes)
VALUES (1, 'Web Development Assessment', 'Technical quiz for web developers', 10, 70, 30);

-- 8. SAMPLE QUESTIONS FOR WEB QUIZ
INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
(1, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks Text Mark Language', 'A'),
(1, 'What does CSS stand for?', 'Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Sheets', 'A'),
(1, 'What is React?', 'A JavaScript library', 'A programming language', 'A database', 'An operating system', 'A'),
(1, 'What is the correct way to declare a variable in JavaScript?', 'var x = 5', 'variable x = 5', 'int x = 5', 'v x = 5', 'A'),
(1, 'What does API stand for?', 'Application Programming Interface', 'Advanced Programming Integration', 'Application Process Integration', 'Automated Programming Interface', 'A');

-- ============================================
-- SAMPLE DATA QUERIES
-- ============================================

-- View all specialties
SELECT * FROM specialties;

-- View all quizzes with specialty names
SELECT q.id, s.name as specialty, q.title, q.questions_count, q.passing_score, q.time_limit_minutes
FROM quizzes q
JOIN specialties s ON q.specialty_id = s.id
WHERE q.is_active = TRUE;

-- View candidates by status
SELECT id, email, first_name, last_name, specialty, status, quiz_created_at 
FROM users 
WHERE roles LIKE '%CANDIDATE%'
ORDER BY status;

-- View candidates by specialty
SELECT specialty, COUNT(*) as total, 
       SUM(CASE WHEN status = 'pending_quiz' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'quiz_completed' THEN 1 ELSE 0 END) as completed
FROM users 
GROUP BY specialty;