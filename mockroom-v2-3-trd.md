# MockRoom: Technical Requirements Document (TRD) — Consolidated v2

**Project:** MockRoom, AI Mock Interview & Interview Coaching Platform
**Owner:** Abhishek
**Version:** 2.0 (22 Sep 2026) — supersedes v1.0 TRD; adds Coaching, Job Analyzer, Modes, and Personas

---

## 1. Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | Server components for dashboard, client components for live room |
| UI state | Zustand | Live session state |
| Realtime client | Native WebSocket wrapper | Audio worklet for mic chunks |
| Terminal | xterm.js | Interactive answer terminal |
| Code editor | Monaco Editor | Coding round |
| Face and pose | MediaPipe Tasks Vision (WASM) | Runs locally |
| Backend | NestJS, TypeScript | Modular monolith |
| Realtime | NestJS WebSocket gateway (`ws` adapter) | Binary audio frames plus JSON events |
| Database | PostgreSQL with Prisma or TypeORM | |
| Cache and state | Redis | Session state, pub/sub, rate limiting |
| Queue | BullMQ on Redis | Evaluation, Coaching, tip-refresh jobs |
| Object storage | S3-compatible (S3, R2, or MinIO) | Files, recordings |
| STT | Deepgram streaming (or Whisper for MVP) | Interim results, word timestamps |
| LLM | Anthropic Claude or another LLM API | Interviewer, parser, evaluator, coach |
| TTS | ElevenLabs, Cartesia, or OpenAI TTS | Streaming, persona-mapped voices |
| Code sandbox | Judge0 or Piston (self-hosted) | Isolated execution |
| Auth | JWT with refresh tokens, or NextAuth | Email plus Google login |
| Infra | Docker, Nginx, GitHub Actions | |

## 2. Backend modules (NestJS)

| Module | Purpose |
|---|---|
| `auth` | Signup, login, tokens, guards |
| `users` | Profile, settings |
| `jobs` | Job setup, JD storage, target-role tracking |
| `parser` | JD and resume parsing into structured skills with source tags |
| `analyzer` | Job Analyzer profile generation, company research (Company Simulation mode) |
| `plans` | Interview plan generation and editing |
| `sessions` | Session lifecycle and persistence |
| `realtime` | WebSocket gateway, audio routing |
| `orchestrator` | State machine, mode config, persona injection, prompt building, turn control |
| `ai` | Provider adapters for STT, LLM, TTS (swappable) |
| `runner` | Code execution client for the sandbox |
| `evaluation` | Scoring pipeline, metrics, per-question review, report generation |
| `coaching` | Answer rewriting, tip library, practice attempts, language coach |
| `analytics` | Progress, trends, Weak Areas, Retry Mistakes |
| `storage` | File uploads and signed URLs |

Provider adapters use interfaces (`SttProvider`, `LlmProvider`, `TtsProvider`) so vendors can be swapped without touching the orchestrator.

## 3. REST API (v1)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup`, `/auth/login`, `/auth/refresh` | Authentication |
| GET | `/me` | Current user |
| POST | `/resumes` | Upload resume |
| POST | `/jobs` | Create job setup from JD |
| GET | `/jobs/:id` | Job with parsed skills |
| GET | `/jobs/:id/analysis` | Job Analyzer profile (skills, confidence bars, source tags) |
| POST | `/plans` | Generate interview plan for a job |
| PATCH | `/plans/:id` | Edit plan; set mode and persona |
| POST | `/sessions` | Create session from plan; returns session id and WS token |
| GET | `/sessions/:id` | Session status |
| POST | `/sessions/:id/end` | End session early |
| GET | `/sessions/:id/report` | Final report (scores, per-question review) |
| GET | `/sessions` | History |
| GET | `/coaching/sections` | List coaching cards, filterable by section type, session, or practiced status |
| GET | `/coaching/sections/:id` | One coaching card's full detail |
| POST | `/coaching/sections/:id/practice` | Submit a re-attempt (text or audio) for scoring |
| GET | `/coaching/trends` | Most-repeated issues |
| GET | `/analytics/progress` | Score trends over time |
| GET | `/analytics/weak-areas` | Aggregated recurring issues across sessions |
| GET | `/analytics/retry-queue` | Poorly scored questions eligible for retry |
| GET | `/answers/search?q=` | Answer Library search |
| DELETE | `/sessions/:id` | Delete session data |

## 4. WebSocket protocol

Endpoint: `wss://host/realtime?token=<ws_token>&sessionId=<id>`

**Client to server**

| Event | Payload |
|---|---|
| `audio.chunk` | Binary PCM 16 kHz mono frames |
| `client.face` | `{ state: "lost" or "found", at: ms }` |
| `client.gaze` | `{ offCamera: boolean, at: ms }` |
| `client.terminal.submit` | `{ questionId, text, kind: "text" or "code", language? }` |
| `client.control` | `{ action: "pause" or "resume" or "end" }` |
| `client.interrupt` | `{ at: ms }` |

**Server to client**

| Event | Payload |
|---|---|
| `server.transcript.interim` | `{ text }` |
| `server.transcript.final` | `{ text, startMs, endMs }` |
| `server.audio.chunk` | Binary TTS audio |
| `server.interviewer.text` | `{ text, turnId }` (captions) |
| `server.state` | `{ round, timeRemaining, questionIndex, total, mode, persona }` |
| `server.warning` | `{ type: "face" or "mic" or "network", message }` |
| `server.code.result` | `{ passed, total, stdout, stderr, timeMs }` |
| `server.session.ended` | `{ reportPending: true }` |

## 5. Database schema (PostgreSQL)

```sql
users(id, email, password_hash, name, created_at)

resumes(id, user_id, file_url, parsed_json, created_at)

jobs(id, user_id, title, company, experience_level, jd_text,
     parsed_skills jsonb,              -- each item tagged source_type: verified|reported|inferred
     interview_date, created_at)

interview_plans(id, job_id, difficulty, rounds jsonb,
                 total_questions, duration_minutes,
                 mode text,                          -- practice|realistic|pressure|learning|company_sim|final_mock
                 persona_id, created_at)

personas(id, name, role, personality, style,
         follow_up_intensity, interruption_rate, difficulty, voice_id)

sessions(id, user_id, plan_id, status, started_at, ended_at,
         mode, persona_id, overall_score, verdict,
         recording_url, created_at)

turns(id, session_id, round, seq, speaker,        -- 'interviewer' | 'candidate'
      text, start_ms, end_ms, question_id, created_at)

questions(id, session_id, round, text, topic, difficulty, expected_points jsonb)

submissions(id, session_id, question_id, kind, language, content,
            result jsonb, created_at)

client_events(id, session_id, type, at_ms, meta jsonb)

scores(id, session_id, category, score, weight, summary, created_at)

question_scores(id, session_id, question_id, score,
                 dimensions jsonb,        -- {relevance, technicalAccuracy, structure, specificity, confidence}
                 strengths jsonb, improvements jsonb, suggested_structure jsonb,
                 evidence jsonb, ideal_answer, created_at)

reports(id, session_id, report_json jsonb, generated_at)

coaching_sections(id, session_id, question_id,
                   section_type,            -- intro|project|technical|behavioral|closing
                   original_text, rewritten_text,
                   issues jsonb, reasoning jsonb, tip_ids jsonb,
                   practiced boolean default false, created_at)

coaching_practice_attempts(id, coaching_section_id, attempt_text,
                            attempt_audio_url, score,
                            compared_to_original_delta, created_at)

coaching_tips(id, topic, question_type, tip_text, source_url, researched_at)
```

Indexes: `sessions(user_id, created_at)`, `turns(session_id, seq)`, `client_events(session_id, at_ms)`, `coaching_sections(session_id, section_type)`.

## 6. Prompts (summary)

- **JD/resume parser prompt** → JSON: `{ role, seniority, skills: [{name, importance, sourceType}], responsibilities, topics }`.
- **Plan generator prompt** → JSON: rounds, topics per round, question counts, time per round.
- **Interviewer system prompt** contains: active **persona** (name, tone, company style), JD summary and skills, current round and goal, active **mode config** (hints allowed, interruption frequency, follow-up intensity, think time), rules (one question at a time, short spoken sentences, no lists or markdown, acknowledge answers naturally, follow up on vague answers, probe unverified skill claims, never reveal scoring mid-interview), and remaining time.
- **Evaluator prompt** receives the transcript, question list, code results, and computed metrics; returns the JSON schema below. Temperature 0–0.2.
- **Coaching rewrite prompt** receives the weak section's transcript, JD, relevant `coaching_tips`, and rubric; must restructure only what the candidate actually said — never invent new facts or projects.

## 7. Evaluation output schema

```json
{
  "overall": 0,
  "verdict": "Not ready | Almost there | Ready | Strong",
  "categories": [
    { "name": "technical", "score": 0, "summary": "" },
    { "name": "communication", "score": 0, "summary": "" }
  ],
  "questions": [
    {
      "questionId": "",
      "score": 0,
      "dimensions": { "relevance": 0, "technicalAccuracy": 0, "structure": 0, "specificity": 0, "confidence": 0 },
      "strengths": [""],
      "improvements": [""],
      "suggestedStructure": [""],
      "evidence": [{ "quote": "", "atMs": 0 }],
      "idealAnswer": ""
    }
  ],
  "metrics": {
    "wordsPerMinute": 0,
    "fillerCount": 0,
    "fillerPerMinute": 0,
    "hedgeCount": 0,
    "avgPauseMs": 0,
    "faceVisiblePct": 0,
    "eyeContactPct": 0
  },
  "timeline": [{ "atMs": 0, "type": "", "note": "" }],
  "topRecommendations": ["", "", ""]
}
```

## 8. Coaching output schema

```json
{
  "sections": [
    {
      "questionId": "",
      "sectionType": "intro | project | technical | behavioral | closing",
      "originalText": "",
      "issues": ["", ""],
      "rewrittenText": "",
      "reasoning": ["", ""],
      "tipIds": ["", ""]
    }
  ]
}
```

The backend validates both schemas with a schema validator (for example, Zod) and retries once on invalid output.

## 9. Code execution

- Send code, language, and test cases to the sandbox with a 5 s CPU limit, 256 MB memory, no network, and a maximum output size.
- Supported languages in v1: JavaScript, Python, Java, C++.
- Results returned via `server.code.result` and stored in `submissions.result`.

## 10. Security and privacy

- Passwords hashed with Argon2 or bcrypt; short-lived JWT access tokens.
- Short-lived, session-scoped WebSocket tokens.
- Rate limiting on auth, session creation, and AI calls.
- Input validation on every endpoint; file type and size checks on uploads.
- Sandbox isolated from the main network.
- Video stays in the browser unless the user opts in to recording; recordings encrypted at rest with signed, expiring URLs.
- Transcripts, resumes, and coaching data scoped strictly to the owning user.
- Account/session deletion removes DB rows and files.
- Clear consent screen for camera, mic, and data use.
- Company-research results in Job Analyzer are cached and clearly source-tagged; never presented as confirmed interview content.

## 11. Testing strategy

| Type | Scope |
|---|---|
| Unit | State machine transitions, scoring math, coaching rewrite validation, prompt builders |
| Integration | REST endpoints, WebSocket flows with mocked providers |
| Contract | Provider adapters against recorded responses |
| Latency tests | Measure each pipeline step and total response time |
| E2E (Playwright) | Setup, device check with fake media stream, full mock session, coaching practice flow |
| Evaluation quality | A fixed set of sample interviews with expected score ranges, to detect scoring drift |
| Coaching quality | Sample weak answers with expected rewrite properties (no invented facts, length bound) |

## 12. Performance targets

| Metric | Target |
|---|---|
| Interviewer response start (p50 / p95) | 1.5 s / 2.5 s |
| Face-lost detection to warning | under 5 s |
| Report generation after session | under 60 s |
| Coaching section generation after report | under 90 s |
| Page load (LCP) for dashboard | under 2.5 s |

## 13. Environment configuration

```
DATABASE_URL, REDIS_URL, JWT_SECRET, S3_ENDPOINT, S3_BUCKET,
STT_API_KEY, LLM_API_KEY, TTS_API_KEY, SANDBOX_URL,
ALLOWED_ORIGINS, MAX_SESSION_MINUTES, TIP_REFRESH_CRON
```
