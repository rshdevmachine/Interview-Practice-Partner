import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...context.messageHistory,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    max_completion_tokens: 500,
  });

  return response.choices[0].message.content || "I apologize, but I need you to repeat that.";
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
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach providing constructive feedback. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

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
  
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Start the interview with a warm greeting and your first question." },
    ],
    max_completion_tokens: 300,
  });

  return response.choices[0].message.content || "Welcome! Let's begin with: Tell me about yourself and why you're interested in this role.";
}
