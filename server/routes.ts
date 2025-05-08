import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertCustomerSchema,
  insertJobSchema,
  insertPhotoSchema,
  insertNoteSchema,
  insertMaterialSchema,
  insertEstimateItemSchema,
  insertEstimateSchema
} from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI - this will use the OPENAI_API_KEY environment variable
// If unavailable in development, use a default key that indicates it's missing
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-missing-key-set-environment-variable",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = app.use("/api", (req, res, next) => {
    next();
  });

  // Users
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Don't send the password back
    const { password, ...userData } = user;
    res.json(userData);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      // Don't send the password back
      const { password, ...userData2 } = user;
      res.status(201).json(userData2);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send the password back
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customers
  app.get("/api/customers", async (_req: Request, res: Response) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  });

  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Jobs
  app.get("/api/jobs", async (_req: Request, res: Response) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const job = await storage.getJob(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  });

  app.get("/api/technicians/:techId/jobs", async (req: Request, res: Response) => {
    const techId = parseInt(req.params.techId);
    const jobs = await storage.getJobsByTechnician(techId);
    res.json(jobs);
  });

  app.post("/api/jobs", async (req: Request, res: Response) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/jobs/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({
        status: z.string()
      }).parse(req.body);
      
      const job = await storage.updateJobStatus(id, status);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Photos
  app.get("/api/jobs/:jobId/photos", async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const photos = await storage.getPhotosByJob(jobId);
    res.json(photos);
  });

  app.post("/api/photos", async (req: Request, res: Response) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Image Analysis
  app.post("/api/photos/:id/analyze", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      try {
        // If OpenAI key is missing, provide mock analysis
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("missing")) {
          const mockAnalysis = {
            identified: "Light switch",
            condition: "Broken",
            recommendations: "Replace with dimmer switch",
            parts: ["Dimmer switch", "Wall plate", "Wiring connector"]
          };
          
          const updatedPhoto = await storage.updatePhotoAnalysis(id, mockAnalysis);
          return res.json(updatedPhoto);
        }

        // Extract base64 content from the data URL
        const base64Image = photo.dataUrl.split(',')[1];
        
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a plumbing and electrical expert. Analyze the provided image and identify any plumbing or electrical fixtures, their condition, and make recommendations for repair or replacement. Return your response as JSON with the following fields: identified (string), condition (string), recommendations (string), parts (array of strings)."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image of a plumbing or electrical fixture. Identify what it is, its condition, and recommend solutions."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
        });

        const analysis = JSON.parse(visionResponse.choices[0].message.content);
        const updatedPhoto = await storage.updatePhotoAnalysis(id, analysis);
        
        res.json(updatedPhoto);
      } catch (error) {
        // If OpenAI analysis fails, provide a graceful fallback
        console.error("AI analysis error:", error);
        
        const fallbackAnalysis = {
          identified: "Unknown fixture",
          condition: "Requires inspection",
          recommendations: "Please have a technician evaluate this item",
          parts: []
        };
        
        const updatedPhoto = await storage.updatePhotoAnalysis(id, fallbackAnalysis);
        res.json(updatedPhoto);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Notes
  app.get("/api/jobs/:jobId/notes", async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const notes = await storage.getNotesByJob(jobId);
    res.json(notes);
  });

  app.post("/api/notes", async (req: Request, res: Response) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Text Enhancement
  app.post("/api/notes/:id/enhance", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      try {
        // If OpenAI key is missing, provide mock enhancement
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("missing")) {
          const originalContent = note.content;
          const mockEnhanced = `Upon inspection, I discovered that ${originalContent.toLowerCase()} This appears to be caused by normal wear and tear. I recommend a complete replacement of the affected components to ensure proper functioning and prevent future issues.`;
          
          const updatedNote = await storage.updateNoteEnhancement(id, mockEnhanced);
          return res.json(updatedNote);
        }
        
        const enhancementResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a professional technical writer specializing in plumbing and electrical service reports. Your task is to take a technician's rough notes and transform them into a professional, technically precise report that would be appropriate for a customer. Maintain all the factual information but improve grammar, vocabulary, completeness, and professionalism."
            },
            {
              role: "user",
              content: `Please enhance this technician note to make it more professional: "${note.content}"`
            },
          ],
          max_tokens: 500,
        });

        const enhancedContent = enhancementResponse.choices[0].message.content;
        const updatedNote = await storage.updateNoteEnhancement(id, enhancedContent);
        
        res.json(updatedNote);
      } catch (error) {
        // If OpenAI enhancement fails, provide a graceful fallback
        console.error("AI enhancement error:", error);
        const updatedNote = await storage.updateNoteEnhancement(id, note.content);
        res.json(updatedNote);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Materials
  app.get("/api/materials", async (_req: Request, res: Response) => {
    const materials = await storage.getMaterials();
    res.json(materials);
  });

  app.post("/api/materials", async (req: Request, res: Response) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Estimate Items
  app.get("/api/jobs/:jobId/estimate-items", async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const items = await storage.getEstimateItemsByJob(jobId);
    res.json(items);
  });

  app.post("/api/estimate-items", async (req: Request, res: Response) => {
    try {
      const itemData = insertEstimateItemSchema.parse(req.body);
      const item = await storage.createEstimateItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Estimates
  app.get("/api/jobs/:jobId/estimate", async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const estimate = await storage.getEstimateByJob(jobId);
    
    if (!estimate) {
      return res.status(404).json({ message: "Estimate not found" });
    }
    
    res.json(estimate);
  });

  app.post("/api/estimates", async (req: Request, res: Response) => {
    try {
      const estimateData = insertEstimateSchema.parse(req.body);
      const estimate = await storage.createEstimate(estimateData);
      res.status(201).json(estimate);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/estimates/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({
        status: z.string()
      }).parse(req.body);
      
      const estimate = await storage.updateEstimateStatus(id, status);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Parts store search (mock API for development)
  app.get("/api/stores/search", async (req: Request, res: Response) => {
    try {
      const { query, lat, lng } = z.object({
        query: z.string(),
        lat: z.string().optional(),
        lng: z.string().optional()
      }).parse(req.query);
      
      // For development/testing, return mock store data
      const stores = [
        {
          id: 1,
          name: "Home Depot",
          distance: "2.3 miles",
          address: "123 Construction Ave",
          parts: [
            {
              id: 101,
              name: query,
              price: Math.floor(Math.random() * 5000 + 1000), // Random price between $10-$60
              inStock: true,
              image: "https://example.com/part1.jpg"
            }
          ]
        },
        {
          id: 2,
          name: "Lowe's",
          distance: "3.8 miles",
          address: "456 Hardware Blvd",
          parts: [
            {
              id: 201,
              name: query,
              price: Math.floor(Math.random() * 5000 + 1000),
              inStock: true,
              image: "https://example.com/part2.jpg"
            }
          ]
        },
        {
          id: 3,
          name: "Ace Hardware",
          distance: "1.5 miles",
          address: "789 Tool Street",
          parts: [
            {
              id: 301,
              name: query,
              price: Math.floor(Math.random() * 5000 + 1000),
              inStock: Math.random() > 0.3, // 70% chance of being in stock
              image: "https://example.com/part3.jpg"
            }
          ]
        }
      ];
      
      res.json(stores);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
