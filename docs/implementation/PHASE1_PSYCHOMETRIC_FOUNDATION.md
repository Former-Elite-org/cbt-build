# Phase 1: Psychometric Foundation
## Implementation Guide - 4-6 Weeks

**Priority:** Critical  
**Timeline:** 4-6 weeks  
**Dependencies:** None (Foundation phase)

---

## Overview

Phase 1 establishes the psychometric foundation for scientifically valid assessments. These features are **critical** for any professional examination system.

---

## Feature 1: Test Blueprint System

### Purpose
Enable teachers to design balanced assessments that systematically cover curriculum content at appropriate cognitive levels.

### Database Changes
```sql
-- Test Blueprint Table
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
  FOREIGN KEY (exam_id) REFERENCES cbt_examinations(id) ON DELETE CASCADE
);

-- Blueprint Specifications (topic x cognitive level matrix)
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

### API Endpoints

**Create Blueprint**
```javascript
POST /api/cbt/blueprints
{
  "exam_id": "uuid",
  "subject_code": "MAT101",
  "specifications": [
    {
      "topic_name": "Algebra",
      "bloom_level": "Apply",
      "target_questions": 5,
      "target_marks": 10,
      "percentage_weight": 20
    }
  ]
}
```

**Get Blueprint Status**
```javascript
GET /api/cbt/blueprints/:exam_id/status
Response: {
  "coverage": {
    "topics": { "covered": 8, "total": 10, "percentage": 80 },
    "bloom_levels": { "Remember": 20%, "Understand": 30%, ... },
    "marks_distribution": { "achieved": 85, "target": 100 }
  }
}
```

### UI Components
- Blueprint Wizard (step-by-step guide)
- Specification Matrix (interactive grid)
- Coverage Heatmap (visual topic coverage)
- Bloom's Distribution Chart

### Implementation Tasks
- [ ] Create database tables
- [ ] Build backend blueprint engine
- [ ] Develop API endpoints
- [ ] Create UI components
- [ ] Add validation rules
- [ ] Write unit tests
- [ ] Create documentation

**Estimated Time:** 1.5 weeks

---

## Feature 2: Item Analysis Engine

### Purpose
Calculate psychometric properties of each question after exam administration to identify quality items.

### Database Changes
```sql
-- Item Analysis Results
CREATE TABLE item_analysis (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  exam_id VARCHAR(50),
  total_responses INT DEFAULT 0,
  correct_responses INT DEFAULT 0,
  
  -- Difficulty Index (P-value): 0.0-1.0
  difficulty_index DECIMAL(5,3),
  difficulty_level ENUM('Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'),
  
  -- Discrimination Index (D-value): -1.0 to 1.0
  discrimination_index DECIMAL(5,3),
  discrimination_quality ENUM('Excellent', 'Good', 'Fair', 'Poor', 'Reject'),
  
  -- Upper/Lower group analysis (27% rule)
  upper_group_correct INT,
  upper_group_total INT,
  lower_group_correct INT,
  lower_group_total INT,
  
  -- Point Biserial Correlation
  point_biserial DECIMAL(5,3),
  
  -- Item Quality Flag
  quality_flag ENUM('Excellent', 'Good', 'Needs Review', 'Reject') DEFAULT 'Good',
  quality_notes TEXT,
  
  analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES cbt_examinations(id) ON DELETE CASCADE,
  INDEX idx_quality (quality_flag),
  INDEX idx_difficulty (difficulty_level)
);

-- Distractor Analysis (for MCQ options)
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
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE,
  INDEX idx_question (question_id)
);
```

### Calculation Algorithms

**Difficulty Index (P-value)**
```javascript
function calculateDifficultyIndex(correctResponses, totalResponses) {
  const p = correctResponses / totalResponses;
  
  let level;
  if (p >= 0.90) level = 'Very Easy';
  else if (p >= 0.70) level = 'Easy';
  else if (p >= 0.40) level = 'Moderate';
  else if (p >= 0.20) level = 'Hard';
  else level = 'Very Hard';
  
  return { index: p, level };
}
```

**Discrimination Index (D-value)**
```javascript
function calculateDiscriminationIndex(responses, totalScores) {
  // Sort students by total score
  const sorted = responses.sort((a, b) => b.totalScore - a.totalScore);
  const n = sorted.length;
  
  // Upper 27% and Lower 27% groups
  const upperCount = Math.floor(n * 0.27);
  const lowerCount = Math.floor(n * 0.27);
  
  const upperGroup = sorted.slice(0, upperCount);
  const lowerGroup = sorted.slice(-lowerCount);
  
  const upperCorrect = upperGroup.filter(r => r.isCorrect).length;
  const lowerCorrect = lowerGroup.filter(r => r.isCorrect).length;
  
  const d = (upperCorrect - lowerCorrect) / upperCount;
  
  let quality;
  if (d >= 0.40) quality = 'Excellent';
  else if (d >= 0.30) quality = 'Good';
  else if (d >= 0.20) quality = 'Fair';
  else if (d >= 0.00) quality = 'Poor';
  else quality = 'Reject'; // Negative discrimination
  
  return { index: d, quality, upperCorrect, lowerCorrect };
}
```

### API Endpoints

**Analyze Exam Items**
```javascript
POST /api/cbt/analysis/items/:exam_id
Response: {
  "total_questions": 50,
  "analyzed": 50,
  "quality_summary": {
    "excellent": 20,
    "good": 15,
    "needs_review": 10,
    "reject": 5
  }
}
```

**Get Question Analysis**
```javascript
GET /api/cbt/analysis/questions/:question_id
Response: {
  "difficulty": { "index": 0.65, "level": "Moderate" },
  "discrimination": { "index": 0.42, "quality": "Excellent" },
  "distractors": [ ... ],
  "recommendations": ["Keep item", "Consider revision for option C"]
}
```

### UI Components
- Item Analysis Dashboard
- Question Quality Report
- Distractor Efficiency Chart
- Recommended Actions Panel

### Implementation Tasks
- [ ] Create database tables
- [ ] Implement calculation algorithms
- [ ] Build analysis engine (async job)
- [ ] Create API endpoints
- [ ] Develop UI dashboard
- [ ] Add export to Excel
- [ ] Write comprehensive tests

**Estimated Time:** 2 weeks

---

## Feature 3: Bloom's Taxonomy Classification

### Purpose
Tag questions with cognitive levels to ensure assessment covers appropriate thinking skills.

### Database Changes
```sql
-- Add bloom_level to questions table
ALTER TABLE cbt_exam_questions 
ADD COLUMN bloom_level ENUM('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create') DEFAULT 'Remember',
ADD COLUMN cognitive_complexity ENUM('Low', 'Medium', 'High'),
ADD COLUMN learning_objective TEXT,
ADD INDEX idx_bloom (bloom_level);

-- Bloom's Taxonomy Reference
CREATE TABLE blooms_taxonomy_guide (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_name VARCHAR(50),
  level_order INT,
  description TEXT,
  action_verbs TEXT, -- JSON array of typical verbs
  question_stems TEXT, -- JSON array of question starters
  example_questions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Seed Data
```javascript
const bloomsLevels = [
  {
    level_name: 'Remember',
    level_order: 1,
    description: 'Recall facts and basic concepts',
    action_verbs: JSON.stringify(['Define', 'List', 'State', 'Name', 'Identify', 'Recall']),
    question_stems: JSON.stringify(['What is...?', 'Who was...?', 'When did...?', 'List...'])
  },
  // ... other levels
];
```

### API Endpoints

**Get Bloom's Guide**
```javascript
GET /api/cbt/blooms-taxonomy
Response: [
  {
    "level": "Remember",
    "order": 1,
    "description": "...",
    "action_verbs": ["Define", "List", ...],
    "question_stems": ["What is...?", ...]
  }
]
```

**Classify Question**
```javascript
PUT /api/cbt/questions/:id/classify
{
  "bloom_level": "Apply",
  "learning_objective": "Calculate compound interest"
}
```

### UI Components
- Bloom's Level Selector (dropdown with descriptions)
- Taxonomy Helper Modal (verb suggestions)
- Learning Objective Input
- Bloom's Distribution Widget

### Implementation Tasks
- [ ] Alter question table schema
- [ ] Seed Bloom's reference data
- [ ] Create classification endpoints
- [ ] Build UI components
- [ ] Update question creation forms
- [ ] Add to blueprint integration

**Estimated Time:** 1 week

---

## Feature 4: Diagnostic Feedback Framework

### Purpose
Provide meaningful, actionable feedback beyond just correct/incorrect.

### Database Changes
```sql
-- Enhanced feedback system
CREATE TABLE question_feedback_templates (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50),
  feedback_type ENUM('correct', 'incorrect', 'partial', 'misconception'),
  feedback_text TEXT,
  remedial_content TEXT,
  related_topics JSON, -- Array of topic references
  difficulty_adjustment VARCHAR(50), -- "Try easier questions on..."
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id) ON DELETE CASCADE
);

-- Student feedback log
CREATE TABLE student_feedback_log (
  id VARCHAR(50) PRIMARY KEY,
  admission_no VARCHAR(50),
  exam_id VARCHAR(50),
  question_id VARCHAR(50),
  feedback_shown TEXT,
  viewed_at DATETIME,
  helpful_rating INT, -- 1-5 stars
  FOREIGN KEY (admission_no) REFERENCES students(admission_no),
  INDEX idx_student (admission_no)
);
```

### Feedback Types

1. **Correct Answer Feedback**
   - Reinforcement message
   - Extension question suggestion
   - Related advanced topic

2. **Incorrect Answer Feedback**
   - Explanation of correct answer
   - Common misconception addressed
   - Remedial resource link
   - Similar practice question

3. **Partial Credit Feedback** (for essays/short answers)
   - What was correct
   - What was missing
   - How to improve

### UI Components
- Rich Feedback Editor (WYSIWYG)
- Feedback Preview
- Student Feedback View
- Remedial Resources Panel

### Implementation Tasks
- [ ] Create database tables
- [ ] Build feedback API
- [ ] Create teacher feedback editor
- [ ] Develop student feedback viewer
- [ ] Add feedback to results page
- [ ] Implement rating system

**Estimated Time:** 1 week

---

## Feature 5: Item Bank Enhancement

### Purpose
Create a reusable item bank with quality metrics and usage history.

### Database Changes
```sql
-- Item Bank (questions library)
CREATE TABLE item_bank (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50), -- Link to actual question
  subject_code VARCHAR(50),
  topic_name VARCHAR(200),
  bloom_level VARCHAR(50),
  difficulty_level VARCHAR(50),
  
  -- Quality Metrics (aggregated from multiple uses)
  avg_difficulty_index DECIMAL(5,3),
  avg_discrimination_index DECIMAL(5,3),
  quality_rating ENUM('Excellent', 'Good', 'Fair', 'Poor') DEFAULT 'Good',
  
  -- Usage Statistics
  times_used INT DEFAULT 0,
  total_responses INT DEFAULT 0,
  avg_time_spent INT, -- seconds
  
  -- Metadata
  author_id VARCHAR(20),
  peer_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by VARCHAR(20),
  review_date DATETIME,
  status ENUM('Draft', 'Active', 'Retired', 'Needs Revision'),
  
  tags JSON, -- Searchable tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (question_id) REFERENCES cbt_exam_questions(id),
  INDEX idx_subject (subject_code),
  INDEX idx_quality (quality_rating),
  INDEX idx_status (status)
);

-- Item Bank Usage History
CREATE TABLE item_bank_usage (
  id VARCHAR(50) PRIMARY KEY,
  item_id VARCHAR(50),
  exam_id VARCHAR(50),
  used_date DATE,
  performance_summary JSON, -- Difficulty, discrimination from that exam
  FOREIGN KEY (item_id) REFERENCES item_bank(id),
  INDEX idx_item (item_id)
);
```

### API Endpoints

**Search Item Bank**
```javascript
GET /api/cbt/item-bank/search?subject=MAT101&bloom=Apply&quality=Good
Response: {
  "items": [ ... ],
  "total": 150,
  "filters_applied": { ... }
}
```

**Add to Item Bank**
```javascript
POST /api/cbt/item-bank
{
  "question_id": "uuid",
  "tags": ["quadratic", "word-problem"],
  "status": "Active"
}
```

### UI Components
- Item Bank Browser
- Advanced Search Interface
- Quality Filters
- Quick Add to Exam
- Batch Import/Export

### Implementation Tasks
- [ ] Create item bank tables
- [ ] Build search engine
- [ ] Create API endpoints
- [ ] Develop UI browser
- [ ] Add quality auto-update job
- [ ] Implement tagging system

**Estimated Time:** 1.5 weeks

---

## Phase 1 Summary

**Total Estimated Time:** 4-6 weeks

### Deliverables
- ✅ Test Blueprint System (1.5 weeks)
- ✅ Item Analysis Engine (2 weeks)
- ✅ Bloom's Taxonomy Integration (1 week)
- ✅ Diagnostic Feedback Framework (1 week)
- ✅ Item Bank Enhancement (1.5 weeks)

### Testing Requirements
- Unit tests for all calculations
- Integration tests for workflows
- User acceptance testing with teachers
- Performance testing with large datasets

### Documentation
- Teacher user guide
- API documentation
- Psychometric calculations reference
- Video tutorials

---

**Next Phase:** [Phase 2 - Standards & Analytics](./PHASE2_STANDARDS_ANALYTICS.md)
