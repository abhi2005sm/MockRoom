# MockRoom: Product Requirements Document (PRD) — Consolidated v2

**Project:** MockRoom, AI Mock Interview & Interview Coaching Platform
**Owner:** Abhishek
**Version:** 2.0 (22 Sep 2026) — supersedes v1.0 PRD; merges the Communication Coach and Job Analyzer/Modes/Personas additions

---

## 1. Problem

Interviews and online assessments are now fully online. Candidates — especially freshers — get anxious because they've never practiced in a realistic setting: camera on, mic on, a real-sounding interviewer, real time pressure. Existing tools are either plain question banks or robotic chatbots that give vague, one-number feedback with no path to actually improve.

## 2. Vision

A personal AI interview trainer that takes a job description and resume, recreates a realistic interview end to end (voice, face-cam, terminal), scores everything, rewrites your weak answers into stronger ones, and remembers your recurring patterns so every next session targets exactly what you need. The loop — interview → recording → evaluation → rewritten answers → practice → retry → measurable improvement — is the product, not any single feature.

## 3. Differentiation

Most competitors (Huru, Final Round AI, interviewing.io, Yoodli, Pramp/Exponent) cover one or two pieces well: mock interview + delivery feedback, or technical + coding, or communication coaching, or peer practice. None combine job-specific analysis, adaptive conversational interviewing, coding, full multi-dimensional rating, "say it like this" rewriting, and a persistent per-user weakness profile into one loop. MockRoom's edge is that **it learns how the specific user interviews**, not just that it asks questions.

Positioning: MockRoom helps you *become* capable of doing the interview yourself — it is not a live-interview answer-assistance tool ("copilot"), and it never frames itself that way.

## 4. Non-goals (v1)

- Real recruiter/company integrations or actual hiring decisions.
- Photorealistic video avatar (v1 uses voice plus a simple animated avatar).
- Proctoring or cheating detection for real exams.
- Native mobile apps (responsive web only).
- Scoring appearance, facial expression, or attractiveness — face detection is a **readiness/technical check only** (is a face visible, is lighting adequate), never a personality or hireability signal.

## 5. Target users

| Persona | Description | Main need |
|---|---|---|
| **Fresher (primary)** | Final-year student, first interviews | Confidence, realistic practice, concrete feedback |
| **Working professional** | Switching jobs | Role-specific technical depth |
| **Bootcamp / college placement cell** | Trains many students | Batch usage, reports (later phase) |

## 6. Core user journey

1. Sign up and log in.
2. **My Target Role:** enter job title, company, JD (paste or upload), resume, experience level; optionally set a real interview date.
3. **Job Analyzer:** AI parses the JD and resume into a skill/confidence profile, labeling each insight as verified company info, candidate-reported anecdote, or AI-inferred guidance.
4. **Interview Plan:** rounds, topics, question counts, generated and editable; pick an **interview mode** (Practice, Realistic, Pressure, Learning, Company Simulation, Final Mock) or follow the suggested 5-level confidence progression.
5. **Device check:** camera, mic, face detection, speaker test.
6. **Live interview:** warm-up, behavioral, technical, coding/terminal, candidate questions, closing — driven by an interviewer persona, adaptive follow-ups, live face/mic warnings, barge-in support.
7. **Evaluation:** multi-dimensional scores, per-question review (what worked / what was missing / suggested structure), hire-readiness verdict.
8. **Communication Coach:** section-wise "say it like this" rewrites of weak answers, with practice/re-record and comparison.
9. **Recordings:** full replay with a clickable transcript timeline, linked to coaching cards.
10. **Performance and Weak Areas:** trends over time, recurring-issue detection, next-session recommendations.
11. Repeat, ideally progressing through confidence levels, culminating in a **Final Mock** the night before a real interview.

## 7. Features and priority

| ID | Feature | Priority |
|---|---|---|
| F1 | Auth, profile, resume upload | P0 |
| F2 | JD/resume parsing into skills, with source-provenance tagging (verified/reported/inferred) | P0 |
| F3 | Job Analyzer visual profile (skill confidence bars, likely focus areas) | P0 |
| F4 | Interview plan generation and editing | P0 |
| F5 | Device check (camera, mic level, face detection, speaker test) | P0 |
| F6 | Live voice interview with LLM interviewer, streaming STT/LLM/TTS | P0 |
| F7 | Face-not-detected / mic-issue live warnings (spoken and visual) | P0 |
| F8 | Interview state machine (rounds, timing, question budget) | P0 |
| F9 | Terminal / answer box to type and submit answers | P0 |
| F10 | Multi-dimensional rating system with full report | P0 |
| F11 | Per-question review (what worked / missing / suggested structure) | P0 |
| F12 | Communication Coach: section-wise answer rewriting + practice/retry | P0 |
| F13 | Coding round with code editor and sandbox execution | P1 |
| F14 | Interview modes (6) and confidence-level progression | P1 |
| F15 | Interviewer personas (name, personality, style) | P1 |
| F16 | Interruption handling (barge-in) | P1 |
| F17 | Interview Language Coach (filler/hedge-word detection) | P1 |
| F18 | Progress dashboard, Weak Areas, Retry Mistakes queue | P1 |
| F19 | Interview Recordings with clickable transcript timeline | P1 |
| F20 | Self-Introduction dedicated trainer (attempt-over-attempt scoring) | P1 |
| F21 | Answer Library (searchable history of every answer given) | P1 |
| F22 | "Prepare me for my actual interview" shortcut (final simulation) | P2 |
| F23 | Body-language analysis (eye contact, posture, head pose) | P2 |
| F24 | Session recording download/export (opt-in) | P2 |
| F25 | Real-time video avatar interviewer | P2 |
| F26 | Company Simulation mode using public company research | P2 |
| F27 | Organization/batch accounts and admin reports | P3 |

## 8. Functional requirements

**Setup and analysis**
- FR-1: User can paste text or upload PDF/DOCX for JD and resume.
- FR-2: System extracts role, required skills, responsibilities, seniority, and produces a visual skill-confidence profile.
- FR-3: Every extracted or researched fact is tagged `verified`, `reported`, or `inferred`, and the UI never states "this is exactly what they'll ask" — only "here's what to prepare for."
- FR-4: System generates an interview plan (rounds, topics, question counts, duration); user can edit it and pick a mode.

**Device check**
- FR-5: Show live camera preview and detect exactly one face.
- FR-6: Show live mic level meter; user reads a test sentence and sees it transcribed.
- FR-7: Block start until camera, mic, and speaker checks pass (with a text-only override).

**Live interview**
- FR-8: Interviewer speaks in a natural voice matching the selected persona; candidate answers by voice; live captions optional.
- FR-9: If no face is detected for 4 seconds, interviewer pauses and says so; resumes when the face returns. Face detection never contributes to the hireability score.
- FR-10: If mic input is silent or too low for 6 seconds during an answer window, the interviewer prompts the candidate.
- FR-11: Interviewer generates adaptive follow-up questions based on the candidate's actual answers, including probing unverified skill claims (for example, a skill mentioned but never substantiated).
- FR-12: Candidate can interrupt; interviewer stops speaking and listens (barge-in).
- FR-13: Terminal panel lets the candidate type or code answers; submissions are included in the conversation and evaluation.
- FR-14: Timer per round and overall; interviewer manages time and moves on naturally.
- FR-15: Candidate can ask questions to the interviewer at the end.
- FR-16: Candidate can pause or end the session at any time.
- FR-17: Selected interview mode changes hint availability, interruption frequency, follow-up intensity, and think time, without changing the underlying state machine.

**Rating, review, and coaching**
- FR-18: After the session, produce multi-dimensional scores per category (0–10) and per question (relevance, technical accuracy, structure, specificity, confidence), plus an overall score (0–100) and a hire-readiness verdict.
- FR-19: Each answer gets an immediate lightweight review: what worked, what was missing, a suggested structure.
- FR-20: The Communication Coach produces a full rewrite for the weakest sections (starting with self-introduction), with the original text, the problem, the rewrite, the reasoning, and a practice/re-record option scored against the original.
- FR-21: Coaching rewrites never invent facts or experience the candidate didn't state; they only restructure, sharpen, or add missing professional framing.
- FR-22: An Interview Language Coach flags filler and hedging phrases across the transcript with alternative phrasing.
- FR-23: Show a session timeline of events (face lost, long silences, filler-word spikes).
- FR-24: Recurring issues are grouped across sessions into a Weak Areas view, not just shown per session.
- FR-25: Scores and coaching issues are tracked across sessions to chart progress and recommend the next session's focus.
- FR-26: Poorly scored questions from any past session can be re-asked from a Retry Mistakes queue.
- FR-27: Every answer the candidate has ever given is searchable in an Answer Library.

## 9. Rating categories and weights (default, configurable per role)

| Category | Weight | Signals |
|---|---|---|
| Technical correctness | 30% | LLM rubric vs. JD skills |
| Communication and structure | 20% | Clarity, STAR usage, relevance |
| Coding round | 15% | Tests passed, time, code quality |
| Speech delivery | 15% | Pace (WPM), fillers, pauses, volume |
| Confidence | 10% | Hedging, hesitation, steadiness |
| Body language and presence | 5% | Face visibility, eye contact, posture |
| Professionalism | 5% | Setup quality, focus, punctuality |

Each question additionally carries its own dimensional breakdown (relevance, accuracy, structure, specificity, confidence) rather than a single number.

## 10. Non-functional requirements

| Area | Requirement |
|---|---|
| **Latency** | Interviewer response start under 1.5 s after the candidate stops speaking (p50), under 2.5 s (p95) |
| **Availability** | 99.5% for MVP |
| **Privacy** | Face and pose detection run in the browser; video never uploaded unless the user opts in |
| **Security** | Auth, encrypted transport, encrypted storage of transcripts and resumes, per-user data isolation |
| **Scalability** | 500 concurrent sessions in v1 (horizontal scaling of WebSocket servers) |
| **Accessibility** | Text-only mode, captions, keyboard navigation |
| **Browser support** | Latest Chrome, Edge, Firefox, Safari |
| **Data retention** | User can delete sessions and account data on request |
| **Trust** | System never presents AI-inferred prep guidance as guaranteed real questions; never scores appearance or attractiveness |

## 11. Success metrics

- Session completion rate above 70%.
- Median interviewer response latency under 1.5 s.
- Self-reported anxiety (post-session 1–5 survey) averaging above 4.0 by session 3.
- Score improvement of at least 15% between a user's first and fifth session.
- 40% of users return for a second session within 7 days.
- At least 50% of users who receive a Communication Coach rewrite practice it at least once.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| High latency makes the AI feel robotic | Stream STT, LLM, and TTS; sentence-level TTS; consider a speech-to-speech API |
| Inconsistent LLM scoring | Fixed rubric, structured JSON output, low temperature, evidence required |
| Coaching rewrites overstate the candidate's experience | Explicit rule: rewrite only restructures stated facts, never adds new ones |
| API cost per session | Cache JD analysis, cheaper models for evaluation, cap session length, batch web-research into periodic tip refreshes rather than per-session |
| Privacy concerns about camera | Local face detection, opt-in recording, clear consent |
| STT errors on accents | Multilingual STT, allow typed correction, show transcript |
| Harsh feedback raises anxiety | Constructive tone, one concrete fix per weakness, Friendly/Level-1 mode as default entry point |
| Overclaiming what the AI "knows" about a real interview | Source-provenance tagging (verified/reported/inferred) on every prep insight |

## 13. Roadmap tie-in

See the File Structure document for the phased build order (Foundation → MVP → Voice/Device → Full Rating → Coaching → Coding → Modes/Personas → Polish → Advanced).
