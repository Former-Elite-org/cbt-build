# EliteCBT — AI Agent Instructions

## What Is This App?

**EliteCBT** is the Computer-Based Testing module in the **Elite Suite** ecosystem. It handles exam creation, question banks, auto-grading, and student practice mode.

**Domain:** `elitecbt.com.ng`
**Stack:** React + TypeScript + Vite + Zustand
**Backend:** `elite-cbt-api/` (Node.js + Express + Passport JWT + MySQL)
**Backend Port:** 34567

## Role in Elite Suite

EliteCBT is the **examination arm** of Elite Suite:
- Creates and manages exams/quizzes
- Maintains question banks with blueprints
- Auto-grades student responses
- Provides exam analytics and reports
- Supports student practice mode

## Cross-App Integration

- **Receives JWT** from Elite SMS via `?token=` parameter
- **Uses `AuthInitializer`** component to verify token on mount
- **Has own login** for standalone access
- **Shares `@@auth_token`** localStorage key with all Elite Suite apps

## Key Files

| File | Purpose |
|------|---------|
| `src/features/auth/components/AuthInitializer.tsx` | Token verification on mount |
| `src/features/auth/hooks/useAuth.ts` | Auth state management |
| `src/lib/utils/constants.ts` | Shared storage keys |
| `src/lib/api/endpoints.ts` | API endpoint definitions |

## Architecture

```
elite-cbt/
├── src/
│   ├── features/
│   │   ├── auth/                # Authentication
│   │   ├── exams/               # Exam management
│   │   ├── questions/           # Question bank
│   │   └── results/             # Results & analytics
│   ├── lib/                     # Utilities & API
│   └── components/              # Shared components
└── .github/workflows/           # Deployment workflows
```

## Deployment

- **Runner:** Self-hosted on VPS (62.72.0.209)
- **Target:** go54 cPanel (`elitecbt.com.ng`)
- **Workflow:** `.github/workflows/deploy-selfhosted.yml`
- **Backend:** systemd on VPS (`elite-cbt-api.service`, port 34567)

## Rules

1. No PM2 — use systemd
2. No manual deployments — use GitHub Actions
3. JWT secret must match Elite SMS (`JWT_SECRET_KEY`)
4. Frontend builds to `dist/` — deploy only dist contents

---

*EliteCBT — Computer-Based Testing for Elite Suite*
