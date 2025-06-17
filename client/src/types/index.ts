export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileData {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  content?: string;
  metadata?: any;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  message: string;
  response: string;
  context?: any;
  createdAt: string;
}

export interface DataAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  trends: string[];
}

export interface SystemLog {
  id: number;
  level: string;
  message: string;
  metadata?: any;
  createdAt: string;
}

export interface SessionMemory {
  uploadedFiles: FileData[];
  fetchedURLs: string[];
  chatHistory: ChatMessage[];
  logs: SystemLog[];
  tasks: Task[];
}
