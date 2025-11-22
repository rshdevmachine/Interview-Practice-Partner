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

  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getSessionFeedback(sessionId: string): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private messages: Map<string, Message>;
  private feedback: Map<string, Feedback>;

  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.feedback = new Map();
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackItem: Feedback = {
      ...insertFeedback,
      id,
      createdAt: new Date(),
    };
    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }

  async getSessionFeedback(sessionId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .filter((fb) => fb.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

export const storage = new MemStorage();
