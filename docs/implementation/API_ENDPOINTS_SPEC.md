# API Endpoints Specification
## Complete REST API Reference

**Base URL:** `https://api.elitecbt.com/v2`  
**Authentication:** JWT Bearer Token

---

## Phase 1: Psychometric Foundation

### Test Blueprints

**Create Blueprint**
```http
POST /api/cbt/blueprints
Authorization: Bearer {token}
Content-Type: application/json

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

Response: 201 Created
{
  "success": true,
  "blueprint_id": "uuid",
  "message": "Blueprint created successfully"
}
```

**Get Blueprint Coverage**
```http
GET /api/cbt/blueprints/{exam_id}/coverage

Response: 200 OK
{
  "coverage": {
    "topics": { "covered": 8, "total": 10, "percentage": 80 },
    "bloom_levels": {
      "Remember": 20,
      "Understand": 30,
      "Apply": 25,
      "Analyze": 15,
      "Evaluate": 10
    }
  }
}
```

### Item Analysis

**Analyze Exam Items**
```http
POST /api/cbt/analysis/items/{exam_id}

Response: 200 OK
{
  "total_questions": 50,
  "analyzed": 50,
  "quality_summary": {
    "excellent": 20,
    "good": 15,
    "needs_review": 10,
    "reject": 5
  },
  "avg_difficulty": 0.65,
  "avg_discrimination": 0.38
}
```

**Get Question Analysis**
```http
GET /api/cbt/analysis/questions/{question_id}

Response: 200 OK
{
  "difficulty": {
    "index": 0.65,
    "level": "Moderate"
  },
  "discrimination": {
    "index": 0.42,
    "quality": "Excellent"
  },
  "distractors": [
    {
      "option": "A",
      "selections": 45,
      "efficiency": 0.85,
      "is_correct": false
    }
  ],
  "recommendations": ["Keep item"]
}
```

### Bloom's Taxonomy

**Classify Question**
```http
PUT /api/cbt/questions/{id}/classify
Content-Type: application/json

{
  "bloom_level": "Apply",
  "cognitive_complexity": "Medium",
  "learning_objective": "Calculate compound interest using formula"
}

Response: 200 OK
{
  "success": true,
  "message": "Question classified successfully"
}
```

### Item Bank

**Search Item Bank**
```http
GET /api/cbt/item-bank/search?subject=MAT101&bloom=Apply&quality=Good&page=1&limit=20

Response: 200 OK
{
  "items": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

## Phase 2: Standards & Analytics

### Curriculum Standards

**Import Standards**
```http
POST /api/cbt/standards/import
Content-Type: application/json

{
  "standard_body": "WAEC",
  "subject": "Mathematics",
  "standards": [...]
}

Response: 201 Created
{
  "success": true,
  "imported_count": 25
}
```

**Map Question to Standard**
```http
POST /api/cbt/questions/{id}/map-standards
Content-Type: application/json

{
  "standard_codes": ["WAEC-MAT-SSS3-001"],
  "alignment_strength": "Direct"
}

Response: 200 OK
```

### Reliability Analysis

**Calculate Reliability**
```http
POST /api/cbt/analysis/reliability/{exam_id}

Response: 200 OK
{
  "kr20": 0.85,
  "interpretation": "Good",
  "sem": 2.34,
  "confidence_intervals": {
    "95%": "±4.59",
    "68%": "±2.34"
  },
  "recommendations": [
    "Test has good reliability",
    "Consider reviewing items with low discrimination"
  ]
}
```

### Analytics

**Get Exam Analytics**
```http
GET /api/cbt/analytics/exam/{exam_id}

Response: 200 OK
{
  "summary": {
    "mean": 65.5,
    "median": 67.0,
    "std_dev": 12.3,
    "pass_rate": 78.5
  },
  "distribution": [...],
  "performance_levels": {
    "excellent": 15,
    "good": 25,
    "fair": 35,
    "poor": 25
  }
}
```

**Get Trend Analysis**
```http
GET /api/cbt/analytics/trends?subject=MAT101&class=SSS3A&period=term

Response: 200 OK
{
  "exams": [...],
  "scores": [65, 68, 72, 75],
  "trend": "improving",
  "growth_rate": 3.5
}
```

### Reporting

**Generate Report**
```http
POST /api/cbt/reports/generate
Content-Type: application/json

{
  "report_type": "individual_student",
  "exam_id": "uuid",
  "admission_no": "STU001",
  "format": "pdf"
}

Response: 200 OK
{
  "report_id": "uuid",
  "file_url": "https://cdn.elitecbt.com/reports/...",
  "expires_at": "2026-08-13T16:00:00Z"
}
```

---

## Phase 3: Advanced Assessment

### Adaptive Testing

**Start Adaptive Session**
```http
POST /api/cbt/adaptive/sessions
Content-Type: application/json

{
  "exam_id": "uuid",
  "admission_no": "STU001",
  "initial_ability": 0.0
}

Response: 201 Created
{
  "session_id": "uuid",
  "first_question": {...}
}
```

**Submit Answer & Get Next**
```http
POST /api/cbt/adaptive/sessions/{session_id}/answer
Content-Type: application/json

{
  "question_id": "uuid",
  "answer": "B",
  "is_correct": true
}

Response: 200 OK
{
  "current_ability": 0.35,
  "next_question": {...},
  "session_complete": false
}
```

### Proctoring

**Log Proctoring Event**
```http
POST /api/cbt/proctoring/events
Content-Type: application/json

{
  "exam_session_id": "uuid",
  "event_type": "tab_switch",
  "severity": "medium",
  "timestamp": "2026-08-06T15:30:00Z"
}

Response: 201 Created
```

**Get Integrity Report**
```http
GET /api/cbt/proctoring/integrity/{exam_session_id}

Response: 200 OK
{
  "integrity_score": 85,
  "violations_count": 3,
  "events": [...],
  "flagged_for_review": false
}
```

---

## Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "exam_id",
    "message": "Invalid UUID format"
  }
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "request_id": "uuid"
}
```

---

## Rate Limiting

- **Standard:** 1000 requests/hour
- **Analytics:** 100 requests/hour
- **Reports:** 50 requests/hour

---

## Authentication

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.com",
  "password": "********"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {...}
}
```

---

**Next:** [UI/UX Enhancements](./UI_UX_ENHANCEMENTS.md)
