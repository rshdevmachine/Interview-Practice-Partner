import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema } from "@shared/schema";
import { generateInitialQuestion, getInterviewerResponse, analyzeFeedback, generateFinalFeedback } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {

  // ------------------------------------------
  // GET ALL SESSIONS
  // ------------------------------------------
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // ------------------------------------------
  // GET SINGLE SESSION
  // ------------------------------------------
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // ------------------------------------------
  // CREATE SESSION + AI INITIAL QUESTION
  // ------------------------------------------
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);

      const session = await storage.createSession(validatedData);

      const initialQuestion = await generateInitialQuestion(validatedData.role);
      await storage.createMessage({
        sessionId: session.id,
        role: "ai",
        content: initialQuestion,
      });

      res.json(session);
    } catch (error) {
      console.error("Failed to create session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // ------------------------------------------
  // END SESSION + GENERATE FINAL FEEDBACK (NEW)
  // ------------------------------------------
  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // 1) Mark completed
      await storage.updateSessionStatus(sessionId, "completed");

      // 2) Get full conversation history
      const messages = await storage.getSessionMessages(sessionId);

     const modelHistory = messages.map((m) => ({
  role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user",
  content: m.content,
}));


      // 3) Generate final feedback (NEW PART)
      const finalFeedback = await generateFinalFeedback(modelHistory, session.role);

      // 4) Store final feedback with messageId = null (session-level feedback)
      await storage.createFeedback({
        sessionId,
        messageId: "",
        strengths: finalFeedback.strengths,
        improvements: finalFeedback.improvements,
        suggestions: finalFeedback.suggestions,
        overallScore: finalFeedback.overallScore,
      });

      // 5) Return feedback
      res.json({ success: true, feedback: finalFeedback });

    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // ------------------------------------------
  // GET MESSAGES
  // ------------------------------------------
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getSessionMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ------------------------------------------
  // SEND MESSAGE → AI RESPONSE → INLINE FEEDBACK
  // ------------------------------------------
  app.post("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.status !== "active") {
        return res.status(400).json({ error: "Session is not active" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        sessionId: req.params.sessionId,
        role: "user",
        content: req.body.content,
      });

      // Build conversation for model
      const messages = await storage.getSessionMessages(req.params.sessionId);
      const messageHistory = messages.map((msg) => ({
  role: (msg.role === "ai" ? "assistant" : "user") as "assistant" | "user",
  content: msg.content,
}));


      // AI response
      const aiResponse = await getInterviewerResponse({
        role: session.role,
        messageHistory,
      });

      // Save AI message
      const aiMessage = await storage.createMessage({
        sessionId: req.params.sessionId,
        role: "ai",
        content: aiResponse,
      });

      // Inline feedback every 2 user messages
      const userMessageCount = messages.filter((m) => m.role === "user").length;
      if (userMessageCount % 2 === 0) {
        const lastAiQuestion =
          messages.filter((m) => m.role === "ai").slice(-2)[0]?.content || "";

        const feedback = await analyzeFeedback(req.body.content, lastAiQuestion, session.role);

        await storage.createFeedback({
          sessionId: req.params.sessionId,
          messageId: userMessage.id,
          strengths: feedback.strengths,
          improvements: feedback.improvements,
          suggestions: feedback.suggestions,
          overallScore: feedback.overallScore,
        });
      }

      res.json({ userMessage, aiMessage });

    } catch (error) {
      console.error("Failed to process message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // ------------------------------------------
  // GET ALL FEEDBACK (INLINE + FINAL SUMMARY)
  // ------------------------------------------
  app.get("/api/sessions/:id/feedback", async (req, res) => {
    try {
      const feedback = await storage.getSessionFeedback(req.params.id);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // ------------------------------------------
  // RETURN HTTP SERVER
  // ------------------------------------------
  const httpServer = createServer(app);
  return httpServer;
}
