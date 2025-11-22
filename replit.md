# Voice Interview Practice Partner

## Overview

Voice Interview Practice Partner is an AI-powered voiceover interview application that helps users practice for job interviews through natural voice-based conversation. The system uses Google's Gemini AI to simulate realistic interview conversations with text-to-speech audio playback for the interviewer and speech-to-text for user responses. Users can practice multiple interview types including software engineering, product management, retail, customer service, sales, healthcare, and teaching positions.

**Recent Changes (Voiceover Conversion):**
- Replaced text-only chat interface with voice-first interaction
- Added browser-based text-to-speech (TTS) for AI interviewer responses
- Integrated play/pause/stop controls for audio responses
- Auto-play AI responses for seamless voiceover experience
- Reordered input modes with voice as primary method
- Updated home page messaging to emphasize voiceover capability

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with TypeScript**: Type-safe component development using functional components and hooks
- **Vite**: Fast development server and optimized production builds
- **Wouter**: Lightweight routing library for client-side navigation
- **Path Aliases**: Configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component System**
- **shadcn/ui with Radix UI**: Accessible, unstyled component primitives styled with Tailwind CSS
- **Design Philosophy**: Professional productivity aesthetic inspired by Linear, Notion, and Slack
- **Styling Approach**: Tailwind CSS with custom design tokens for consistent spacing, colors, and typography
- **Theme System**: Light/dark mode support with CSS variables and localStorage persistence
- **Typography**: Inter font family with defined weight hierarchy (400 for body, 500 for AI messages, 600-700 for headings)

**State Management**
- **TanStack Query (React Query)**: Server state management with automatic caching, refetching, and optimistic updates
- **React Hooks**: Local component state using useState, useEffect, useRef
- **Custom Hooks**: Reusable logic for speech recognition, text-to-speech, mobile detection, and toast notifications

**Audio Integration**
- **Web Speech API (SpeechSynthesis)**: Browser-based text-to-speech for AI responses
- **Speech Recognition**: Browser-based speech-to-text for user voice input
- **useTextToSpeech Hook**: Custom hook managing TTS lifecycle with play/pause/stop/resume controls
- **useSpeechRecognition Hook**: Existing custom hook for capturing user voice input

**Layout Structure**
- **Responsive Design**: Desktop sidebar layout transitioning to mobile-first single column
- **Sidebar Navigation**: Fixed sidebar with role selection, session history, and new interview button
- **Main Content Area**: Voice-focused interface with message bubbles, audio playback controls, and voice input

### Backend Architecture

**Server Framework**
- **Express.js**: HTTP server with middleware for JSON parsing, URL encoding, and request logging
- **Development/Production Split**: Separate entry points (index-dev.ts, index-prod.ts) with Vite integration in development
- **Hot Module Replacement**: Vite middleware for rapid development iteration

**API Design**
- **RESTful Endpoints**: Resource-based routes for sessions, messages, and feedback
- **Request Flow**: Express → Routes → Storage Layer → Gemini AI (when needed)
- **Error Handling**: Centralized error responses with appropriate HTTP status codes
- **CORS & Sessions**: Express session management with connect-pg-simple for PostgreSQL session storage

**AI Integration**
- **Google Gemini API**: Using `gemini-2.5-flash` model for interview simulation
- **Role-Based Prompts**: Customized system instructions for each interview role type
- **Conversation Context**: Message history maintained and passed to AI for contextual responses
- **Feedback Generation**: AI analyzes user responses to provide structured feedback with strengths, improvements, and suggestions

**Data Storage Strategy**
- **Dual Storage Implementation**: Abstract IStorage interface with MemStorage (in-memory) and potential database implementations
- **Database ORM**: Drizzle ORM configured for PostgreSQL with Neon serverless driver
- **Schema Design**: Three main tables - sessions, messages, and feedback with cascading deletes
- **Migration Management**: Drizzle Kit for schema migrations with output to `/migrations` directory

### Database Schema

**Sessions Table**
- Tracks individual interview sessions with role type and status (active/completed)
- UUID primary key with created/completed timestamps
- Status field for lifecycle management

**Messages Table**
- Stores conversation history with role attribution (ai/user)
- Foreign key reference to sessions with cascade delete
- Sequential message ordering via timestamp

**Feedback Table**
- Contains structured feedback for user responses
- Arrays for strengths, improvements, and suggestions
- Integer score (1-5 scale) for quantitative assessment
- References both session and specific message being evaluated

### External Dependencies

**AI Services**
- **Google Gemini API**: Primary AI model for interview simulation and feedback generation
- **API Key Management**: Environment variable `GEMINI_API_KEY` for authentication
- **Model Version**: `gemini-2.5-flash` for fast, efficient responses

**Database**
- **PostgreSQL**: Relational database for persistent data storage
- **Neon Serverless**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Connection**: `DATABASE_URL` environment variable for connection string
- **Session Store**: connect-pg-simple for Express session persistence

**Third-Party Libraries**
- **date-fns**: Date formatting and manipulation (e.g., "2 minutes ago" timestamps)
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **Zod**: Runtime type validation for API requests and database operations
- **nanoid**: Unique ID generation for client-side operations

**Development Tools**
- **TypeScript**: Static type checking across full stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server
- **Drizzle Kit**: Database migration and schema management CLI

**Browser APIs**
- **Web Speech API (SpeechSynthesis)**: Voice output support via text-to-speech synthesis
- **Web Speech API (SpeechRecognition)**: Voice input support via speech-to-text recognition
- **LocalStorage**: Theme preference persistence
- **Fetch API**: HTTP client for API communication

## Voice Interaction Flow

1. **Interview Begins**: User selects a role, session starts
2. **AI Asks Question**: 
   - Backend generates question via Gemini API
   - Frontend receives text response
   - MessageBubble auto-plays text as audio using browser TTS
   - User hears the question spoken aloud
3. **User Responds**:
   - User enables voice input via microphone button
   - Speech recognition transcribes user's spoken response
   - User can review transcription and press "Send Response"
4. **AI Responds**:
   - Backend processes user response and generates AI response
   - AI response auto-plays as audio
   - Feedback is generated and displayed
5. **Interview Continues**: Cycle repeats for each question

## Components Updated

**New Hooks**
- `client/src/hooks/use-text-to-speech.ts`: Custom hook for text-to-speech functionality with play/pause/stop controls

**Updated Components**
- `client/src/components/message-bubble.tsx`: Added audio playback controls with play/pause/stop buttons for AI messages
- `client/src/components/chat-input.tsx`: Reordered to prioritize voice input as primary method
- `client/src/pages/interview-session.tsx`: Auto-plays last AI message for seamless voiceover experience
- `client/src/pages/home.tsx`: Updated description to highlight voiceover capability
