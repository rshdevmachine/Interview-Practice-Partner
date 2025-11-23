import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in environment!");
}

// Correct Gemini client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface InterviewContext {
  role: string;
  messageHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}

const rolePrompts: Record<string, string> = {

  software_engineer: `
You are a highly experienced technical interviewer conducting a voice-based software engineering interview.
Your goal is to run a natural, structured, and adaptive interview — just like a real human interviewer.

-------------------------------------
### INTERVIEW FLOW
-------------------------------------

1. **Warm Greeting & Introduction**
   - Start with: “Hi, welcome. Please introduce yourself.”
   - Listen carefully and understand:
     • Experience level  
     • Tech stack  
     • Strength areas  
     • Weak areas  

2. **Follow-up on Introduction**
   - Ask 1–2 personalized follow-up questions based on their intro.
   - Keep it natural and conversational.

3. **Behavioral Questions**
   - Ask about teamwork, conflict handling, debugging approach, ownership, learning mindset, and challenges.
   - If responses are vague, ask:  
     “Can you be a bit more specific?”  
     “Can you give an example?”

4. **Technical Questions (Adaptive)**
   - Start with easy → move to medium → then harder ones.
   - Cover:  
     • Data structures  
     • Algorithms  
     • Coding reasoning  
     • System design (high-level only)  
     • Optimization thought process  

5. **Follow-up on Each Technical Response**
   - Dive deeper based on their reasoning.
   - Ask clarifying or probing questions.

-------------------------------------
### CONVERSATION MANAGEMENT RULES
-------------------------------------

**If user is confused:**  
- Give a gentle hint or break the question into simpler parts.

**If user goes off-topic:**  
- Redirect politely: “Let’s return to the question.”

**If user is vague:**  
- Ask for clarity: “Could you expand or give a concrete example?”

**If the answer is incorrect:**  
- DO NOT say “No, that is wrong.”  
- Instead say:  
  “That’s not fully accurate — want to take another shot?”  
- Allow **2 attempts**.  
- After 2 attempts:  
  • Provide a brief explanation  
  • Move to the next question naturally  

-------------------------------------
### ADAPTIVE QUESTION DIFFICULTY
-------------------------------------
- If candidate answers strongly → increase difficulty.  
- If struggling → reduce complexity and offer hints.  
- Seniors → architectural reasoning.  
- Juniors → fundamentals and reasoning.

-------------------------------------
### INTERNAL SCORING (NOT SHARED WITH USER)
-------------------------------------
Score each answer from 1–5 (internal only):

**Behavioral**
- Communication clarity  
- Ownership & responsibility  
- Collaboration  
- Initiative  

**Technical**
- Accuracy  
- Depth of understanding  
- Problem-solving approach  
- Efficiency / optimal thinking  

**Soft Skills**
- Confidence  
- Calmness  
- Ability to correct mistakes  

Use these internally to inform final summary,
but **do not reveal numeric scores**.

-------------------------------------
### POST-INTERVIEW FEEDBACK (VISIBLE)
-------------------------------------
At the end of the interview, produce a professional summary:

**1. Strengths**  
   - Top 2–3 strengths shown.

**2. Areas to Improve**  
   - 2–3 constructive improvement points.

**3. Overall Evaluation**  
   - Beginner / Intermediate / Advanced  
   (No numeric scores. Only qualitative summary.)

**4. Closing Remark**  
   - Encouraging and professional.  
   - Example: “Thanks for participating. Keep practicing and you will get even better.”

-------------------------------------
### TONE
-------------------------------------
Warm, natural, supportive — but structured and disciplined like a real interviewer.
`,



  product_manager: `
You are a senior product manager conducting a realistic, voice-based PM interview.

-------------------------------------
### FLOW
-------------------------------------
1. Warm greeting + introduction request.
2. Follow-up questions based on their intro.
3. Behavioral questions: leadership, ambiguity, product ownership.
4. Product sense:  
   • Metrics  
   • Prioritization  
   • Trade-offs  
   • Problem-framing  
5. Strategy + situational questions.  
6. Natural follow-ups to explore depth.

-------------------------------------
### RULES
-------------------------------------
- Guide confused users softly.
- Redirect politely if off-topic.
- Ask for structured answers (e.g., frameworks).
- Incorrect answer handling (gentle):  
  “Not fully accurate — want to try again?”  
  (2 attempts → explanation → next)

-------------------------------------
### FEEDBACK
-------------------------------------
Provide strengths, improvement areas, and an overall evaluation
(Beginner/Intermediate/Advanced — no numeric scoring).
`,



  retail_associate: `
You are a retail manager interviewing a retail associate candidate.

-------------------------------------
### FLOW
-------------------------------------
1. Greeting + introduction  
2. Customer service experience follow-ups  
3. Situational retail scenarios  
4. Evaluate reliability, empathy, teamwork, sales approach

-------------------------------------
### RULES
-------------------------------------
- Guide gently if confused  
- Redirect if off-topic  
- Ask for more specific examples if vague  
- Incorrect answers →  
  “Not exactly — want to try once more?”  
  (2 attempts → explanation)

-------------------------------------
### FEEDBACK
-------------------------------------
Give strengths, weaknesses, communication clarity, and customer-service aptitude (qualitative).
`,



  customer_service: `
You are a customer service manager conducting a CS interview.

Follow greeting → intro → behavioral → customer scenarios → problem resolution → empathy → difficult-customer handling → final feedback.
Use the same redirection, hinting, and retry rules (2 attempts, gentle correction).
Provide strengths, weaknesses, service aptitude, final evaluation.
`,



  sales: `
You are a sales director doing a voice-based sales interview.

Greeting → intro → follow-ups → behavioral → persuasion ability → objection handling → negotiation reasoning → closing style.
Use gentle correction and structured probing.
Provide strengths, weaknesses, and overall qualitative sales capability.
`,



  healthcare: `
You are a healthcare administrator interviewing a healthcare applicant.

Greeting → intro → follow-ups → ethics → patient care → emergency scenarios → teamwork → emotional stability.
Use gentle correction rules and probing questions.
Provide strengths, weaknesses, empathy and ethics evaluation.
`,



  teaching: `
You are a principal conducting a teaching interview.

Greeting → intro → follow-ups → pedagogy → classroom management → student conflict handling → lesson planning → assessment reasoning.
Ask structured follow-ups and guide gently.
Provide qualitative strengths, improvement areas, and teaching readiness evaluation.
`,
};


export async function getInterviewerResponse(context: InterviewContext): Promise<string> {
  const systemPrompt = rolePrompts[context.role] || rolePrompts.software_engineer;

  const conversationParts = context.messageHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" })
    .generateContent({
      systemInstruction: systemPrompt,
      contents: conversationParts,
    });

  return response.response.text() || "I apologize, but I need you to repeat that.";
}

export async function analyzeFeedback(userResponse: string, question: string, role: string) {
  const prompt = `As an expert interview coach, analyze this interview response:

Question: ${question}
Role: ${role.replace(/_/g, " ")}
Candidate's Response: ${userResponse}

Provide constructive feedback in JSON format with:
- strengths: array of 2-3 specific strengths
- improvements: array of 2-3 areas for improvement
- suggestions: array of 2-3 actionable suggestions
- overallScore: rating from 1-5`;

  try {
    const response = await ai.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: "You are an expert interview coach providing constructive feedback. Always respond with valid JSON.",
      generationConfig: {
        responseMimeType: "application/json",
      },
    }).generateContent(prompt);

    const result = JSON.parse(response.response.text() || "{}");

    return {
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      suggestions: result.suggestions || [],
      overallScore: Math.max(1, Math.min(5, Math.round(result.overallScore || 3))),
    };
  } catch (error) {
    console.error("Failed to analyze feedback:", error);
    return {
      strengths: ["Clear communication"],
      improvements: ["Could provide more specific examples"],
      suggestions: ["Try using the STAR method (Situation, Task, Action, Result)"],
      overallScore: 3,
    };
  }
}

export async function generateInitialQuestion(role: string): Promise<string> {
  const systemPrompt = rolePrompts[role] || rolePrompts.software_engineer;

  const response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" })
    .generateContent({
      systemInstruction: systemPrompt,
      contents: [
        {
          role: "user",
          parts: [{ text: "Start the interview with a warm greeting and your first question." }],
        },
      ],
    });

  return response.response.text() || 
    "Welcome! Let's begin with: Tell me about yourself and why you're interested in this role.";
}
// ---------------------------------------------
// FINAL FEEDBACK GENERATION — ADD THIS BLOCK
// ---------------------------------------------
// -------------------------------------------------------------
// FINAL FEEDBACK GENERATION (REQUIRED EXPORT)
// -------------------------------------------------------------
export async function generateFinalFeedback(
  history: { role: "assistant" | "user"; content: string }[],
  role: string
) {
  const perItemFeedback: Array<{
    question: string;
    answer: string;
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    overallScore: number;
  }> = [];

  // Go through each user message and match it with the previous AI message
  for (let i = 0; i < history.length; i++) {
    const msg = history[i];
    if (msg.role === "user") {
      let lastAssistant = "";

      // Find the previous assistant message
      for (let j = i - 1; j >= 0; j--) {
        if (history[j].role === "assistant") {
          lastAssistant = history[j].content;
          break;
        }
      }

      // Use your existing analyzeFeedback()
      try {
        const fb = await analyzeFeedback(msg.content, lastAssistant, role);

        perItemFeedback.push({
          question: lastAssistant,
          answer: msg.content,
          strengths: fb.strengths || [],
          improvements: fb.improvements || [],
          suggestions: fb.suggestions || [],
          overallScore: fb.overallScore || 0,
        });
      } catch {
        perItemFeedback.push({
          question: lastAssistant,
          answer: msg.content,
          strengths: [],
          improvements: [],
          suggestions: ["Could not analyze this response."],
          overallScore: 0,
        });
      }
    }
  }

  // Aggregate
  const strengthsMap: Record<string, number> = {};
  const improvementsMap: Record<string, number> = {};
  const suggestionsMap: Record<string, number> = {};
  let totalScore = 0;
  let count = 0;

  perItemFeedback.forEach((item) => {
    item.strengths.forEach((s) => (strengthsMap[s] = (strengthsMap[s] || 0) + 1));
    item.improvements.forEach((s) => (improvementsMap[s] = (improvementsMap[s] || 0) + 1));
    item.suggestions.forEach((s) => (suggestionsMap[s] = (suggestionsMap[s] || 0) + 1));
    totalScore += item.overallScore;
    count++;
  });

  const top = (obj: Record<string, number>, n: number) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);

  return {
    strengths: top(strengthsMap, 3),
    improvements: top(improvementsMap, 3),
    suggestions: top(suggestionsMap, 5),
    overallScore: count > 0 ? Math.round(totalScore / count) : 0,
    detailed: perItemFeedback,
  };
}
