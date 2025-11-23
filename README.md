# Interview Practice Partner — Full Assignment README

## Overview

Interview Practice Partner is an AI-powered, voice-first mock interview application designed to help users practice real-world job interviews. The system simulates a real interviewer using Google Gemini, conducts multi-turn interviews, asks follow-up questions, and provides structured feedback including strengths, improvements, suggestions, and a score.

Unlike text-only chat apps, this version is voice-first, using browser-based speech recognition (STT) and text-to-speech (TTS) to deliver a highly natural, hands-free, conversational interview experience.

This system was built specifically for the Eightfold AI Agent Assignment – Interview Practice Partner (Problem #2).

## 1. Agent Goals & Core Capabilities

This agent is designed to behave like a real interviewer:

- Asks role-specific interview questions (SWE, PM, Retail, Customer Service, Sales, Healthcare, Teaching)
- Analyzes user answers using model reasoning + context
- Generates intelligent follow-up questions
- Provides structured feedback (strengths, improvements, suggestions, score)
- Maintains conversation memory
- Adapts to different user personas

## 2. Agentic Behavior

### 2.1 Follow-Up Question Intelligence
The agent evaluates each response for:
- Completeness
- Specificity
- Relevance
- Role alignment
- Behavioral depth

Follow-up examples:
- If answer is short → “Could you explain that in more detail?”
- If too long → Summarize + redirect
- If missing competency → Ask targeted question
- If generic → Ask for examples

### 2.2 Person Handling

#### Confused User
Behavior: Simplify, rephrase, provide examples  
Response: “Let me put that question in simpler words…”

#### Efficient User
Behavior: Encourage deeper elaboration  
Response: “Great. Could you walk me through the reasoning?”

#### Chatty User
Behavior: Summarize + refocus  
Response: “Thanks for the detail—let’s focus on your key contribution.”

#### Edge Case User
Behavior: Ask to repeat, clarify  
Response: “I may have missed that—could you say that again?”

## 3. Voice Interaction Design

### Why Voice?
- Realistic interview feel
- More natural pacing
- Better user engagement

### Why Browser STT/TTS?
- Zero latency
- No server audio streaming
- No additional cost
- Works instantly

## 4. System Architecture

### High-Level Diagram

```
          ┌────────────────────────────┐
          │        Frontend (React)     │
          │ - STT (SpeechRecognition)   │
User →    │ - TTS (SpeechSynthesis)     │ ← AI Voice
Voice     │ - Chat UI / Controls        │
          └──────────────┬──────────────┘
                         │ REST API
                         ▼
         ┌─────────────────────────────────────┐
         │        Backend (Express + TS)        │
         │ - Session mgmt                       │
         │ - Message routing                    │
         │ - Prompt construction                │
         └──────────────┬──────────────────────┘
                        │ Gemini Request
                        ▼
             ┌──────────────────────────────┐
             │        Gemini 2.5 Flash      │
             │ - Interview simulation       │
             │ - Follow-up generation       │
             │ - Feedback analysis          │
             └──────────────┬──────────────┘
                            │
                            ▼
        ┌────────────────────────────────────┐
        │    PostgreSQL (Neon) + Drizzle ORM │
        │ - sessions                         │
        │ - messages                         │
        │ - feedback                         │
        └────────────────────────────────────┘
```

## 5. Frontend Architecture

- React + TypeScript
- Vite
- Tailwind + shadcn/ui
- Wouter routing
- TanStack Query for caching
- Custom hooks:
  - useTextToSpeech
  - useSpeechRecognition

### Updated Components
- `use-text-to-speech.ts`
- `message-bubble.tsx`
- `chat-input.tsx`
- `interview-session.tsx`
- `home.tsx`

## 6. Backend Architecture

- Express.js
- TypeScript
- Drizzle ORM
- Neon PostgreSQL
- Google Gemini via `@google/generative-ai`
- REST endpoints:
  - `/sessions`
  - `/messages`
  - `/feedback`

## 7. Database Schema

### Sessions
```
id (uuid)
role
status
createdAt
completedAt
```

### Messages
```
id (uuid)
sessionId → FK
role (ai/user)
content
createdAt
```

### Feedback
```
id (uuid)
sessionId → FK
messageId → FK
strengths[]
improvements[]
suggestions[]
score (1–5)
```

## 8. Prompt Strategy

Prompt defines:
- Tone
- Rules
- Follow-up logic
- Feedback format
- Memory inclusion

Gemini receives:
- Entire conversation history
- Session role
- Last user message

## 9. Interview Flow

```
Select Role
↓
Start Session
↓
AI Speaks First Question
↓
User Speaks Answer (STT)
↓
Backend Sends to Gemini
↓
AI Generates Follow-Up + Feedback
↓
TTS Speaks AI Response
↓
Loop Until Session Ends
```

## 10. Design Decisions

| Decision | Reason |
|----------|--------|
| Browser STT/TTS | Instant voice interaction |
| Gemini Flash | Fast multi-turn performance |
| React + TS | Predictable UI development |
| Drizzle ORM | Safe SQL + migrations |
| Neon | Serverless, scalable |
| Express | Reliable routing |

## 11. Setup Instructions

### Install
```
npm install
cd client && npm install
cd server && npm install
```

### Environment Variables
```
GEMINI_API_KEY=
PORT=5000
```

### Run Frontend
```
npm run dev --prefix client
```

### Run Backend
```
npm run dev --prefix server
```

## 12. Demo Instructions

1. Select interview role  
2. AI introduces itself  
3. First question auto-plays  
4. User answers via microphone  
5. AI follows up + gives feedback  
6. Review conversation history  
7. End session to save feedback  

## 13. Conclusion

Interview Practice Partner is a complete, intelligent, voice-based mock interview system built to satisfy the full Eightfold AI Agent Assignment requirements. It delivers adaptive interviewing, structured feedback, multi-role support, and natural voice interaction.

