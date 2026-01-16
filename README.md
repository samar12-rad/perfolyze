# Perfolyze

**Production-focused React Performance Observability**

Perfolyze is a runtime observability tool for React applications that helps teams identify **which components cause real-user performance regressions in production**, using **actual runtime data**, not static analysis or local profiling.

Instead of overwhelming engineers with raw profiler data, Perfolyze surfaces **actionable, component-level insights** so teams know **what to optimize first**.

---

## Why Perfolyze

Most React performance tools fall into one of these categories:

* Static analyzers that guess potential issues
* DevTools that only work locally
* Heavy observability platforms that are expensive and noisy

Perfolyze focuses on a simpler and more practical question:

**What actually got slower for real users after a deploy?**

---

## What Perfolyze Is

* A runtime observability system
* Built for production usage
* Based on real user sessions
* Insight-first, evidence-driven

---

## What Perfolyze Is Not

* Not a static code analyzer
* Not an AI code review tool
* Not a React DevTools replacement
* Not a session replay system
* Not a real-time tracing platform

---

## High-Level Architecture

```
User Browser
  → Perfolyze SDK (React Profiler + batching)
    → Ingestion API (Go)
      → Aggregation logic
        → Dashboard (Next.js)
```

Dashboards narrow the search space.
They do not replace debugging.

---

## Target Users

* Early-stage startups
* React-heavy applications
* Small teams without a dedicated performance engineer
* Teams that ship frequently and need confidence after deploys

---

## Core Features (MVP)

### SDK

* Lightweight React SDK
* Uses React Profiler and browser performance APIs
* Session-level sampling
* In-memory aggregation
* Batched telemetry delivery
* Minimal runtime overhead
* No source code or props captured

### Backend

* Single Go HTTP service
* Ingests aggregated telemetry
* Stores per-project, per-release, per-component metrics
* Computes performance deltas across releases

### Dashboard

* Insight-first UX
* Highlights regressions
* Shows components dominating performance cost
* Provides evidence, not raw data tables

---

## SDK Responsibilities

The SDK instruments **runtime behavior**, not source code.

It captures:

* Component name
* Render count
* Average render duration
* p95 render duration
* Commit phase
* Session ID
* Project ID
* Release version

### What the SDK Explicitly Avoids

* No props or state values
* No source code ingestion
* No PII by default
* No per-render network calls

---

## Backend Responsibilities

* Accept batched telemetry via `POST /ingest`
* Validate payloads
* Aggregate metrics
* Persist insights, not raw events
* Compute regressions between releases

No Kafka
No microservices
No real-time streaming

---

## Aggregation Philosophy

**Raw events are temporary.
Insights are persistent.**

Perfolyze answers:

* What got worse?
* Which component caused it?
* How bad is the regression?
* Which release introduced it?

---

## Dashboard Philosophy

**Insight first. Drill-down second.**

Hierarchy:

1. Is there a regression?
2. Which components dominate it?
3. What evidence supports this?
4. Which release introduced it?

---

## Tech Stack

### SDK

* TypeScript
* React Profiler API
* Browser Performance APIs
* Built with tsup

### Backend

* Go
* PostgreSQL
* JSON-based ingestion API

### Dashboard

* Next.js
* TypeScript
* Tailwind CSS
* Recharts

### Infrastructure

* Backend: Fly.io or Railway
* Database: PostgreSQL (Supabase or Railway)
* Dashboard: Vercel

---

## Monorepo Structure

```
perfolyze/
├─ packages/
│  ├─ sdk/          # React SDK
│  ├─ backend/      # Go ingestion service
│  ├─ dashboard/    # Next.js dashboard
│  └─ demo-app/     # Real React app for testing
├─ shared/
│  └─ schema/       # Shared payload contracts
└─ README.md
```

---

## Privacy & Safety

* No source code ingestion
* No props or state captured
* No PII by default
* Session-level sampling
* Explicit tradeoffs documented

---

## Success Criteria

* Works in localhost and production
* Used by at least one real or realistic React app
* Identifies at least one real performance issue
* Documentation clearly explains design decisions and tradeoffs

---

## Interview Positioning

> I built a React observability tool that instruments production apps to surface component-level performance regressions using real user data. The SDK uses the React Profiler with session-level sampling, while the backend aggregates insights per release to highlight regressions. The system was tested against a real React app and informed optimization decisions.

---

## Status

Perfolyze is under active development and intentionally scoped as a **production-grade MVP**.
