import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (technicians)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  workOrderNumber: text("work_order_number").notNull(),
  customerId: integer("customer_id").notNull(),
  technicianId: integer("technician_id").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, etc.
  description: text("description"),
  created: timestamp("created").notNull().defaultNow(),
  scheduled: timestamp("scheduled"),
  timeZone: text("time_zone"),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  workOrderNumber: true,
  customerId: true,
  technicianId: true,
  status: true,
  description: true,
  scheduled: true,
  timeZone: true,
});

// Job Photos
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  caption: text("caption"),
  dataUrl: text("data_url").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  aiAnalysis: jsonb("ai_analysis"),
  beforePhoto: boolean("before_photo").default(true),
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  jobId: true,
  caption: true,
  dataUrl: true,
  beforePhoto: true,
});

// Job Notes
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  technicianId: integer("technician_id").notNull(),
  enhancedContent: text("enhanced_content"),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  jobId: true,
  content: true,
  technicianId: true,
});

// Materials for estimates/invoices
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  defaultPrice: integer("default_price"),
  unit: text("unit"),
});

export const insertMaterialSchema = createInsertSchema(materials).pick({
  name: true,
  description: true,
  category: true,
  defaultPrice: true,
  unit: true,
});

// Estimate Items
export const estimateItems = pgTable("estimate_items", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  type: text("type").notNull(), // labor, material, etc.
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // in cents
  storeSource: text("store_source"),
  materialId: integer("material_id"),
});

export const insertEstimateItemSchema = createInsertSchema(estimateItems).pick({
  jobId: true,
  type: true,
  description: true,
  quantity: true,
  unitPrice: true,
  storeSource: true,
  materialId: true,
});

// Estimates
export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().unique(),
  status: text("status").notNull().default("draft"), // draft, sent, approved, etc.
  totalAmount: integer("total_amount").notNull(), // in cents
  created: timestamp("created").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertEstimateSchema = createInsertSchema(estimates).pick({
  jobId: true,
  status: true,
  totalAmount: true,
  notes: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type EstimateItem = typeof estimateItems.$inferSelect;
export type InsertEstimateItem = z.infer<typeof insertEstimateItemSchema>;

export type Estimate = typeof estimates.$inferSelect;
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
