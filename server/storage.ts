import {
  users,
  sessions,
  files,
  tasks,
  chatMessages,
  systemLogs,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type File,
  type InsertFile,
  type ChatMessage,
  type InsertChatMessage,
  type SystemLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  createSession(userId: number, data: any): Promise<string>;
  getSession(sessionId: string): Promise<any>;
  updateSession(sessionId: string, data: any): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // File operations
  createFile(file: InsertFile & { userId: number }): Promise<File>;
  getFilesByUser(userId: number): Promise<File[]>;
  getFile(id: number, userId: number): Promise<File | undefined>;
  deleteFile(id: number, userId: number): Promise<void>;
  
  // Task operations
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  getTasksByUser(userId: number): Promise<Task[]>;
  updateTask(id: number, userId: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<void>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage & { userId: number }): Promise<ChatMessage>;
  getChatHistory(userId: number, limit?: number): Promise<ChatMessage[]>;
  
  // System logs
  createLog(level: string, message: string, userId?: number, metadata?: any): Promise<void>;
  getLogs(userId?: number, limit?: number): Promise<SystemLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createSession(userId: number, data: any): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(sessions).values({
      id: sessionId,
      userId,
      data,
    });
    return sessionId;
  }

  async getSession(sessionId: string): Promise<any> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    return session?.data;
  }

  async updateSession(sessionId: string, data: any): Promise<void> {
    await db.update(sessions)
      .set({ data, updatedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async createFile(file: InsertFile & { userId: number }): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFilesByUser(userId: number): Promise<File[]> {
    return await db.select().from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt));
  }

  async getFile(id: number, userId: number): Promise<File | undefined> {
    const [file] = await db.select().from(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return file;
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    await db.delete(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
  }

  async createTask(task: InsertTask & { userId: number }): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: number, userId: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    await db.delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async createChatMessage(message: InsertChatMessage & { userId: number }): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createLog(level: string, message: string, userId?: number, metadata?: any): Promise<void> {
    await db.insert(systemLogs).values({
      level,
      message,
      userId,
      metadata,
    });
  }

  async getLogs(userId?: number, limit: number = 100): Promise<SystemLog[]> {
    let query = db.select().from(systemLogs);
    
    if (userId) {
      query = query.where(eq(systemLogs.userId, userId));
    }
    
    return await query.orderBy(desc(systemLogs.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
