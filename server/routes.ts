import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertMessageSchema } from "@shared/schema";
import { generateInitialQuestion, getInterviewerResponse, analyzeFeedback } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all sessions
  app.get("/api/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get single session
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

  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);

      // Generate initial question from AI
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

  // End session
  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      await storage.updateSessionStatus(req.params.id, "completed");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  // Get session messages
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getSessionMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
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

      // Get conversation history
      const messages = await storage.getSessionMessages(req.params.sessionId);
      const messageHistory = messages.map((msg) => ({
        role: msg.role === "ai" ? "assistant" as const : "user" as const,
        content: msg.content,
      }));

      // Get AI response
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

      // Generate feedback for user's response (every 2-3 exchanges)
      const userMessageCount = messages.filter((m) => m.role === "user").length;
      if (userMessageCount % 2 === 0) {
        const lastAiQuestion = messages
          .filter((m) => m.role === "ai")
          .slice(-2)[0]?.content || "";

        const feedback = await analyzeFeedback(
          req.body.content,
          lastAiQuestion,
          session.role
        );

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

  // Get session feedback
  app.get("/api/sessions/:id/feedback", async (req, res) => {
    try {
      const feedback = await storage.getSessionFeedback(req.params.id);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
