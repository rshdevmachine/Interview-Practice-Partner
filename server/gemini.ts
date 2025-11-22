import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
// do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface InterviewContext {
  role: string;
  messageHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}

const rolePrompts: Record<string, string> = {
  software_engineer: `You are an experienced technical interviewer conducting a software engineering interview. Ask questions about algorithms, data structures, system design, coding best practices, and problem-solving. Start with behavioral questions, then move to technical questions. Be professional but encouraging. Ask follow-up questions based on the candidate's responses.`,
  
  product_manager: `You are a senior product manager interviewing candidates for a PM role. Ask about product strategy, prioritization, stakeholder management, metrics, and product sense. Use real-world scenarios. Be analytical and dig deeper into their thought process.`,
  
  retail_associate: `You are a retail store manager conducting an interview for a retail associate position. Ask about customer service experience, handling difficult customers, sales techniques, teamwork, and reliability. Be friendly and practical.`,
  
  customer_service: `You are a customer service manager interviewing for a customer service representative role. Focus on communication skills, problem-solving, empathy, conflict resolution, and handling upset customers. Be supportive and scenario-based.`,
  
  sales: `You are a sales director interviewing for a sales position. Ask about sales experience, handling objections, closing techniques, pipeline management, and achieving targets. Be direct and results-oriented.`,
  
  healthcare: `You are a healthcare administrator interviewing for a healthcare position. Ask about patient care, medical ethics, handling emergencies, teamwork in clinical settings, and maintaining professionalism under pressure. Be empathetic but thorough.`,
  
  teaching: `You are a school principal interviewing for a teaching position. Ask about classroom management, lesson planning, student engagement, handling diverse learners, and educational philosophy. Be thoughtful and focused on student outcomes.`,
};

export async function getInterviewerResponse(context: InterviewContext): Promise<string> {
  const systemPrompt = rolePrompts[context.role] || rolePrompts.software_engineer;
  
  // Convert message history to Gemini format
  const conversationParts = context.messageHistory.map((msg) => {
    const role = msg.role === "assistant" ? "model" : "user";
    return {
      role,
      parts: [{ text: msg.content }],
    };
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
    },
    contents: conversationParts,
  });

  return response.text || "I apologize, but I need you to repeat that.";
}

export async function analyzeFeedback(userResponse: string, question: string, role: string): Promise<{
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  overallScore: number;
}> {
  const prompt = `As an expert interview coach, analyze this interview response:

Question: ${question}
Role: ${role.replace(/_/g, " ")}
Candidate's Response: ${userResponse}

Provide constructive feedback in JSON format with:
- strengths: array of 2-3 specific strengths
- improvements: array of 2-3 areas for improvement
- suggestions: array of 2-3 actionable suggestions
- overallScore: rating from 1-5

Focus on communication clarity, relevance, depth of answer, and role-specific competencies.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert interview coach providing constructive feedback. Always respond with valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" },
            },
            improvements: {
              type: "array",
              items: { type: "string" },
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
            overallScore: { type: "number" },
          },
          required: ["strengths", "improvements", "suggestions", "overallScore"],
        },
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");

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
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
    },
    contents: "Start the interview with a warm greeting and your first question.",
  });

  return response.text || "Welcome! Let's begin with: Tell me about yourself and why you're interested in this role.";
}
