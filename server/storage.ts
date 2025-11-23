import { 
  type Session, 
  type InsertSession,
  type Message,
  type InsertMessage,
  type Feedback,
  type InsertFeedback,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  updateSessionStatus(id: string, status: string): Promise<void>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getSessionMessages(sessionId: string): Promise<Message[]>;
  getLastUserMessage(sessionId: string): Promise<Message | undefined>;

  // Feedback (per message + final summary)
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getSessionFeedback(sessionId: string): Promise<Feedback[]>;
}

/**
 * In-memory storage for sessions, messages, and feedback.
 * This now supports:
 *  ✔ per-message feedback
 *  ✔ final session-level feedback (messageId = null)
 */
export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private messages: Map<string, Message>;
  private feedback: Map<string, Feedback>;

  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.feedback = new Map();
  }

  // ------------------------------------
  // SESSION OPERATIONS
  // ------------------------------------

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
      completedAt: null,
      status: "active",
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateSessionStatus(id: string, status: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      if (status === "completed") {
        session.completedAt = new Date();
      }
      this.sessions.set(id, session);
    }
  }

  // ------------------------------------
  // MESSAGE OPERATIONS
  // ------------------------------------

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getLastUserMessage(sessionId: string): Promise<Message | undefined> {
    const messages = await this.getSessionMessages(sessionId);
    return messages.filter((msg) => msg.role === "user").pop();
  }

  // ------------------------------------
  // FEEDBACK OPERATIONS
  // ------------------------------------

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();

    // Here we support final feedback (messageId = null)
    const feedbackItem: Feedback = {
  id,
  sessionId: insertFeedback.sessionId,
  messageId: insertFeedback.messageId,
  strengths: insertFeedback.strengths ?? null,
  improvements: insertFeedback.improvements ?? null,
  suggestions: insertFeedback.suggestions ?? null,
  overallScore: insertFeedback.overallScore ?? null,
  createdAt: new Date(),
};


    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }

  async getSessionFeedback(sessionId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .filter((fb) => fb.sessionId === sessionId)
      // Sort: per-message feedback first, final feedback last
      .sort((a, b) => {
        // Final feedback where messageId == null should come LAST
        const aFinal = a.messageId === null;
        const bFinal = b.messageId === null;

        if (aFinal && !bFinal) return 1;
        if (!aFinal && bFinal) return -1;

        // Otherwise sort by created time
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }
}

export const storage = new MemStorage();
