import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { analyzeData, chatWithAssistant, analyzeWebsiteContent } from "./openai";
import { insertUserSchema, insertTaskSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      await storage.createLog('info', 'User registered', user.id);
      
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      await storage.createLog('info', 'User logged in', user.id);
      
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    res.json({ 
      id: req.user.id, 
      username: req.user.username, 
      email: req.user.email 
    });
  });

  // File upload and processing
  app.post('/api/files/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const file = await storage.createFile({
        userId: req.user.id,
        filename: `${Date.now()}_${req.file.originalname}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        content: req.file.buffer.toString('utf-8'),
        metadata: { uploadedAt: new Date().toISOString() }
      });

      await storage.createLog('info', `File uploaded: ${req.file.originalname}`, req.user.id);

      res.json(file);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'File upload failed' });
    }
  });

  app.get('/api/files', authenticateToken, async (req: any, res) => {
    try {
      const files = await storage.getFilesByUser(req.user.id);
      res.json(files);
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ message: 'Failed to get files' });
    }
  });

  app.get('/api/files/:id', authenticateToken, async (req: any, res) => {
    try {
      const file = await storage.getFile(parseInt(req.params.id), req.user.id);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.json(file);
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ message: 'Failed to get file' });
    }
  });

  app.delete('/api/files/:id', authenticateToken, async (req: any, res) => {
    try {
      await storage.deleteFile(parseInt(req.params.id), req.user.id);
      await storage.createLog('info', `File deleted: ${req.params.id}`, req.user.id);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  // AI Chat routes
  app.post('/api/chat', authenticateToken, async (req: any, res) => {
    try {
      const { message, context } = insertChatMessageSchema.extend({
        context: z.any().optional()
      }).parse(req.body);

      // Get recent chat history for context
      const chatHistory = await storage.getChatHistory(req.user.id, 5);
      
      const response = await chatWithAssistant(
        message, 
        context, 
        chatHistory.map(chat => ({ message: chat.message, response: chat.response }))
      );

      // Save chat message
      await storage.createChatMessage({
        userId: req.user.id,
        message,
        response: response.message,
        context: response.context
      });

      await storage.createLog('info', 'AI chat interaction', req.user.id);

      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: 'Chat failed' });
    }
  });

  app.get('/api/chat/history', authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getChatHistory(req.user.id, limit);
      res.json(history);
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ message: 'Failed to get chat history' });
    }
  });

  // Data analysis routes
  app.post('/api/analyze', authenticateToken, async (req: any, res) => {
    try {
      const { data, query } = req.body;
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ message: 'Data must be an array' });
      }

      const analysis = await analyzeData(data, query || 'Analyze this data');
      
      await storage.createLog('info', 'Data analysis performed', req.user.id);
      
      res.json(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ message: 'Data analysis failed' });
    }
  });

  // URL fetching routes
  app.post('/api/fetch-url', authenticateToken, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        return res.status(400).json({ message: 'Invalid URL' });
      }

      const response = await fetch(url);
      const content = await response.text();
      
      const analysis = await analyzeWebsiteContent(content, url);
      
      await storage.createLog('info', `URL fetched: ${url}`, req.user.id);
      
      res.json({ 
        url, 
        content: content.slice(0, 2000), 
        analysis,
        fullContent: content
      });
    } catch (error) {
      console.error('URL fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch URL' });
    }
  });

  // Task management routes
  app.post('/api/tasks', authenticateToken, async (req: any, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...taskData,
        userId: req.user.id
      });
      
      await storage.createLog('info', `Task created: ${task.title}`, req.user.id);
      
      res.json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.get('/api/tasks', authenticateToken, async (req: any, res) => {
    try {
      const tasks = await storage.getTasksByUser(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ message: 'Failed to get tasks' });
    }
  });

  app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      const task = await storage.updateTask(parseInt(req.params.id), req.user.id, updates);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      await storage.createLog('info', `Task updated: ${task.title}`, req.user.id);
      
      res.json(task);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    try {
      await storage.deleteTask(parseInt(req.params.id), req.user.id);
      await storage.createLog('info', `Task deleted: ${req.params.id}`, req.user.id);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // System logs
  app.get('/api/logs', authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getLogs(req.user.id, limit);
      res.json(logs);
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ message: 'Failed to get logs' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
