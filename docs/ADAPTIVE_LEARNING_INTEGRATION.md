# Adaptive Learning Integration Guide

## Overview

This guide explains how to integrate the adaptive learning system into the existing quiz/exam flow.

---

## 🎯 Integration Points

### 1. **Exam Setup Integration**

Add competency mapping during exam creation:

```typescript
// In exam creation/editing form
import { CompetencyMap } from '@/features/competency';

// Allow teachers to map questions to competencies
<CompetencyMap 
  subjectCode={exam.subject_code}
  onCompetencySelect={(comp) => {
    // Map selected questions to this competency
    mapQuestionsToCompetency(selectedQuestions, comp.id);
  }}
/>
```

### 2. **Question Bank Integration**

Add competency tagging to questions:

```typescript
// In question creation/edit form
const handleQuestionSave = async (questionData) => {
  // Save question first
  const question = await saveQuestion(questionData);
  
  // Then map to competencies
  if (selectedCompetencies.length > 0) {
    await api.post('/cbt/question-competency/mappings/bulk', {
      mappings: selectedCompetencies.map(compId => ({
        question_id: question.id,
        competency_id: compId,
        weight: 1.0
      }))
    });
  }
};
```

### 3. **Adaptive Quiz Mode**

Create adaptive quiz route:

```typescript
// src/routes/AdaptiveQuiz.tsx
import { AdaptiveQuestionSelector } from '@/features/competency';

export const AdaptiveQuiz = () => {
  const { examId } = useParams();
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <AdaptiveQuestionSelector
        examId={examId}
        admissionNo={user.admission_no}
        subjectCode={exam?.subject_code}
        onQuestionSelect={(question) => {
          // Track question view
          trackQuestionView(question.id);
        }}
        onComplete={() => {
          // Navigate to results
          navigate(`/exam/${examId}/results`);
        }}
      />
    </div>
  );
};
```

### 4. **Student Progress Dashboard**

Add progress viewing route:

```typescript
// src/routes/StudentProgressDashboard.tsx
import { StudentProgress } from '@/features/competency';

export const StudentProgressDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <StudentProgress
        admissionNo={user.admission_no}
        subjectCode={selectedSubject}
      />
    </div>
  );
};
```

### 5. **Teacher Analytics**

Add competency analytics for teachers:

```typescript
// src/routes/TeacherCompetencyAnalytics.tsx
import { CompetencyMap, StudentProgress } from '@/features/competency';

export const TeacherCompetencyAnalytics = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <CompetencyMap 
          subjectCode={subjectCode}
          onCompetencySelect={(comp) => {
            // Show students struggling with this competency
            loadStudentsForCompetency(comp.id);
          }}
        />
      </div>
      <div>
        {selectedStudent && (
          <StudentProgress admissionNo={selectedStudent.admission_no} />
        )}
      </div>
    </div>
  );
};
```

---

## 📍 Route Configuration

Add these routes to your router:

```typescript
// src/routes/index.tsx
import { AdaptiveQuiz } from './AdaptiveQuiz';
import { StudentProgressDashboard } from './StudentProgressDashboard';
import { TeacherCompetencyAnalytics } from './TeacherCompetencyAnalytics';

export const routes = [
  // Student routes
  {
    path: '/exam/:examId/adaptive',
    element: <AdaptiveQuiz />,
    auth: 'student'
  },
  {
    path: '/my-progress',
    element: <StudentProgressDashboard />,
    auth: 'student'
  },
  
  // Teacher routes
  {
    path: '/analytics/competencies',
    element: <TeacherCompetencyAnalytics />,
    auth: 'teacher'
  }
];
```

---

## 🔄 Result Submission Integration

Update exam result submission to track competencies:

```typescript
const submitExamResults = async (examId, answers) => {
  // Submit traditional exam results
  const results = await api.post(`/exams/${examId}/submit`, { answers });
  
  // Calculate competency scores
  const competencyScores = await calculateCompetencyScores(answers);
  
  // Update student competency progress
  await api.post('/cbt/student-competency/progress/bulk', {
    exam_id: examId,
    student_scores: competencyScores.map(score => ({
      admission_no: user.admission_no,
      competency_id: score.competency_id,
      proficiency_score: score.score,
      questions_attempted: score.questions_attempted,
      questions_correct: score.questions_correct
    }))
  });
  
  return results;
};

const calculateCompetencyScores = async (answers) => {
  const competencyMap = new Map();
  
  for (const answer of answers) {
    // Get competency mappings for this question
    const mappings = await api.get(
      `/cbt/question-competency/by-question/${answer.question_id}`
    );
    
    mappings.data.data.forEach(mapping => {
      if (!competencyMap.has(mapping.competency_id)) {
        competencyMap.set(mapping.competency_id, {
          competency_id: mapping.competency_id,
          questions_attempted: 0,
          questions_correct: 0,
          total_weight: 0
        });
      }
      
      const comp = competencyMap.get(mapping.competency_id);
      comp.questions_attempted += 1;
      comp.total_weight += mapping.weight;
      
      if (answer.is_correct) {
        comp.questions_correct += mapping.weight;
      }
    });
  }
  
  // Calculate proficiency scores
  return Array.from(competencyMap.values()).map(comp => ({
    ...comp,
    score: (comp.questions_correct / comp.total_weight) * 100
  }));
};
```

---

## 🎨 UI Integration Examples

### Exam Type Selector

```typescript
<Select value={examType} onValueChange={setExamType}>
  <SelectItem value="standard">Standard Exam</SelectItem>
  <SelectItem value="adaptive">Adaptive Exam</SelectItem>
</Select>

{examType === 'adaptive' && (
  <Alert>
    <Brain className="h-4 w-4" />
    <AlertTitle>Adaptive Mode</AlertTitle>
    <AlertDescription>
      Questions will be selected based on your competency levels
    </AlertDescription>
  </Alert>
)}
```

### Navigation Menu

```typescript
// Add to student navigation
{
  label: 'My Progress',
  href: '/my-progress',
  icon: TrendingUp
}

// Add to teacher navigation
{
  label: 'Competency Analytics',
  href: '/analytics/competencies',
  icon: BarChart3
}
```

---

## 🔧 Backend Integration

### Exam Results Hook

Add competency tracking to existing exam completion:

```javascript
// elite-cbt-api/src/controllers/examController.js

exports.submitExamResults = async (req, res) => {
  try {
    // ... existing exam submission logic
    
    // If exam has competency mappings, update progress
    const hasCompetencies = await checkExamHasCompetencies(examId);
    
    if (hasCompetencies) {
      await updateStudentCompetencyProgress({
        exam_id: examId,
        admission_no: req.body.admission_no,
        answers: req.body.answers
      });
    }
    
    // ... rest of submission
  } catch (error) {
    // handle error
  }
};
```

---

## 📊 Analytics Integration

### Class Performance Dashboard

```typescript
const ClassCompetencyOverview = ({ classCode }) => {
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    api.get(`/cbt/student-competency/class/summary?class_code=${classCode}`)
      .then(res => setSummary(res.data.data));
  }, [classCode]);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summary?.competencies.map(comp => (
        <Card key={comp.competency_id}>
          <CardHeader>
            <CardTitle className="text-sm">{comp.competency_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comp.avg_proficiency?.toFixed(0)}%
            </div>
            <Progress value={comp.avg_proficiency} className="mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

---

## 🚀 Deployment Checklist

- [ ] Run database migration for competency tables
- [ ] Seed sample competency data
- [ ] Add route configurations
- [ ] Update navigation menus
- [ ] Test adaptive quiz flow
- [ ] Test progress tracking
- [ ] Configure permissions (teacher/student access)
- [ ] Add monitoring for competency API endpoints
- [ ] Document for end users
- [ ] Train teachers on competency mapping

---

## 📖 Usage Examples

### For Teachers

1. **Map Questions to Competencies:**
   - Go to Question Bank
   - Select a question
   - Click "Map to Competencies"
   - Select relevant competencies with weights

2. **View Class Progress:**
   - Navigate to "Competency Analytics"
   - Select class and subject
   - View competency mastery heatmap
   - Identify students needing intervention

### For Students

1. **Take Adaptive Quiz:**
   - Select exam with "Adaptive Mode"
   - Answer questions at your level
   - Get personalized difficulty adjustment
   - View instant feedback

2. **Track Your Progress:**
   - Go to "My Progress"
   - View competency mastery levels
   - See which areas need work
   - Track improvement over time

---

## 🔍 Testing

### Manual Testing

```bash
# 1. Create competencies
curl -X POST http://localhost:34568/api/cbt/competencies \
  -H "Content-Type: application/json" \
  -d '{"competency_code":"TEST-001","competency_name":"Test Competency","subject_code":"TEST"}'

# 2. Map questions
curl -X POST http://localhost:34568/api/cbt/question-competency/mappings/bulk \
  -H "Content-Type: application/json" \
  -d '{"mappings":[{"question_id":"q1","competency_id":"comp1","weight":1.0}]}'

# 3. Update student progress
curl -X POST http://localhost:34568/api/cbt/student-competency/progress \
  -H "Content-Type: application/json" \
  -d '{"admission_no":"STU001","competency_id":"comp1","proficiency_score":75}'
```

---

## 🎯 Success Metrics

Track these metrics to measure adaptive learning effectiveness:

- Average proficiency improvement over time
- Student engagement rates (adaptive vs standard)
- Time to competency mastery
- Intervention identification accuracy
- Teacher satisfaction with analytics
- Student satisfaction with personalized learning

---

## 📞 Support

For issues or questions:
- Check API documentation at `/docs`
- Review component props in source files
- Contact development team

---

**Integration Complete!** 🎉

Your adaptive learning system is now fully integrated with the quiz flow.
