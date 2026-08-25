import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import apiClient from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, GraduationCap, BookOpen, Layers, Calendar, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'session' | 'sections' | 'classes' | 'subjects' | 'done';

interface SectionTemplate { name: string; key: string; icon: string; classes: string[]; color: string }
interface GeneratedClass { name: string; section: string; arms: string[]; selected: boolean }
interface SubjectItem { name: string; type: string; selected: boolean }

// ── Constants ─────────────────────────────────────────────────────────────────
const SECTION_TEMPLATES: SectionTemplate[] = [
  { name: 'Nursery',          key: 'Nursery', icon: '🌱', color: 'green',  classes: ['Nursery 1','Nursery 2','Nursery 3'] },
  { name: 'Primary',          key: 'Primary', icon: '📚', color: 'blue',   classes: ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6'] },
  { name: 'Junior Secondary', key: 'JSS',     icon: '🎓', color: 'purple', classes: ['JSS1','JSS2','JSS3'] },
  { name: 'Senior Secondary', key: 'SS',      icon: '🏫', color: 'orange', classes: ['SS1','SS2','SS3'] },
  { name: 'Islamiyya',        key: 'Islamiyya',icon: '🕌', color: 'teal',  classes: ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6'] },
  { name: 'Tahfiz',           key: 'Tahfiz',  icon: '📖', color: 'rose',   classes: ['Level 1','Level 2','Level 3','Level 4'] },
];

const PREDEFINED_SUBJECTS: Record<string, SubjectItem[]> = {
  Nursery: [
    {name:'English Language',type:'core',selected:true},{name:'Mathematics',type:'core',selected:true},
    {name:'Basic Science',type:'core',selected:true},{name:'Social Studies',type:'core',selected:true},
    {name:'Creative Arts',type:'art',selected:true},{name:'Physical Education',type:'health',selected:true},
    {name:'Islamic Religious Studies',type:'selective',selected:false},{name:'Christian Religious Studies',type:'selective',selected:false},
  ],
  Primary: [
    {name:'English Language',type:'core',selected:true},{name:'Mathematics',type:'core',selected:true},
    {name:'Basic Science & Technology',type:'science',selected:true},{name:'Social Studies',type:'core',selected:true},
    {name:'Civic Education',type:'core',selected:true},{name:'Agricultural Science',type:'science',selected:true},
    {name:'Computer Studies',type:'technology',selected:true},{name:'Creative Arts',type:'art',selected:true},
    {name:'Physical & Health Education',type:'health',selected:true},{name:'Home Economics',type:'vocational',selected:true},
    {name:'Islamic Religious Studies',type:'selective',selected:false},{name:'Christian Religious Studies',type:'selective',selected:false},
  ],
  JSS: [
    {name:'English Studies',type:'core',selected:true},{name:'Mathematics',type:'core',selected:true},
    {name:'Basic Science',type:'science',selected:true},{name:'Basic Technology',type:'technology',selected:true},
    {name:'Business Studies',type:'commercial',selected:true},{name:'Social Studies',type:'core',selected:true},
    {name:'Civic Education',type:'core',selected:true},{name:'Agricultural Science',type:'science',selected:true},
    {name:'Computer Studies',type:'technology',selected:true},{name:'Home Economics',type:'vocational',selected:true},
    {name:'Creative Arts',type:'art',selected:true},{name:'Physical & Health Education',type:'health',selected:true},
    {name:'Islamic Religious Studies',type:'selective',selected:false},{name:'Christian Religious Studies',type:'selective',selected:false},
  ],
  SS: [
    {name:'English Language',type:'core',selected:true},{name:'Mathematics',type:'core',selected:true},
    {name:'Physics',type:'science',selected:true},{name:'Chemistry',type:'science',selected:true},
    {name:'Biology',type:'science',selected:true},{name:'Further Mathematics',type:'science',selected:false},
    {name:'Agricultural Science',type:'science',selected:false},{name:'Economics',type:'commercial',selected:true},
    {name:'Accounting',type:'commercial',selected:false},{name:'Commerce',type:'commercial',selected:false},
    {name:'Literature-in-English',type:'art',selected:false},{name:'Government',type:'art',selected:true},
    {name:'Geography',type:'art',selected:false},{name:'History',type:'art',selected:false},
    {name:'Islamic Religious Studies',type:'selective',selected:false},{name:'Christian Religious Studies',type:'selective',selected:false},
  ],
  Islamiyya: [
    {name:'Quran Recitation',type:'core',selected:true},{name:'Islamic Studies',type:'core',selected:true},
    {name:'Arabic Language',type:'core',selected:true},{name:'Tafseer',type:'core',selected:false},
    {name:'Hadith',type:'core',selected:false},{name:'Fiqh',type:'core',selected:false},
  ],
  Tahfiz: [
    {name:'Quran Memorization',type:'core',selected:true},{name:'Tajweed',type:'core',selected:true},
    {name:'Islamic Studies',type:'core',selected:true},{name:'Arabic Language',type:'core',selected:true},
  ],
};

const ARM_PRESETS = ['A','B','C','D','E'];
const TERMS = ['First term','Second term','Third term'] as const;
const currentYear = new Date().getFullYear();
const ACADEMIC_YEARS = Array.from({length:4},(_,i)=>{const y=currentYear-1+i;return `${y}/${y+1}`;});

const SECTION_COLORS: Record<string,string> = {
  green:  'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  blue:   'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  purple: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400',
  orange: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400',
  teal:   'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400',
  rose:   'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400',
};
const ACTIVE_COLORS: Record<string,string> = {
  green:  'bg-green-500 border-green-500',
  blue:   'bg-[#002a56] border-[#002a56]',
  purple: 'bg-purple-600 border-purple-600',
  orange: 'bg-orange-500 border-orange-500',
  teal:   'bg-teal-600 border-teal-600',
  rose:   'bg-rose-500 border-rose-500',
};

const TYPE_BADGE: Record<string,string> = {
  core:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  science:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  art:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  commercial: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  technology: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  vocational: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  health:     'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  selective:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STEPS: {key: Step; label: string; icon: React.ReactNode}[] = [
  {key:'session',  label:'Session',  icon:<Calendar className="w-4 h-4"/>},
  {key:'sections', label:'Sections', icon:<Layers className="w-4 h-4"/>},
  {key:'classes',  label:'Classes',  icon:<GraduationCap className="w-4 h-4"/>},
  {key:'subjects', label:'Subjects', icon:<BookOpen className="w-4 h-4"/>},
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser, selected_branch } = useAuthStore();

  const school_id = user?.school_id || '';
  const branch_id = selected_branch?.branch_id || `BRN${school_id}`;

  // Step state
  const [step, setStep] = useState<Step>('session');
  const [saving, setSaving] = useState(false);

  // Step 1 — Session
  const [session, setSession] = useState({
    academic_year: ACADEMIC_YEARS[1],
    term: 'First term' as typeof TERMS[number],
    session_start_date: '',
    session_end_date: '',
    school_motto: '',
  });

  // Step 2 — Sections selected
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  // Step 3 — Generated classes
  const [generatedClasses, setGeneratedClasses] = useState<GeneratedClass[]>([]);
  const [enableArms, setEnableArms] = useState(false);
  const [armCount, setArmCount] = useState(3);

  // Step 4 — Subjects per section
  const [subjectsBySection, setSubjectsBySection] = useState<Record<string, SubjectItem[]>>({});

  const toggleSection = (key: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const buildClasses = useCallback(() => {
    const classes: GeneratedClass[] = [];
    selectedSections.forEach(key => {
      const tmpl = SECTION_TEMPLATES.find(s => s.key === key);
      if (!tmpl) return;
      tmpl.classes.forEach(name => {
        classes.push({
          name, section: key,
          arms: enableArms ? ARM_PRESETS.slice(0, armCount) : [],
          selected: true,
        });
      });
    });
    setGeneratedClasses(classes);
  }, [selectedSections, enableArms, armCount]);

  const buildSubjects = useCallback(() => {
    const map: Record<string, SubjectItem[]> = {};
    selectedSections.forEach(key => {
      map[key] = (PREDEFINED_SUBJECTS[key] || []).map(s => ({...s}));
    });
    setSubjectsBySection(map);
  }, [selectedSections]);

  const toggleClass = (idx: number) => {
    setGeneratedClasses(prev => prev.map((c,i) => i===idx ? {...c, selected: !c.selected} : c));
  };

  const toggleSubject = (sectionKey: string, idx: number) => {
    setSubjectsBySection(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((s,i) => i===idx ? {...s, selected: !s.selected} : s),
    }));
  };

  const selectAllSubjects = (sectionKey: string, val: boolean) => {
    setSubjectsBySection(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(s => ({...s, selected: val})),
    }));
  };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 'session')  { setStep('sections'); }
    if (step === 'sections') {
      if (selectedSections.size === 0) { toast.error('Select at least one section'); return; }
      buildClasses();
      buildSubjects();
      setStep('classes');
    }
    if (step === 'classes')  { setStep('subjects'); }
  };
  const goBack = () => {
    if (step === 'classes')  setStep('sections');
    if (step === 'subjects') setStep('classes');
    if (step === 'sections') setStep('session');
  };

  // ── Final save ───────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Save school onboarding fields
      await authService.completeOnboarding({
        academic_year: session.academic_year,
        term: session.term as any,
        session_start_date: session.session_start_date || undefined,
        session_end_date: session.session_end_date || undefined,
        school_motto: session.school_motto || undefined,
        nursery_section: selectedSections.has('Nursery') ? 1 : 0,
        primary_section: selectedSections.has('Primary') ? 1 : 0,
        junior_secondary_section: selectedSections.has('JSS') ? 1 : 0,
        senior_secondary_section: selectedSections.has('SS') ? 1 : 0,
        islamiyya: selectedSections.has('Islamiyya') ? 1 : 0,
        tahfiz: selectedSections.has('Tahfiz') ? 1 : 0,
      });

      // 2. Ensure main school location / branch exists
      await apiClient.post('/schools/ensure-branch', { school_id, branch_id }).catch(()=>{});

      // 3. Create sections
      for (const key of selectedSections) {
        await apiClient.post('/section-setup', {
          query_type: 'create', section_name: key,
          school_id, branch_id, curriculum_type: 'nigerian_curriculum',
        }).catch(()=>{});
      }

      // 4. Save academic calendar
      await apiClient.post('/academic-calendar', {
        academic_year: session.academic_year, term: session.term,
        start_date: session.session_start_date || null,
        end_date: session.session_end_date || null,
        school_id, branch_id,
      }).catch(()=>{});

      // 5. Create selected classes (with arms)
      const classesToCreate = generatedClasses.filter(c => c.selected);
      for (const cls of classesToCreate) {
        await apiClient.post('/classes', {
          class_name: cls.name, section: cls.section, school_id, branch_id,
          class_arms: cls.arms.map(a => ({ arm_name: a, status: 'Active' })),
        }).catch(()=>{});
      }

      // 6. Bulk assign subjects
      // Get created classes to map section → class_codes
      const classRes = await apiClient.get(`/getAllClasses?school_id=${school_id}&branch_id=${branch_id}`).catch(()=>({data:{data:[]}}));
      const classesList: any[] = classRes?.data?.data || [];

      for (const [sectionKey, subjects] of Object.entries(subjectsBySection)) {
        const selected = subjects.filter(s => s.selected);
        if (!selected.length) continue;
        const sectionClasses = classesList.filter((c:any) => c.section === sectionKey && !c.parent_id);
        const classCodes = sectionClasses.map((c:any) => c.class_code);
        if (!classCodes.length) continue;
        await apiClient.post('/subjects', {
          query_type: 'create_bulk', section: sectionKey,
          subject: selected.map(s => ({ subject: s.name, type: s.type, status: 'Active' })),
          classes: classCodes, school_id, branch_id,
        }).catch(()=>{});
      }

      updateUser({ first_login_completed: 1 } as any);
      setStep('done');
      toast.success('School setup complete! 🎉');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      toast.error(err?.message || 'Setup failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-start py-10 px-4">
      {/* Top bar */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black text-[#002a56] dark:text-white tracking-tight">Welcome to Elite CBT</h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Let's set up your school in a few quick steps</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold transition-colors hidden">
            Skip for now →
          </button>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-4">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all whitespace-nowrap',
                i < stepIndex ? 'bg-green-500 text-white' :
                i === stepIndex ? 'bg-[#002a56] text-white dark:bg-sky-600' :
                'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
              )}>
                {i < stepIndex ? <CheckCircle2 className="w-3.5 h-3.5"/> : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1 rounded',i < stepIndex ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700')}/>}
            </div>
          ))}
        </div>
      </div>

      {/* Done screen */}
      {step === 'done' && (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-12 text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-black text-[#002a56] dark:text-white">School setup complete!</h2>
          <p className="text-gray-500 dark:text-gray-400">Redirecting you to your dashboard…</p>
          <Loader2 className="w-6 h-6 animate-spin text-[#002a56] mx-auto"/>
        </div>
      )}

      {/* ── Step 1: Session ── */}
      {step === 'session' && (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2.5 bg-[#002a56]/10 rounded-xl"><Calendar className="w-5 h-5 text-[#002a56] dark:text-sky-400"/></div>
            <div><h2 className="text-lg font-black text-gray-800 dark:text-white">Academic Session</h2>
            <p className="text-xs text-gray-400">Set up the current academic year and term</p></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">Academic Year</Label>
              <select value={session.academic_year} onChange={e=>setSession(p=>({...p,academic_year:e.target.value}))}
                className="w-full rounded-xl h-10 text-xs border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white px-3 focus:outline-none focus:ring-2 focus:ring-[#002a56]/30">
                {ACADEMIC_YEARS.map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">Current Term</Label>
              <select value={session.term} onChange={e=>setSession(p=>({...p,term:e.target.value as any}))}
                className="w-full rounded-xl h-10 text-xs border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-white px-3 focus:outline-none focus:ring-2 focus:ring-[#002a56]/30">
                {TERMS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">Session Start Date</Label>
              <Input type="date" value={session.session_start_date} onChange={e=>setSession(p=>({...p,session_start_date:e.target.value}))}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"/>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500">Session End Date</Label>
              <Input type="date" value={session.session_end_date} onChange={e=>setSession(p=>({...p,session_end_date:e.target.value}))}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"/>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-gray-500">School Motto <span className="font-normal text-gray-400">(optional)</span></Label>
              <Input type="text" placeholder="e.g. Excellence through knowledge" value={session.school_motto}
                onChange={e=>setSession(p=>({...p,school_motto:e.target.value}))}
                className="rounded-xl h-10 text-xs border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"/>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={goNext} className="rounded-xl h-10 px-6 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-500 gap-2">
              Next: Choose Sections <ChevronRight className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Sections ── */}
      {step === 'sections' && (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Layers className="w-5 h-5 text-purple-600 dark:text-purple-400"/></div>
            <div><h2 className="text-lg font-black text-gray-800 dark:text-white">School Sections</h2>
            <p className="text-xs text-gray-400">Select the sections your school offers. Classes will be auto-generated.</p></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SECTION_TEMPLATES.map(tmpl => {
              const active = selectedSections.has(tmpl.key);
              return (
                <button key={tmpl.key} type="button" onClick={()=>toggleSection(tmpl.key)}
                  className={cn('relative rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95',
                    active
                      ? 'bg-[#002a56] border-[#002a56] text-white shadow-md dark:bg-sky-700 dark:border-sky-600'
                      : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  )}>
                  {active && <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-white/90"/>}
                  <div className="text-3xl mb-2">{tmpl.icon}</div>
                  <div className={cn('font-black text-sm leading-tight')}>{tmpl.name}</div>
                  <div className={cn('text-[10px] font-semibold mt-1', active ? 'text-white/70' : 'text-gray-400')}>
                    {tmpl.classes.length} classes
                  </div>
                </button>
              );
            })}
          </div>

          {selectedSections.size > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0"/>
              {Array.from(selectedSections).map(k => SECTION_TEMPLATES.find(t=>t.key===k)?.name).join(', ')} selected —&nbsp;
              {Array.from(selectedSections).reduce((sum, k) => sum + (SECTION_TEMPLATES.find(t=>t.key===k)?.classes.length||0), 0)} classes will be generated
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={goBack} className="rounded-xl h-10 px-5 text-xs font-bold border border-gray-200 dark:border-gray-700 gap-1.5">
              <ChevronLeft className="w-4 h-4"/> Back
            </Button>
            <Button onClick={goNext} disabled={selectedSections.size===0} className="rounded-xl h-10 px-6 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-500 gap-2">
              Next: Configure Classes <ChevronRight className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Classes ── */}
      {step === 'classes' && (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl"><GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400"/></div>
            <div><h2 className="text-lg font-black text-gray-800 dark:text-white">Classes</h2>
            <p className="text-xs text-gray-400">Confirm classes and optionally add class arms (e.g. JSS1 A, JSS1 B)</p></div>
          </div>

          {/* Arms toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Enable Class Arms</p>
              <p className="text-xs text-gray-400 mt-0.5">Split each class into parallel arms (e.g. A, B, C)</p>
            </div>
            <button type="button" onClick={()=>{setEnableArms(!enableArms); setTimeout(buildClasses,0);}}
              className={cn('w-12 h-6 rounded-full transition-all relative',enableArms?'bg-[#002a56] dark:bg-sky-600':'bg-gray-300 dark:bg-gray-600')}>
              <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',enableArms?'left-6':'left-0.5')}/>
            </button>
          </div>

          {enableArms && (
            <div className="flex items-center gap-3 px-1">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Number of arms:</span>
              <div className="flex gap-2">
                {[2,3,4,5].map(n=>(
                  <button key={n} type="button" onClick={()=>{setArmCount(n);setTimeout(buildClasses,0);}}
                    className={cn('w-9 h-9 rounded-xl text-xs font-black border-2 transition-all',
                      armCount===n?'bg-[#002a56] border-[#002a56] text-white dark:bg-sky-600 dark:border-sky-600':'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400')}>
                    {n}
                  </button>
                ))}
              </div>
              {enableArms && <span className="text-xs text-gray-400 font-semibold">(Arms: {ARM_PRESETS.slice(0,armCount).join(', ')})</span>}
            </div>
          )}

          {/* Classes grouped by section */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {Array.from(selectedSections).map(sectionKey => {
              const tmpl = SECTION_TEMPLATES.find(t=>t.key===sectionKey)!;
              const sectionClasses = generatedClasses.filter(c=>c.section===sectionKey);
              const allSelected = sectionClasses.every(c=>c.selected);
              return (
                <div key={sectionKey}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">{tmpl.icon} {tmpl.name}</span>
                    <button type="button" onClick={()=>setGeneratedClasses(prev=>prev.map(c=>c.section===sectionKey?{...c,selected:!allSelected}:c))}
                      className="text-[10px] font-bold text-[#002a56] dark:text-sky-400 hover:underline">
                      {allSelected?'Deselect all':'Select all'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sectionClasses.map((cls, i) => {
                      const globalIdx = generatedClasses.indexOf(cls);
                      return (
                        <button key={i} type="button" onClick={()=>toggleClass(globalIdx)}
                          className={cn('rounded-xl px-3 py-2 text-xs font-bold border-2 transition-all',
                            cls.selected
                              ? cn(ACTIVE_COLORS[tmpl.color], 'text-white shadow-sm')
                              : cn(SECTION_COLORS[tmpl.color])
                          )}>
                          {cls.name}
                          {cls.arms.length > 0 && <span className={cn('ml-1 text-[10px]',cls.selected?'text-white/70':'text-gray-400')}>×{cls.arms.length}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={goBack} className="rounded-xl h-10 px-5 text-xs font-bold border border-gray-200 dark:border-gray-700 gap-1.5">
              <ChevronLeft className="w-4 h-4"/> Back
            </Button>
            <Button onClick={goNext} className="rounded-xl h-10 px-6 text-xs font-bold bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 dark:hover:bg-sky-500 gap-2">
              Next: Choose Subjects <ChevronRight className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Subjects ── */}
      {step === 'subjects' && (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl"><BookOpen className="w-5 h-5 text-green-600 dark:text-green-400"/></div>
            <div><h2 className="text-lg font-black text-gray-800 dark:text-white">Subjects</h2>
            <p className="text-xs text-gray-400">Pick the subjects for each section. You can always add more later.</p></div>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto pr-1">
            {Array.from(selectedSections).map(sectionKey => {
              const tmpl = SECTION_TEMPLATES.find(t=>t.key===sectionKey)!;
              const subjects = subjectsBySection[sectionKey] || [];
              const selectedCount = subjects.filter(s=>s.selected).length;
              return (
                <div key={sectionKey}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200">{tmpl.icon} {tmpl.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-semibold">{selectedCount}/{subjects.length} selected</span>
                      <button type="button" onClick={()=>selectAllSubjects(sectionKey, selectedCount < subjects.length)}
                        className="text-[10px] font-bold text-[#002a56] dark:text-sky-400 hover:underline">
                        {selectedCount < subjects.length ? 'Select all' : 'Deselect all'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((sub, i) => (
                      <button key={i} type="button" onClick={()=>toggleSubject(sectionKey, i)}
                        className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold border transition-all',
                          sub.selected
                            ? 'bg-[#002a56] border-[#002a56] text-white dark:bg-sky-700 dark:border-sky-700 shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:border-gray-400'
                        )}>
                        {sub.selected && <CheckCircle2 className="w-3 h-3 text-white/80 flex-shrink-0"/>}
                        {sub.name}
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-black', sub.selected ? 'bg-white/20 text-white' : TYPE_BADGE[sub.type] || TYPE_BADGE.selective)}>
                          {sub.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={goBack} className="rounded-xl h-10 px-5 text-xs font-bold border border-gray-200 dark:border-gray-700 gap-1.5">
              <ChevronLeft className="w-4 h-4"/> Back
            </Button>
            <Button onClick={handleFinish} disabled={saving} className="rounded-xl h-10 px-6 text-xs font-bold bg-green-600 text-white hover:bg-green-600/90 shadow-md gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving your school...</> : <><Sparkles className="w-4 h-4"/>Complete Setup</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
