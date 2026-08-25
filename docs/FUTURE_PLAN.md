# 🚀 Elite CBT — Future Product Plan

**Date:** 2026-08-12
**Status:** Proposed / Roadmap
**Source:** Expert review of elite-cbt + elite-cbt-api (study & E2E test, Aug 2026)

---

## 📌 Executive Summary

Elite CBT already owns psychometrics that most CBT vendors lack — IRT adaptive
testing, reliability analysis (KR-20, Cronbach α, split-half/Spearman-Brown, SEM),
item analysis with distractor efficiency, test blueprints, Bloom's taxonomy mapping,
competency tracking, AI question generation, and longitudinal analytics.

The standout plays going forward are:

1. **Integrity** — proctoring, lockdown, parameterized questions, integrity scores
2. **Question innovation** — richer question types, AI essay grading, practice mode
3. **Student/parent experience** — offline-first mobile, WhatsApp/SMS result push, QR-verified certificates
4. **The data flywheel** — cross-school item calibration & normative data (the moat)

---

## ✅ What Already Makes It Stand Out (leverage these)

- **Real psychometrics, not just scoring**: IRT 3PL adaptive engine, MLE/EAP ability
  estimation, Fisher information item selection, exposure control, reliability
  (KR-20 / α / split-half / SEM / confidence intervals), item analysis
  (difficulty P, discrimination D, distractor efficiency, quality flags)
- **Server-authoritative exam sessions** (anti clock-hack, server deadline governs)
- **Auto-grading** across 7 question types (MC, T/F, short answer, fill-blank,
  matching, ordering, numeric)
- **AI question generation** (Gemini) with regeneration
- **Professional reports** — exam / per-student / subject, with reliability embedded
- **Multi-tenant** via `school_locations` (multi-campus schools)
- **Payments** (Paystack), **Android APK** (Capacitor)

---

## 🧱 Gap Analysis — Feature Ideas by Theme

### A. Exam Integrity / Proctoring *(the #1 brand signal; roadmap Step 3)*

1. **Browser lockdown + event log** — tab-switch, blur, copy/paste, right-click,
   focus-loss → timestamped `proctoring_events` per (exam, student).
   *Low effort, immediately valuable.*
2. **Live proctoring dashboard** — real-time view of who's online/flagged, session
   heartbeats, auto-flags (too-fast answering, excessive tab switches, device switches).
3. **Photo capture / face check** — at exam start + periodic snapshots for human
   review (on-device face-api.js, or periodic snapshots stored for review).
4. **Post-exam forensic report** — per-student event timeline + **integrity score (0–100)**.
   This is what exam bodies actually pay for.
5. **Parameterized questions** ⭐ — same stem, different numbers/options per student
   (`2 + x` vs `7 + x`). Kills answer-sharing, the #1 cheating vector in school CBT.
   *~2–3 days on the existing question model.*

### B. Question & Assessment Innovation

6. **AI essay / short-answer grading** — Gemini rubric-based, human override,
   inter-rater agreement stats. (Gemini already used for generation — extend to grading.)
7. **Rich question types** — passage/set questions, image/hotspot, audio questions,
   LaTeX math, **auto-graded programming questions** (sandboxed code exec).
8. **Practice mode with spaced repetition** — retry missed questions from a smart
   queue; exam results auto-feed remediation. Turns testing into a learning tool
   (retention driver).

### C. Student & Parent Experience

9. **Offline-first student app** — download exam, take offline, sync when connected.
   Huge for Nigerian bandwidth reality; few competitors do this well.
10. **Parent portal + WhatsApp/SMS result push** — parents are the paying customers;
    instant result alerts via WhatsApp Business API.
11. **Digital certificates / results with QR verification** — scan-to-verify against
    the API (anti-forgery; attractive to exam bodies).

### D. The Data Flywheel *(the moat)*

12. **Cross-school item calibration & normative data** — pool item stats across all
    schools → item difficulty/bias norms, percentile ranks per class/subject.
    The more schools use it, the smarter it gets — a network effect competitors
    cannot copy.
13. **Predictive analytics** — early-exam "at-risk" alerts from longitudinal data
    (trajectory endpoints already exist — productize into teacher-facing nudges).
14. **Item response-time analysis** — flag high-performers-slow / low-performers-fast
    items, plus timing-based cheater detection (Kosanović-style analyses).

### E. Platform & Ops

15. **Webhooks + LTI/API** — LMS integration (Moodle/Schoology), SMS/email automation.
16. **Bulk import (Excel/Word) for questions** — teachers' #1 practical pain
    (mammoth/pdf-parse already on the backend).
17. **Result workflow with moderation** — release in waves, appeal/regrade requests,
    audit trail (moderation infra exists — expose it to schools).

---

## 🎯 Suggested Sequencing

| Wave | Features | Effort | Why |
|---|---|---|---|
| **1. Quick wins (2–3 wks)** | Proctoring event log + lockdown, Excel/Word bulk import, QR-verified results, WhatsApp result push | Low–Med | Immediate school-facing "wow", small code |
| **2. Integrity (3–5 wks)** | Parameterized questions, live proctoring dashboard, integrity score reports | Med–High | The moat + the sales pitch |
| **3. AI (3–4 wks)** | AI essay grading, practice mode with spaced repetition | Med | Retention + learning narrative |
| **4. Strategic (6–10 wks)** | Offline mobile app, cross-school calibration norms | High | Long-term differentiation |

## 🏆 Top 3 Recommendations (if picking three)

1. **Parameterized questions** — kills the #1 cheating method; ~2–3 days on the
   existing question model + grading + item analysis.
2. **Proctoring event log + integrity score** — the trust signal exam bodies pay for.
3. **Practice mode / spaced repetition** — turns one-off exams into recurring engagement.

---

## 📝 Open Questions / Notes

- Proctoring has real constraints (browser lockdown is bypassable; webcam ML is heavy;
  privacy/GDPR considerations) — see `NEXT_STEPS_COMPLEXITY_ANALYSIS.md` Step 3.
- Schema note: `school_locations` is the real campus/location table; `branch_id`
  columns are FKs into it (not a `branches` table).
- Known bug backlog (fixed Aug 2026): reliability enum mismatch, distractor analysis,
  student report, subject report, topic-mastery string concat.
