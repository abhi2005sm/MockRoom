# MockRoom: File Architecture and Build Roadmap — Consolidated v2

**Project:** MockRoom, AI Mock Interview & Interview Coaching Platform
**Owner:** Abhishek
**Version:** 2.0 (22 Sep 2026) — supersedes v1.0 File Architecture; adds coaching, analyzer, and dashboard modules

---

## 1. Monorepo layout

A **pnpm workspace with Turborepo**, with a shared types package so the frontend and backend agree on WebSocket events and report/coaching schemas.

```
mockroom/
├── apps/
│   ├── web/                              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── signup/page.tsx
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── target-role/page.tsx              # NEW — job + resume + interview date
│   │   │   │   │   ├── analyzer/[jobId]/page.tsx          # NEW — Job Analyzer profile
│   │   │   │   │   ├── plan/[jobId]/page.tsx              # plan review + mode/persona pick
│   │   │   │   │   ├── device-check/[sessionId]/page.tsx
│   │   │   │   │   ├── interview/[sessionId]/page.tsx     # live room
│   │   │   │   │   ├── report/[sessionId]/page.tsx
│   │   │   │   │   ├── coach/page.tsx                     # NEW — Communication Coach
│   │   │   │   │   ├── coach/self-introduction/page.tsx   # NEW — dedicated trainer
│   │   │   │   │   ├── history/page.tsx
│   │   │   │   │   ├── recordings/[sessionId]/page.tsx    # NEW — replay + transcript timeline
│   │   │   │   │   ├── performance/page.tsx
│   │   │   │   │   ├── weak-areas/page.tsx                # NEW
│   │   │   │   │   ├── retry-mistakes/page.tsx            # NEW
│   │   │   │   │   ├── answer-library/page.tsx            # NEW
│   │   │   │   │   └── settings/page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx                                # landing
│   │   │   ├── components/
│   │   │   │   ├── analyzer/
│   │   │   │   │   ├── SkillConfidenceBars.tsx             # NEW
│   │   │   │   │   └── SourceTagBadge.tsx                  # NEW — verified/reported/inferred
│   │   │   │   ├── plan/
│   │   │   │   │   ├── ModeSelector.tsx                    # NEW
│   │   │   │   │   └── PersonaSelector.tsx                 # NEW
│   │   │   │   ├── interview/
│   │   │   │   │   ├── InterviewRoom.tsx
│   │   │   │   │   ├── InterviewerPanel.tsx                # avatar / waveform, persona-aware
│   │   │   │   │   ├── CandidateCamera.tsx
│   │   │   │   │   ├── CaptionsBar.tsx
│   │   │   │   │   ├── TimerBar.tsx
│   │   │   │   │   ├── WarningBanner.tsx
│   │   │   │   │   ├── TerminalPanel.tsx                   # xterm.js
│   │   │   │   │   └── CodeEditorPanel.tsx                 # Monaco
│   │   │   │   ├── device-check/
│   │   │   │   │   ├── CameraCheck.tsx
│   │   │   │   │   ├── MicMeter.tsx
│   │   │   │   │   └── SpeakerTest.tsx
│   │   │   │   ├── report/
│   │   │   │   │   ├── ScoreSummary.tsx
│   │   │   │   │   ├── CategoryRadar.tsx
│   │   │   │   │   ├── QuestionBreakdown.tsx               # includes dimension scores + what worked/missing
│   │   │   │   │   ├── SessionTimeline.tsx
│   │   │   │   │   └── ProgressChart.tsx
│   │   │   │   ├── coach/
│   │   │   │   │   ├── CoachingCard.tsx                    # NEW — original/rewrite/why/practice
│   │   │   │   │   ├── SectionTabs.tsx                     # NEW — intro/project/technical/behavioral/closing
│   │   │   │   │   ├── RecurringIssuesRail.tsx             # NEW
│   │   │   │   │   └── SelfIntroTrend.tsx                  # NEW — attempt-over-attempt chart
│   │   │   │   ├── recordings/
│   │   │   │   │   ├── TranscriptTimeline.tsx              # NEW — clickable timestamps
│   │   │   │   │   └── ReplayPlayer.tsx                    # NEW
│   │   │   │   └── ui/                                     # buttons, cards, modals, sidebar
│   │   │   │       └── Sidebar.tsx                         # full IA, see section 3 below
│   │   │   ├── hooks/
│   │   │   │   ├── useMediaStream.ts
│   │   │   │   ├── useFaceDetection.ts                     # MediaPipe
│   │   │   │   ├── useGazeTracking.ts
│   │   │   │   ├── useAudioCapture.ts                      # AudioWorklet
│   │   │   │   ├── useAudioPlayback.ts                     # streamed TTS playback
│   │   │   │   ├── useVad.ts
│   │   │   │   └── useRealtimeSocket.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── ws-client.ts
│   │   │   │   └── audio/
│   │   │   │       ├── pcm-worklet.ts
│   │   │   │       └── player.ts
│   │   │   ├── store/
│   │   │   │   ├── session.store.ts
│   │   │   │   └── device.store.ts
│   │   │   └── styles/
│   │   ├── public/
│   │   │   └── models/                                     # MediaPipe model files
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                              # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── filters/
│       │   │   ├── interceptors/
│       │   │   └── config/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── jobs/
│       │   │   ├── parser/
│       │   │   │   ├── parser.service.ts
│       │   │   │   └── prompts/jd-parser.prompt.ts
│       │   │   ├── analyzer/                                # NEW
│       │   │   │   ├── analyzer.service.ts
│       │   │   │   ├── company-research.service.ts          # periodic, cached
│       │   │   │   └── prompts/analyzer.prompt.ts
│       │   │   ├── plans/
│       │   │   │   └── mode-configs.ts                      # NEW — 6 mode presets
│       │   │   ├── sessions/
│       │   │   ├── realtime/
│       │   │   │   ├── realtime.gateway.ts
│       │   │   │   ├── audio-router.service.ts
│       │   │   │   └── ws-auth.guard.ts
│       │   │   ├── orchestrator/
│       │   │   │   ├── orchestrator.service.ts
│       │   │   │   ├── state-machine.ts
│       │   │   │   ├── turn-manager.ts                      # barge-in, pauses, timing
│       │   │   │   ├── warning.service.ts                   # face/mic/silence rules
│       │   │   │   └── prompts/
│       │   │   │       ├── interviewer.prompt.ts
│       │   │   │       ├── personas.ts                      # NEW — persona presets
│       │   │   │       ├── rounds/
│       │   │   │       │   ├── warmup.prompt.ts
│       │   │   │       │   ├── behavioral.prompt.ts
│       │   │   │       │   ├── technical.prompt.ts
│       │   │   │       │   └── closing.prompt.ts
│       │   │   │       └── claim-probing.ts                 # NEW — unverified-skill follow-ups
│       │   │   ├── ai/
│       │   │   │   ├── interfaces/
│       │   │   │   │   ├── stt.provider.ts
│       │   │   │   │   ├── llm.provider.ts
│       │   │   │   │   └── tts.provider.ts
│       │   │   │   └── providers/
│       │   │   │       ├── deepgram.stt.ts
│       │   │   │       ├── claude.llm.ts
│       │   │   │       └── elevenlabs.tts.ts
│       │   │   ├── runner/
│       │   │   │   ├── runner.service.ts
│       │   │   │   └── judge0.client.ts
│       │   │   ├── evaluation/
│       │   │   │   ├── evaluation.processor.ts              # BullMQ worker
│       │   │   │   ├── metrics.service.ts                   # WPM, fillers, hedges, pauses
│       │   │   │   ├── scoring.service.ts                   # weights + verdict + dimensions
│       │   │   │   ├── report.service.ts
│       │   │   │   └── prompts/evaluator.prompt.ts
│       │   │   ├── coaching/                                 # NEW
│       │   │   │   ├── coaching.processor.ts                # BullMQ worker, runs after evaluation
│       │   │   │   ├── tip-refresh.processor.ts              # scheduled, periodic web research
│       │   │   │   ├── language-coach.service.ts             # filler/hedge rules, no LLM call
│       │   │   │   ├── practice-scoring.service.ts
│       │   │   │   └── prompts/coaching-rewrite.prompt.ts
│       │   │   ├── analytics/
│       │   │   │   ├── weak-areas.service.ts                # NEW
│       │   │   │   └── retry-queue.service.ts                # NEW
│       │   │   └── storage/
│       │   └── database/
│       │       ├── prisma/schema.prisma
│       │       └── migrations/
│       ├── test/
│       └── package.json
│
├── packages/
│   ├── shared/                           # types shared by web and api
│   │   ├── src/
│   │   │   ├── ws-events.ts
│   │   │   ├── report.schema.ts          # Zod schema for evaluation JSON
│   │   │   ├── coaching.schema.ts        # NEW — Zod schema for coaching JSON
│   │   │   ├── modes.ts                  # NEW — mode config type
│   │   │   ├── enums.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── eslint-config/
│   └── tsconfig/
│
├── infra/
│   ├── docker/
│   │   ├── web.Dockerfile
│   │   ├── api.Dockerfile
│   │   └── sandbox.compose.yml           # Judge0 / Piston
│   ├── nginx/nginx.conf
│   └── k8s/                              # optional later
│
├── docs/
│   ├── PRD.md
│   ├── system-architecture.md
│   ├── TRD.md
│   ├── file-architecture.md
│   └── prompts.md
│
├── .github/workflows/ci.yml
├── docker-compose.yml                    # postgres, redis, minio, api, web
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

## 2. Sidebar / dashboard IA (final)

```
🏠 Dashboard
🎯 My Target Role
📄 Resume
💼 Job Analyzer
🎤 Mock Interview
   ├── HR
   ├── Technical
   ├── Coding
   ├── Behavioral
   └── Full Interview
🧑‍💻 Coding Lab
🗣 Communication Coach
👋 Self-Introduction
📊 Performance
📚 Weak Areas
🔄 Retry Mistakes
🎥 Interview Recordings
📝 Answer Library
🗒 Interview Plan
⚙️ Settings
```

## 3. Build roadmap

| Phase | Duration | Deliverables |
|---|---|---|
| **0. Foundation** | Week 1 | Monorepo, auth, DB schema, Docker compose, CI |
| **1. MVP** | Weeks 2–3 | Target Role setup, JD parsing, plan generation, text interview with LLM, state machine, basic report |
| **2. Voice and device** | Weeks 4–5 | Device check, face/mic warnings, STT, TTS streaming, VAD, barge-in |
| **3. Full rating** | Week 6 | Metrics service, multi-dimensional scoring, per-question review, report UI with radar and timeline |
| **4. Coding round** | Week 7 | Terminal, Monaco, sandbox integration, test-case scoring |
| **5. Communication Coach** | Week 8 | Coaching pipeline, rewrite prompts, tip-refresh worker, Coach dashboard section, Self-Introduction trainer, practice/re-record scoring |
| **6. Job Analyzer, Modes, Personas** | Week 9 | Skill-confidence profile with source tagging, 6 interview modes, persona presets, confidence-level progression |
| **7. Extended dashboard** | Week 10 | Weak Areas, Retry Mistakes, Answer Library, Recordings replay with transcript timeline, "Prepare me for my interview" shortcut |
| **8. Polish** | Week 11 | Latency tuning, privacy/consent screens, accessibility pass |
| **9. Advanced** | Later | Gaze/posture scoring, video avatar, Company Simulation research, org/batch accounts |

## 4. Suggested first tasks

1. Scaffold the monorepo and shared `ws-events`, `report.schema`, `coaching.schema`, and `modes` types.
2. Build the interview state machine with unit tests (no AI yet).
3. Build the device check page with camera preview, MediaPipe face detection, and mic meter.
4. Once the MVP loop works end to end, build Evaluation before Coaching — Coaching depends on Evaluation's output.
