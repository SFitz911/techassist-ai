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
    
    // Create customers
    const customers: InsertCustomer[] = [
      {
        name: "Grande Deluxe",
        email: "info@grandedeluxe.com",
        phone: "614-555-1234",
        address: "123 Main St",
        city: "Columbus",
        state: "OH",
        zip: "43231"
      },
      {
        name: "Sunset Apartments",
        email: "manager@sunsetapts.com",
        phone: "614-555-8765",
        address: "987 Sunset Blvd",
        city: "Columbus",
        state: "OH",
        zip: "43220"
      },
      {
        name: "Riverfront Hotel",
        email: "maintenance@riverfronthotel.com",
        phone: "614-555-3456",
        address: "456 River Dr",
        city: "Columbus",
        state: "OH",
        zip: "43215"
      },
      {
        name: "Green Valley School",
        email: "facilities@greenvalley.edu",
        phone: "614-555-7890",
        address: "2100 Education Way",
        city: "Columbus",
        state: "OH",
        zip: "43210"
      },
      {
        name: "Meadowbrook Hospital",
        email: "engineering@meadowbrook.org",
        phone: "614-555-9876",
        address: "5678 Health Pkwy",
        city: "Columbus",
        state: "OH",
        zip: "43219"
      },
      {
        name: "Eastview Mall",
        email: "operations@eastviewmall.com",
        phone: "614-555-6543",
        address: "800 Shopping Center Rd",
        city: "Columbus",
        state: "OH",
        zip: "43230"
      }
    ];
    
    customers.forEach(customer => this.createCustomer(customer));
    
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
    
    // Create jobs
    const jobs: InsertJob[] = [
      {
        workOrderNumber: "252578",
        customerId: 1,
        technicianId: 1,
        status: "in_progress",
        description: "Replace light switch with dimmer switch",
        scheduled: new Date(),
        timeZone: "US/Eastern"
      },
      {
        workOrderNumber: "252579",
        customerId: 2,
        technicianId: 1,
        status: "scheduled",
        description: "Water leak from ceiling in unit 302, possible plumbing issue from unit above",
        scheduled: new Date(Date.now() + 86400000), // Tomorrow
        timeZone: "US/Eastern"
      },
      {
        workOrderNumber: "252580",
        customerId: 3,
        technicianId: 1,
        status: "scheduled",
        description: "HVAC system making loud noise in lobby area, needs immediate attention",
        scheduled: new Date(Date.now() + 2 * 86400000), // Day after tomorrow
        timeZone: "US/Eastern"
      },
      {
        workOrderNumber: "252581",
        customerId: 4,
        technicianId: 1,
        status: "in_progress",
        description: "Bathroom sink clogged in main administration building",
        scheduled: new Date(Date.now() - 86400000), // Yesterday
        timeZone: "US/Eastern"
      },
      {
        workOrderNumber: "252582",
        customerId: 5,
        technicianId: 1,
        status: "completed",
        description: "Replace emergency lighting in east wing corridor",
        scheduled: new Date(Date.now() - 3 * 86400000), // 3 days ago
        timeZone: "US/Eastern"
      },
      {
        workOrderNumber: "252583",
        customerId: 6,
        technicianId: 1,
        status: "scheduled",
        description: "Food court electrical outlets not working, affecting vendor operations",
        scheduled: new Date(Date.now() + 4 * 86400000), // 4 days from now
        timeZone: "US/Eastern"
      }
    ];
    
    jobs.forEach(job => this.createJob(job));
    
    // Create some sample notes for the jobs
    const notes = [
      {
        jobId: 1,
        content: "Initial inspection shows old light switch needs replacement with dimmer switch. Customer requested Lutron brand if available.",
      },
      {
        jobId: 2,
        content: "Resident reports water dripping from ceiling light fixture. Will need to inspect unit above to determine source of leak.",
      },
      {
        jobId: 3,
        content: "HVAC unit is making a loud rattling noise when running. Hotel manager says it started two days ago and is disturbing guests.",
      },
      {
        jobId: 4,
        content: "Sink is completely clogged and not draining at all. Attempted plunging with no success. Will need to remove trap.",
      },
      {
        jobId: 5,
        content: "Replaced all emergency lighting fixtures in the east wing. Tested all units and confirmed they're working properly on backup power.",
      },
      {
        jobId: 6,
        content: "Food court vendors report that several outlets are not working. Initial test shows no power to the north wall circuit.",
      }
    ];
    
    notes.forEach(note => this.createNote(note));
    
    // Create sample photos
    const photos = [
      {
        jobId: 1,
        caption: "Current light switch",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAXVBMVEX///8AAACsrKxlZWX29vb8/PxLS0uoqKjU1NR8fHzn5+ehoaHv7+9SUlLZ2dmWlpaxsbGAgIA4ODhzc3MPDw8pKSkdHR1dXV3IyMgxMTFCQkK5ublra2vCwsIWFhaOQdFGAAADq0lEQVR4nO1a25arIAwtKl6qVu3N2tra///L0d4SQDvHjq5yHvbDLBfEbEgCSWL8H4Fo9SyK1eteXhWRiV+Ecue9BjlIGTJIqQDJHrwqy4Le9jtQoVXPQFXC/QWyA61clYJd2RW0WrXbU2VR+OUqHzSyKDKXOItOvkCno33l0gWdrpX6g/LkQXSZwMSjkZQ+aVDXKFXtDnS4Vr4F8kCHAXpnQEWKL1AKs0Q1zCrQYiUXlM8W1LwfVfbmzMjkGTp0I1SuJXy5IPHcAQrDlxCjwJTkdZgvq2oGDO5g20U8QO7yFn2k0WDcVW4CsjNwN+lBe+PnLkH9AZzETdECu8DZ9IjJ8Mj1p46wYLgb9S0MveFGekbhGS58S6A+rO6mJ3Qs9DMNJ5i67mxnOMHZTnWCE9zMZHrGTh/4nIRUeO1C06PUzpGTADoAzwtwJaJM4Dh4K57YwJyF24f3QCfhKKxSP3n4QCBvQPyYAg7C6vA9wEH4VTMWcBQO5r6/QO4ZnuTCGwqmcDYXH+hCX9BfYXzGxwbNFFbGYBTYqJnqgbHVhc3xHUf/WwPwL2aDTdLiAuGdcPZ5TExh93KA/cN5UBB+fZU5Mb7gPMgIW3Fy/PVpMdoH0QnUBRj4SznYb7g4Jt8wFuBqXDJ6gntdY53w9hF+i2Aqmh4oTXgIX7dKGJsovYNbHPVxR6LnpyiXyQCeQzRe4IqzKLfgcQrWlrTRgotgYjgFO0vSaLxO8RI5BQeMUGNCF/Qnj18CNFdTQkjA31cIf6j3jQdU8FMdLnw9OfEBXvLihjP4iZa5hvXf+QawBhAPDqDaQDPXsAZKbuGjqd8TdtCz78U1dAF38Qm9mIIzXTjDr0UprB3IWgKrEG9WZGsJYpuQiRTERCxTKYoW8YJGmkQdRrwKUAOuWFZvUGMCWQdDmhglLAFUAXo3ZhVUzqw3JqBdkF+V8BLwJuybSq4A9lQlXCW+OfEqsMQP5UUDSHzAHKJIeWIzIxc0W4aO2qkLZ1lgHO5OgU3oQ0O/K3IKMHO2uP1XDtNOEBpNzCWj4aaO4Ro1m/QxDJUuM0eGnrZxqDMcLmkSxptwK0pNkTemuLtZdM8IzZfbplNVJU1Tx/ztJ9ZaHtqzVZeU7LPvj3Tp4Xc9YP3mDHZtwXX/bfOTdzXM8vStZ2m8rTN1j/ik3f5+h/gAh/jAK+4/SeMl2bsU2zgAAAAASUVORK5CYII=",
        beforePhoto: true
      },
      {
        jobId: 2,
        caption: "Water damage on ceiling",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAXVBMVEX///8AAACsrKxlZWX29vb8/PxLS0uoqKjU1NR8fHzn5+ehoaHv7+9SUlLZ2dmWlpaxsbGAgIA4ODhzc3MPDw8pKSkdHR1dXV3IyMgxMTFCQkK5ublra2vCwsIWFhaOQdFGAAADq0lEQVR4nO1a25arIAwtKl6qVu3N2tra///L0d4SQDvHjq5yHvbDLBfEbEgCSWL8H4Fo9SyK1eteXhWRiV+Ecue9BjlIGTJIqQDJHrwqy4Le9jtQoVXPQFXC/QWyA61clYJd2RW0WrXbU2VR+OUqHzSyKDKXOItOvkCno33l0gWdrpX6g/LkQXSZwMSjkZQ+aVDXKFXtDnS4Vr4F8kCHAXpnQEWKL1AKs0Q1zCrQYiUXlM8W1LwfVfbmzMjkGTp0I1SuJXy5IPHcAQrDlxCjwJTkdZgvq2oGDO5g20U8QO7yFn2k0WDcVW4CsjNwN+lBe+PnLkH9AZzETdECu8DZ9IjJ8Mj1p46wYLgb9S0MveFGekbhGS58S6A+rO6mJ3Qs9DMNJ5i67mxnOMHZTnWCE9zMZHrGTh/4nIRUeO1C06PUzpGTADoAzwtwJaJM4Dh4K57YwJyF24f3QCfhKKxSP3n4QCBvQPyYAg7C6vA9wEH4VTMWcBQO5r6/QO4ZnuTCGwqmcDYXH+hCX9BfYXzGxwbNFFbGYBTYqJnqgbHVhc3xHUf/WwPwL2aDTdLiAuGdcPZ5TExh93KA/cN5UBB+fZU5Mb7gPMgIW3Fy/PVpMdoH0QnUBRj4SznYb7g4Jt8wFuBqXDJ6gntdY53w9hF+i2Aqmh4oTXgIX7dKGJsovYNbHPVxR6LnpyiXyQCeQzRe4IqzKLfgcQrWlrTRgotgYjgFO0vSaLxO8RI5BQeMUGNCF/Qnj18CNFdTQkjA31cIf6j3jQdU8FMdLnw9OfEBXvLihjP4iZa5hvXf+QawBhAPDqDaQDPXsAZKbuGjqd8TdtCz78U1dAF38Qm9mIIzXTjDr0UprB3IWgKrEG9WZGsJYpuQiRTERCxTKYoW8YJGmkQdRrwKUAOuWFZvUGMCWQdDmhglLAFUAXo3ZhVUzqw3JqBdkF+V8BLwJuybSq4A9lQlXCW+OfEqsMQP5UUDSHzAHKJIeWIzIxc0W4aO2qkLZ1lgHO5OgU3oQ0O/K3IKMHO2uP1XDtNOEBpNzCWj4aaO4Ro1m/QxDJUuM0eGnrZxqDMcLmkSxptwK0pNkTemuLtZdM8IzZfbplNVJU1Tx/ztJ9ZaHtqzVZeU7LPvj3Tp4Xc9YP3mDHZtwXX/bfOTdzXM8vStZ2m8rTN1j/ik3f5+h/gAh/jAK+4/SeMl2bsU2zgAAAAASUVORK5CYII=",
        beforePhoto: true
      },
      {
        jobId: 3,
        caption: "HVAC unit in lobby",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAXVBMVEX///8AAACsrKxlZWX29vb8/PxLS0uoqKjU1NR8fHzn5+ehoaHv7+9SUlLZ2dmWlpaxsbGAgIA4ODhzc3MPDw8pKSkdHR1dXV3IyMgxMTFCQkK5ublra2vCwsIWFhaOQdFGAAADq0lEQVR4nO1a25arIAwtKl6qVu3N2tra///L0d4SQDvHjq5yHvbDLBfEbEgCSWL8H4Fo9SyK1eteXhWRiV+Ecue9BjlIGTJIqQDJHrwqy4Le9jtQoVXPQFXC/QWyA61clYJd2RW0WrXbU2VR+OUqHzSyKDKXOItOvkCno33l0gWdrpX6g/LkQXSZwMSjkZQ+aVDXKFXtDnS4Vr4F8kCHAXpnQEWKL1AKs0Q1zCrQYiUXlM8W1LwfVfbmzMjkGTp0I1SuJXy5IPHcAQrDlxCjwJTkdZgvq2oGDO5g20U8QO7yFn2k0WDcVW4CsjNwN+lBe+PnLkH9AZzETdECu8DZ9IjJ8Mj1p46wYLgb9S0MveFGekbhGS58S6A+rO6mJ3Qs9DMNJ5i67mxnOMHZTnWCE9zMZHrGTh/4nIRUeO1C06PUzpGTADoAzwtwJaJM4Dh4K57YwJyF24f3QCfhKKxSP3n4QCBvQPyYAg7C6vA9wEH4VTMWcBQO5r6/QO4ZnuTCGwqmcDYXH+hCX9BfYXzGxwbNFFbGYBTYqJnqgbHVhc3xHUf/WwPwL2aDTdLiAuGdcPZ5TExh93KA/cN5UBB+fZU5Mb7gPMgIW3Fy/PVpMdoH0QnUBRj4SznYb7g4Jt8wFuBqXDJ6gntdY53w9hF+i2Aqmh4oTXgIX7dKGJsovYNbHPVxR6LnpyiXyQCeQzRe4IqzKLfgcQrWlrTRgotgYjgFO0vSaLxO8RI5BQeMUGNCF/Qnj18CNFdTQkjA31cIf6j3jQdU8FMdLnw9OfEBXvLihjP4iZa5hvXf+QawBhAPDqDaQDPXsAZKbuGjqd8TdtCz78U1dAF38Qm9mIIzXTjDr0UprB3IWgKrEG9WZGsJYpuQiRTERCxTKYoW8YJGmkQdRrwKUAOuWFZvUGMCWQdDmhglLAFUAXo3ZhVUzqw3JqBdkF+V8BLwJuybSq4A9lQlXCW+OfEqsMQP5UUDSHzAHKJIeWIzIxc0W4aO2qkLZ1lgHO5OgU3oQ0O/K3IKMHO2uP1XDtNOEBpNzCWj4aaO4Ro1m/QxDJUuM0eGnrZxqDMcLmkSxptwK0pNkTemuLtZdM8IzZfbplNVJU1Tx/ztJ9ZaHtqzVZeU7LPvj3Tp4Xc9YP3mDHZtwXX/bfOTdzXM8vStZ2m8rTN1j/ik3f5+h/gAh/jAK+4/SeMl2bsU2zgAAAAASUVORK5CYII=",
        beforePhoto: true
      },
      {
        jobId: 4,
        caption: "Clogged sink",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAXVBMVEX///8AAACsrKxlZWX29vb8/PxLS0uoqKjU1NR8fHzn5+ehoaHv7+9SUlLZ2dmWlpaxsbGAgIA4ODhzc3MPDw8pKSkdHR1dXV3IyMgxMTFCQkK5ublra2vCwsIWFhaOQdFGAAADq0lEQVR4nO1a25arIAwtKl6qVu3N2tra///L0d4SQDvHjq5yHvbDLBfEbEgCSWL8H4Fo9SyK1eteXhWRiV+Ecue9BjlIGTJIqQDJHrwqy4Le9jtQoVXPQFXC/QWyA61clYJd2RW0WrXbU2VR+OUqHzSyKDKXOItOvkCno33l0gWdrpX6g/LkQXSZwMSjkZQ+aVDXKFXtDnS4Vr4F8kCHAXpnQEWKL1AKs0Q1zCrQYiUXlM8W1LwfVfbmzMjkGTp0I1SuJXy5IPHcAQrDlxCjwJTkdZgvq2oGDO5g20U8QO7yFn2k0WDcVW4CsjNwN+lBe+PnLkH9AZzETdECu8DZ9IjJ8Mj1p46wYLgb9S0MveFGekbhGS58S6A+rO6mJ3Qs9DMNJ5i67mxnOMHZTnWCE9zMZHrGTh/4nIRUeO1C06PUzpGTADoAzwtwJaJM4Dh4K57YwJyF24f3QCfhKKxSP3n4QCBvQPyYAg7C6vA9wEH4VTMWcBQO5r6/QO4ZnuTCGwqmcDYXH+hCX9BfYXzGxwbNFFbGYBTYqJnqgbHVhc3xHUf/WwPwL2aDTdLiAuGdcPZ5TExh93KA/cN5UBB+fZU5Mb7gPMgIW3Fy/PVpMdoH0QnUBRj4SznYb7g4Jt8wFuBqXDJ6gntdY53w9hF+i2Aqmh4oTXgIX7dKGJsovYNbHPVxR6LnpyiXyQCeQzRe4IqzKLfgcQrWlrTRgotgYjgFO0vSaLxO8RI5BQeMUGNCF/Qnj18CNFdTQkjA31cIf6j3jQdU8FMdLnw9OfEBXvLihjP4iZa5hvXf+QawBhAPDqDaQDPXsAZKbuGjqd8TdtCz78U1dAF38Qm9mIIzXTjDr0UprB3IWgKrEG9WZGsJYpuQiRTERCxTKYoW8YJGmkQdRrwKUAOuWFZvUGMCWQdDmhglLAFUAXo3ZhVUzqw3JqBdkF+V8BLwJuybSq4A9lQlXCW+OfEqsMQP5UUDSHzAHKJIeWIzIxc0W4aO2qkLZ1lgHO5OgU3oQ0O/K3IKMHO2uP1XDtNOEBpNzCWj4aaO4Ro1m/QxDJUuM0eGnrZxqDMcLmkSxptwK0pNkTemuLtZdM8IzZfbplNVJU1Tx/ztJ9ZaHtqzVZeU7LPvj3Tp4Xc9YP3mDHZtwXX/bfOTdzXM8vStZ2m8rTN1j/ik3f5+h/gAh/jAK+4/SeMl2bsU2zgAAAAASUVORK5CYII=",
        beforePhoto: true
      },
      {
        jobId: 5,
        caption: "New emergency lighting installed",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAXVBMVEX///8AAACsrKxlZWX29vb8/PxLS0uoqKjU1NR8fHzn5+ehoaHv7+9SUlLZ2dmWlpaxsbGAgIA4ODhzc3MPDw8pKSkdHR1dXV3IyMgxMTFCQkK5ublra2vCwsIWFhaOQdFGAAADq0lEQVR4nO1a25arIAwtKl6qVu3N2tra///L0d4SQDvHjq5yHvbDLBfEbEgCSWL8H4Fo9SyK1eteXhWRiV+Ecue9BjlIGTJIqQDJHrwqy4Le9jtQoVXPQFXC/QWyA61clYJd2RW0WrXbU2VR+OUqHzSyKDKXOItOvkCno33l0gWdrpX6g/LkQXSZwMSjkZQ+aVDXKFXtDnS4Vr4F8kCHAXpnQEWKL1AKs0Q1zCrQYiUXlM8W1LwfVfbmzMjkGTp0I1SuJXy5IPHcAQrDlxCjwJTkdZgvq2oGDO5g20U8QO7yFn2k0WDcVW4CsjNwN+lBe+PnLkH9AZzETdECu8DZ9IjJ8Mj1p46wYLgb9S0MveFGekbhGS58S6A+rO6mJ3Qs9DMNJ5i67mxnOMHZTnWCE9zMZHrGTh/4nIRUeO1C06PUzpGTADoAzwtwJaJM4Dh4K57YwJyF24f3QCfhKKxSP3n4QCBvQPyYAg7C6vA9wEH4VTMWcBQO5r6/QO4ZnuTCGwqmcDYXH+hCX9BfYXzGxwbNFFbGYBTYqJnqgbHVhc3xHUf/WwPwL2aDTdLiAuGdcPZ5TExh93KA/cN5UBB+fZU5Mb7gPMgIW3Fy/PVpMdoH0QnUBRj4SznYb7g4Jt8wFuBqXDJ6gntdY53w9hF+i2Aqmh4oTXgIX7dKGJsovYNbHPVxR6LnpyiXyQCeQzRe4IqzKLfgcQrWlrTRgotgYjgFO0vSaLxO8RI5BQeMUGNCF/Qnj18CNFdTQkjA31cIf6j3jQdU8FMdLnw9OfEBXvLihjP4iZa5hvXf+QawBhAPDqDaQDPXsAZKbuGjqd8TdtCz78U1dAF38Qm9mIIzXTjDr0UprB3IWgKrEG9WZGsJYpuQiRTERCxTKYoW8YJGmkQdRrwKUAOuWFZvUGMCWQdDmhglLAFUAXo3ZhVUzqw3JqBdkF+V8BLwJuybSq4A9lQlXCW+OfEqsMQP5UUDSHzAHKJIeWIzIxc0W4aO2qkLZ1lgHO5OgU3oQ0O/K3IKMHO2uP1XDtNOEBpNzCWj4aaO4Ro1m/QxDJUuM0eGnrZxqDMcLmkSxptwK0pNkTemuLtZdM8IzZfbplNVJU1Tx/ztJ9ZaHtqzVZeU7LPvj3Tp4Xc9YP3mDHZtwXX/bfOTdzXM8vStZ2m8rTN1j/ik3f5+h/gAh/jAK+4/SeMl2bsU2zgAAAAASUVORK5CYII=",
        beforePhoto: false
      },
      {
        jobId: 6,
        caption: "Non-working electrical outlet",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAXVBMVEX///8AAACsrKxlZWX29vb8/PxLS0uoqKjU1NR8fHzn5+ehoaHv7+9SUlLZ2dmWlpaxsbGAgIA4ODhzc3MPDw8pKSkdHR1dXV3IyMgxMTFCQkK5ublra2vCwsIWFhaOQdFGAAADq0lEQVR4nO1a25arIAwtKl6qVu3N2tra///L0d4SQDvHjq5yHvbDLBfEbEgCSWL8H4Fo9SyK1eteXhWRiV+Ecue9BjlIGTJIqQDJHrwqy4Le9jtQoVXPQFXC/QWyA61clYJd2RW0WrXbU2VR+OUqHzSyKDKXOItOvkCno33l0gWdrpX6g/LkQXSZwMSjkZQ+aVDXKFXtDnS4Vr4F8kCHAXpnQEWKL1AKs0Q1zCrQYiUXlM8W1LwfVfbmzMjkGTp0I1SuJXy5IPHcAQrDlxCjwJTkdZgvq2oGDO5g20U8QO7yFn2k0WDcVW4CsjNwN+lBe+PnLkH9AZzETdECu8DZ9IjJ8Mj1p46wYLgb9S0MveFGekbhGS58S6A+rO6mJ3Qs9DMNJ5i67mxnOMHZTnWCE9zMZHrGTh/4nIRUeO1C06PUzpGTADoAzwtwJaJM4Dh4K57YwJyF24f3QCfhKKxSP3n4QCBvQPyYAg7C6vA9wEH4VTMWcBQO5r6/QO4ZnuTCGwqmcDYXH+hCX9BfYXzGxwbNFFbGYBTYqJnqgbHVhc3xHUf/WwPwL2aDTdLiAuGdcPZ5TExh93KA/cN5UBB+fZU5Mb7gPMgIW3Fy/PVpMdoH0QnUBRj4SznYb7g4Jt8wFuBqXDJ6gntdY53w9hF+i2Aqmh4oTXgIX7dKGJsovYNbHPVxR6LnpyiXyQCeQzRe4IqzKLfgcQrWlrTRgotgYjgFO0vSaLxO8RI5BQeMUGNCF/Qnj18CNFdTQkjA31cIf6j3jQdU8FMdLnw9OfEBXvLihjP4iZa5hvXf+QawBhAPDqDaQDPXsAZKbuGjqd8TdtCz78U1dAF38Qm9mIIzXTjDr0UprB3IWgKrEG9WZGsJYpuQiRTERCxTKYoW8YJGmkQdRrwKUAOuWFZvUGMCWQdDmhglLAFUAXo3ZhVUzqw3JqBdkF+V8BLwJuybSq4A9lQlXCW+OfEqsMQP5UUDSHzAHKJIeWIzIxc0W4aO2qkLZ1lgHO5OgU3oQ0O/K3IKMHO2uP1XDtNOEBpNzCWj4aaO4Ro1m/QxDJUuM0eGnrZxqDMcLmkSxptwK0pNkTemuLtZdM8IzZfbplNVJU1Tx/ztJ9ZaHtqzVZeU7LPvj3Tp4Xc9YP3mDHZtwXX/bfOTdzXM8vStZ2m8rTN1j/ik3f5+h/gAh/jAK+4/SeMl2bsU2zgAAAAASUVORK5CYII=",
        beforePhoto: true
      }
    ];
    
    photos.forEach(photo => this.createPhoto(photo));
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
