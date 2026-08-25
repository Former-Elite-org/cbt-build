# Database Schema Changes
## Complete Migration Guide

**Version:** 2.0  
**Target System:** elite-cbt-api

---

## Overview

This document consolidates all database schema changes required across all three implementation phases.

---

## Migration Strategy

### Approach
1. **Incremental migrations** - Apply changes phase-by-phase
2. **Zero-downtime** - Use additive changes where possible
3. **Rollback support** - Maintain rollback scripts
4. **Data preservation** - No data loss during migration

### Migration Sequence
```bash
# Phase 1 Migrations
mysql -u root -p elite_cbt < migrations/phase1_001_test_blueprints.sql
mysql -u root -p elite_cbt < migrations/phase1_002_item_analysis.sql
mysql -u root -p elite_cbt < migrations/phase1_003_blooms_taxonomy.sql
mysql -u root -p elite_cbt < migrations/phase1_004_feedback_system.sql
mysql -u root -p elite_cbt < migrations/phase1_005_item_bank.sql

# Phase 2 Migrations
mysql -u root -p elite_cbt < migrations/phase2_001_curriculum_standards.sql
mysql -u root -p elite_cbt < migrations/phase2_002_reliability_analysis.sql
mysql -u root -p elite_cbt < migrations/phase2_003_analytics_summary.sql
mysql -u root -p elite_cbt < migrations/phase2_004_moderation_workflow.sql
mysql -u root -p elite_cbt < migrations/phase2_005_report_templates.sql

# Phase 3 Migrations
mysql -u root -p elite_cbt < migrations/phase3_001_adaptive_testing.sql
mysql -u root -p elite_cbt < migrations/phase3_002_irt_parameters.sql
mysql -u root -p elite_cbt < migrations/phase3_003_proctoring.sql
mysql -u root -p elite_cbt < migrations/phase3_004_competencies.sql
mysql -u root -p elite_cbt < migrations/phase3_005_longitudinal_tracking.sql
```

---

## Phase 1: Psychometric Foundation

### 1. Test Blueprints
```sql
CREATE TABLE test_blueprints (
  id VARCHAR(50) PRIMARY KEY,
  exam_id VARCHAR(50),
  subject_code VARCHAR(50),
  total_marks INT,
  created_by VARCHAR(20),
  school_id VARCHAR(20),
  branch_id VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES cbt_examinations(id) ON DELETE CASCADE,
  INDEX idx_exam (exam_id)
);

CREATE TABLE blueprint_specifications (
  id VARCHAR(50) PRIMARY KEY,
  blueprint_id VARCHAR(50),
  topic_name VARCHAR(200),
  bloom_level ENUM('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'),
  target_questions INT,
  target_marks INT,
  actual_questions INT DEFAULT 0,
  actual_marks INT DEFAULT 0,
  percentage_weight DECIMAL(5,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blueprint_id) REFERENCES test_blueprints(id) ON DELETE CASCADE,
  INDEX idx_blueprint (blueprint_id),
  INDEX idx_bloom (bloom_level)
);
```

### 2. Item Analysis
```sql
CREATE TABLE item_analysis (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  exam_id VARCHAR(50),
  total_responses INT DEFAULT 0,
  correct_responses INT DEFAULT 0,
  difficulty_index DECIMAL(5,3),
  difficulty_level ENUM('Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'),
  discrimination_index DECIMAL(5,3),
  discrimination_quality ENUM('Excellent', 'Good', 'Fair', 'Poor', 'Reject'),
  upper_group_correct INT,
  upper_group_total INT,
  lower_group_correct INT,
  lower_group_total INT,
  point_biserial DECIMAL(5,3),
  quality_flag ENUM('Excellent', 'Good', 'Needs Review', 'Reject') DEFAULT 'Good',
  quality_notes TEXT,
  analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES cbt_examinations(id) ON DELETE CASCADE
);

CREATE TABLE distractor_analysis (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  option_id VARCHAR(50),
  option_text TEXT,
  selection_count INT DEFAULT 0,
  selection_percentage DECIMAL(5,2),
  upper_group_selections INT,
  lower_group_selections INT,
  distractor_efficiency DECIMAL(5,3),
  is_correct BOOLEAN,
  analysis_notes TEXT,
  analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE
);
```

### 3. Bloom's Taxonomy
```sql
ALTER TABLE cbt_exam_questions 
ADD COLUMN bloom_level ENUM('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create') DEFAULT 'Remember',
ADD COLUMN cognitive_complexity ENUM('Low', 'Medium', 'High'),
ADD COLUMN learning_objective TEXT,
ADD INDEX idx_bloom (bloom_level);

CREATE TABLE blooms_taxonomy_guide (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_name VARCHAR(50),
  level_order INT,
  description TEXT,
  action_verbs TEXT,
  question_stems TEXT,
  example_questions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Feedback System
```sql
CREATE TABLE question_feedback_templates (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  feedback_type ENUM('correct', 'incorrect', 'partial', 'misconception'),
  feedback_text TEXT,
  remedial_content TEXT,
  related_topics JSON,
  difficulty_adjustment VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE
);

CREATE TABLE student_feedback_log (
  id VARCHAR(50) PRIMARY KEY,
  admission_no VARCHAR(50),
  exam_id VARCHAR(50),
  question_id VARCHAR(50),
  feedback_shown TEXT,
  viewed_at DATETIME,
  helpful_rating INT,
  FOREIGN KEY (admission_no) REFERENCES students(admission_no),
  INDEX idx_student (admission_no)
);
```

### 5. Item Bank
```sql
CREATE TABLE item_bank (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  subject_code VARCHAR(50),
  topic_name VARCHAR(200),
  bloom_level VARCHAR(50),
  difficulty_level VARCHAR(50),
  avg_difficulty_index DECIMAL(5,3),
  avg_discrimination_index DECIMAL(5,3),
  quality_rating ENUM('Excellent', 'Good', 'Fair', 'Poor') DEFAULT 'Good',
  times_used INT DEFAULT 0,
  total_responses INT DEFAULT 0,
  avg_time_spent INT,
  author_id VARCHAR(20),
  peer_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by VARCHAR(20),
  review_date DATETIME,
  status ENUM('Draft', 'Active', 'Retired', 'Needs Revision'),
  tags JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id),
  INDEX idx_subject (subject_code),
  INDEX idx_quality (quality_rating)
);
```

---

## Phase 2: Standards & Analytics

### 1. Curriculum Standards
```sql
CREATE TABLE curriculum_standards (
  id VARCHAR(50) PRIMARY KEY,
  standard_code VARCHAR(100) UNIQUE,
  standard_body VARCHAR(100),
  subject_code VARCHAR(50),
  grade_level VARCHAR(20),
  strand VARCHAR(200),
  standard_text TEXT,
  description TEXT,
  proficiency_levels JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subject (subject_code)
);

CREATE TABLE question_standards_mapping (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  standard_id VARCHAR(50),
  alignment_strength ENUM('Direct', 'Partial', 'Supportive') DEFAULT 'Direct',
  mapped_by VARCHAR(20),
  mapped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (standard_id) REFERENCES curriculum_standards(id)
);
```

### 2. Reliability Analysis
```sql
CREATE TABLE test_reliability_analysis (
  id VARCHAR(50) PRIMARY KEY,
  exam_id VARCHAR(50),
  kr20_coefficient DECIMAL(5,3),
  kr21_coefficient DECIMAL(5,3),
  cronbach_alpha DECIMAL(5,3),
  split_half_coefficient DECIMAL(5,3),
  spearman_brown_coefficient DECIMAL(5,3),
  sem DECIMAL(5,3),
  reliability_interpretation ENUM('Excellent', 'Good', 'Acceptable', 'Poor', 'Unacceptable'),
  reliability_notes TEXT,
  total_items INT,
  total_responses INT,
  mean_score DECIMAL(5,2),
  std_deviation DECIMAL(5,2),
  variance DECIMAL(5,2),
  analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES cbt_examinations(id) ON DELETE CASCADE
);
```

### 3. Analytics Summary
```sql
CREATE TABLE exam_analytics_summary (
  id VARCHAR(50) PRIMARY KEY,
  exam_id VARCHAR(50),
  total_students INT,
  mean_score DECIMAL(5,2),
  median_score DECIMAL(5,2),
  mode_score DECIMAL(5,2),
  std_deviation DECIMAL(5,2),
  min_score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  skewness DECIMAL(5,3),
  kurtosis DECIMAL(5,3),
  pass_rate DECIMAL(5,2),
  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES cbt_examinations(id) ON DELETE CASCADE
);
```

---

## Indexes for Performance

```sql
-- Critical indexes for query performance
CREATE INDEX idx_exam_branch ON cbt_examinations(school_id, branch_id);
CREATE INDEX idx_result_exam ON cbt_exam_results(exam_id, admission_no);
CREATE INDEX idx_response_question ON cbt_exam_responses(question_id, is_correct);
CREATE INDEX idx_analysis_quality ON item_analysis(quality_flag, discrimination_quality);
CREATE INDEX idx_student_performance ON student_performance_timeline(admission_no, exam_date);
```

---

## Migration Scripts Location

```
elite-cbt-api/database/migrations/
├── phase1/
│   ├── 001_test_blueprints.sql
│   ├── 002_item_analysis.sql
│   ├── 003_blooms_taxonomy.sql
│   ├── 004_feedback_system.sql
│   └── 005_item_bank.sql
├── phase2/
│   ├── 001_curriculum_standards.sql
│   ├── 002_reliability_analysis.sql
│   ├── 003_analytics_summary.sql
│   ├── 004_moderation_workflow.sql
│   └── 005_report_templates.sql
└── phase3/
    ├── 001_adaptive_testing.sql
    ├── 002_irt_parameters.sql
    ├── 003_proctoring.sql
    ├── 004_competencies.sql
    └── 005_longitudinal_tracking.sql
```

---

## Rollback Strategy

Each migration includes a rollback script:
```sql
-- Example: rollback_phase1_001_test_blueprints.sql
DROP TABLE IF EXISTS blueprint_specifications;
DROP TABLE IF EXISTS test_blueprints;
```

---

## Data Retention Policy

- **Exam data:** 5 years
- **Student results:** Permanent
- **Analytics:** 3 years
- **Proctoring logs:** 1 year
- **Item bank:** Permanent

---

**Next:** [API Endpoints Specification](./API_ENDPOINTS_SPEC.md)
