import {
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  jobs, type Job, type InsertJob,
  photos, type Photo, type InsertPhoto,
  notes, type Note, type InsertNote,
  materials, type Material, type InsertMaterial,
  estimateItems, type EstimateItem, type InsertEstimateItem,
  estimates, type Estimate, type InsertEstimate
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(): Promise<Job[]>;
  getJobsByTechnician(technicianId: number): Promise<Job[]>;
  getJobsByCustomer(customerId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJobStatus(id: number, status: string): Promise<Job | undefined>;
  
  // Photo operations
  getPhoto(id: number): Promise<Photo | undefined>;
  getPhotosByJob(jobId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhotoAnalysis(id: number, analysis: any): Promise<Photo | undefined>;
  
  // Note operations
  getNote(id: number): Promise<Note | undefined>;
  getNotesByJob(jobId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNoteEnhancement(id: number, enhancedContent: string): Promise<Note | undefined>;
  
  // Material operations
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Estimate Item operations
  getEstimateItem(id: number): Promise<EstimateItem | undefined>;
  getEstimateItemsByJob(jobId: number): Promise<EstimateItem[]>;
  createEstimateItem(item: InsertEstimateItem): Promise<EstimateItem>;
  
  // Estimate operations
  getEstimate(id: number): Promise<Estimate | undefined>;
  getEstimateByJob(jobId: number): Promise<Estimate | undefined>;
  createEstimate(estimate: InsertEstimate): Promise<Estimate>;
  updateEstimateStatus(id: number, status: string): Promise<Estimate | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private jobs: Map<number, Job>;
  private photos: Map<number, Photo>;
  private notes: Map<number, Note>;
  private materials: Map<number, Material>;
  private estimateItems: Map<number, EstimateItem>;
  private estimates: Map<number, Estimate>;
  
  private userId: number;
  private customerId: number;
  private jobId: number;
  private photoId: number;
  private noteId: number;
  private materialId: number;
  private estimateItemId: number;
  private estimateId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.jobs = new Map();
    this.photos = new Map();
    this.notes = new Map();
    this.materials = new Map();
    this.estimateItems = new Map();
    this.estimates = new Map();
    
    this.userId = 1;
    this.customerId = 1;
    this.jobId = 1;
    this.photoId = 1;
    this.noteId = 1;
    this.materialId = 1;
    this.estimateItemId = 1;
    this.estimateId = 1;
    
    // Add some initial sample data for easier testing
    this.initializeData();
  }
  
  private initializeData(): void {
    // Create a default technician
    const defaultTech: InsertUser = {
      username: "tech1",
      password: "password123",
      name: "John Smith",
      email: "john@example.com",
      phone: "555-123-4567"
    };
    this.createUser(defaultTech);
    
    // Create a default customer
    const defaultCustomer: InsertCustomer = {
      name: "Grande Deluxe",
      email: "info@grandedeluxe.com",
      phone: "614-555-1234",
      address: "123 Main St",
      city: "Columbus",
      state: "OH",
      zip: "43231"
    };
    this.createCustomer(defaultCustomer);
    
    // Create some default materials
    const materials: InsertMaterial[] = [
      {
        name: "Copper wiring",
        description: "10 ft copper wiring for electrical connections",
        category: "Electrical",
        defaultPrice: 1250, // $12.50
        unit: "each"
      },
      {
        name: "Light switch",
        description: "Standard wall light switch",
        category: "Electrical",
        defaultPrice: 850, // $8.50
        unit: "each"
      }
    ];
    
    materials.forEach(m => this.createMaterial(m));
    
    // Create a default job
    const defaultJob: InsertJob = {
      workOrderNumber: "252578",
      customerId: 1,
      technicianId: 1,
      status: "in_progress",
      description: "Replace light switch with dimmer switch",
      scheduled: new Date(),
      timeZone: "US/Eastern"
    };
    this.createJob(defaultJob);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Customer operations
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }
  
  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }
  
  async getJobsByTechnician(technicianId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      job => job.technicianId === technicianId
    );
  }
  
  async getJobsByCustomer(customerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      job => job.customerId === customerId
    );
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobId++;
    const created = new Date();
    const job: Job = { ...insertJob, id, created };
    this.jobs.set(id, job);
    return job;
  }
  
  async updateJobStatus(id: number, status: string): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: Job = { ...job, status };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  
  // Photo operations
  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }
  
  async getPhotosByJob(jobId: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(
      photo => photo.jobId === jobId
    );
  }
  
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoId++;
    const timestamp = new Date();
    const photo: Photo = { ...insertPhoto, id, timestamp, aiAnalysis: null };
    this.photos.set(id, photo);
    return photo;
  }
  
  async updatePhotoAnalysis(id: number, analysis: any): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto: Photo = { ...photo, aiAnalysis: analysis };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }
  
  // Note operations
  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async getNotesByJob(jobId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      note => note.jobId === jobId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const timestamp = new Date();
    const note: Note = { ...insertNote, id, timestamp, enhancedContent: null };
    this.notes.set(id, note);
    return note;
  }
  
  async updateNoteEnhancement(id: number, enhancedContent: string): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote: Note = { ...note, enhancedContent };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }
  
  async getMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values());
  }
  
  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.materialId++;
    const material: Material = { ...insertMaterial, id };
    this.materials.set(id, material);
    return material;
  }
  
  // Estimate Item operations
  async getEstimateItem(id: number): Promise<EstimateItem | undefined> {
    return this.estimateItems.get(id);
  }
  
  async getEstimateItemsByJob(jobId: number): Promise<EstimateItem[]> {
    return Array.from(this.estimateItems.values()).filter(
      item => item.jobId === jobId
    );
  }
  
  async createEstimateItem(insertItem: InsertEstimateItem): Promise<EstimateItem> {
    const id = this.estimateItemId++;
    const item: EstimateItem = { ...insertItem, id };
    this.estimateItems.set(id, item);
    return item;
  }
  
  // Estimate operations
  async getEstimate(id: number): Promise<Estimate | undefined> {
    return this.estimates.get(id);
  }
  
  async getEstimateByJob(jobId: number): Promise<Estimate | undefined> {
    return Array.from(this.estimates.values()).find(
      estimate => estimate.jobId === jobId
    );
  }
  
  async createEstimate(insertEstimate: InsertEstimate): Promise<Estimate> {
    const id = this.estimateId++;
    const created = new Date();
    const estimate: Estimate = { ...insertEstimate, id, created };
    this.estimates.set(id, estimate);
    return estimate;
  }
  
  async updateEstimateStatus(id: number, status: string): Promise<Estimate | undefined> {
    const estimate = this.estimates.get(id);
    if (!estimate) return undefined;
    
    const updatedEstimate: Estimate = { ...estimate, status };
    this.estimates.set(id, updatedEstimate);
    return updatedEstimate;
  }
}

export const storage = new MemStorage();
