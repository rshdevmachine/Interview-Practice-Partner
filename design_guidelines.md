# Interview Practice Partner - Design Guidelines

## Design Approach

**Reference-Based: Professional Productivity Tools**
Drawing inspiration from Linear's clean interface, Notion's information hierarchy, and Slack's conversation design. The aesthetic should feel professional and focused—simulating a real interview environment while remaining approachable and supportive.

**Core Principle:** Create a distraction-free, confidence-building environment that balances professional simulation with constructive learning.

---

## Typography

**Font Family:** Inter (primary), SF Pro (fallback)
- Headings: 600-700 weight
- Body: 400 weight  
- AI Interviewer messages: 500 weight (slightly bolder for authority)
- User responses: 400 weight
- Feedback text: 400 weight with 500 for highlights

**Scale:**
- Page title: text-2xl to text-3xl
- Section headers: text-lg to text-xl
- Chat messages: text-base
- Metadata (timestamps, labels): text-sm
- Button text: text-sm to text-base

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Chat message gaps: space-y-4
- Button padding: px-6 py-3

**Grid Structure:**
- Main layout: Two-column on desktop (sidebar + chat), single-column on mobile
- Role selection: Grid of 2-3 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

---

## Component Library

### Navigation & Layout
**Sidebar (Desktop):**
- Fixed left sidebar (w-64 to w-72)
- Contains: Logo, role selector, session history, new interview button
- Sticky positioning with overflow-y-auto for history

**Mobile Header:**
- Collapsible hamburger menu
- Session controls accessible via modal/drawer

### Role Selection Interface
**Role Cards:**
- Grid layout with hover lift effect
- Each card contains: Icon, role title, brief description
- Roles: Software Engineer, Product Manager, Retail Associate, Customer Service, Sales, Healthcare, Teaching
- Active selection indicated with border treatment

### Chat Interface
**Message Bubbles:**
- AI Interviewer: Left-aligned, distinct background, avatar icon
- User responses: Right-aligned, different background treatment
- Include subtle timestamps below messages
- Generous padding (p-4 to p-6) for readability

**Input Area:**
- Fixed bottom position with backdrop blur
- Dual-mode toggle: Text input / Voice recording button
- Text mode: Auto-expanding textarea (max-h-32)
- Voice mode: Large circular record button with pulse animation
- Send button always visible when text present

### Feedback Display
**Feedback Cards:**
- Appear inline after user responses or in dedicated feedback panel
- Sections: Strengths (with checkmark icons), Areas for Improvement (with lightbulb icons), Suggestions
- Use subtle background differentiation for each section
- Collapsible accordion for detailed feedback

### Session Controls
**Action Bar:**
- Top-right placement: End interview, Clear conversation, Settings
- Icon buttons with tooltips

---

## Key Screens

**1. Home/Role Selection (Landing State):**
- Centered layout with heading "Choose Your Interview Role"
- Grid of role cards below
- Quick start guides or tips in sidebar

**2. Active Interview Session:**
- Split view: Chat thread (main) + Feedback panel (collapsible right sidebar on desktop, tabs on mobile)
- Chat occupies 60-70% width, feedback 30-40%
- Real-time feedback appears as badges or inline cards

**3. Conversation History:**
- Sidebar list of past sessions with date, role, duration
- Click to review past conversations
- Archive/delete options on hover

---

## Interaction Patterns

**Interview Flow:**
1. Select role → Brief intro screen with "Start Interview" CTA
2. AI asks first question → User responds (text or voice)
3. AI provides follow-up → Feedback appears after 2-3 exchanges
4. Continue until user ends session

**Voice Recording:**
- Single tap to start/stop recording
- Visual feedback: Waveform animation or pulsing ring
- Auto-transcription appears in text input

**Feedback Timing:**
- Inline constructive notes after each response
- Comprehensive summary available via "View Feedback" button
- End-of-session detailed report

---

## Responsive Behavior

**Desktop (lg+):**
- Persistent sidebar with session history
- Two-panel layout (chat + feedback side-by-side)

**Tablet (md):**
- Collapsible sidebar (hamburger)
- Tabbed interface for chat/feedback switching

**Mobile (base):**
- Single-column stack
- Bottom sheet for feedback
- Floating action button for new interview

---

## Images

**Hero Image:** Not applicable - this is a utility application. Focus on immediate functionality.

**Icons:** Use Heroicons (outline style for UI chrome, solid for emphasis)
- Microphone icon for voice mode
- Paper airplane for send
- Check circles for strengths
- Light bulb for improvements
- Role-specific icons (briefcase, code, shopping cart, etc.)

---

## Accessibility

- High contrast text (WCAG AA minimum)
- Focus states on all interactive elements (ring-2 ring-offset-2)
- Keyboard navigation for entire interview flow
- Screen reader announcements for AI responses
- Voice input alternative to text always available

---

## Animation Guidelines

**Use Sparingly:**
- Message appearance: Subtle slide-up fade (150ms)
- Voice recording pulse: Gentle scale animation
- Feedback cards: Smooth expand/collapse (200ms)
- No decorative animations—maintain professional focus