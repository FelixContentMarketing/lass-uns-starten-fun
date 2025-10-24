import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tasks table - Haupttabelle für alle Aufgaben
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  /** GoHighLevel Task ID für Synchronisation */
  ghlTaskId: varchar("ghlTaskId", { length: 64 }).unique(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  /** Kanban-Status: posteingang, in_freigabe, in_bearbeitung, erledigt */
  status: mysqlEnum("status", ["posteingang", "in_freigabe", "in_bearbeitung", "erledigt"]).default("posteingang").notNull(),
  priority: mysqlEnum("priority", ["niedrig", "mittel", "hoch", "dringend"]).default("mittel"),
  dueDate: timestamp("dueDate"),
  /** Zugewiesener Benutzer (User ID) */
  assignedToUserId: int("assignedToUserId"),
  /** GoHighLevel User ID für Synchronisation */
  assignedToGhlUserId: varchar("assignedToGhlUserId", { length: 64 }),
  /** Contact ID aus GoHighLevel */
  contactId: varchar("contactId", { length: 64 }),
  /** Erstellt von (User ID) */
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** Zeitstempel, wann die Aufgabe abgeschlossen wurde */
  completedAt: timestamp("completedAt"),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Task Status History - Tracking aller Status-Änderungen
 */
export const taskStatusHistory = mysqlTable("taskStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  oldStatus: mysqlEnum("oldStatus", ["posteingang", "in_freigabe", "in_bearbeitung", "erledigt"]),
  newStatus: mysqlEnum("newStatus", ["posteingang", "in_freigabe", "in_bearbeitung", "erledigt"]).notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
  changedByUserId: int("changedByUserId"),
});

export type TaskStatusHistory = typeof taskStatusHistory.$inferSelect;
export type InsertTaskStatusHistory = typeof taskStatusHistory.$inferInsert;

/**
 * Task Files - Angehängte Dateien (PDFs, Bilder, Tabellen)
 */
export const taskFiles = mysqlTable("taskFiles", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  /** S3 URL zur Datei */
  fileUrl: text("fileUrl").notNull(),
  /** S3 File Key */
  fileKey: text("fileKey").notNull(),
  /** Originaler Dateiname */
  filename: varchar("filename", { length: 500 }).notNull(),
  /** MIME Type */
  mimeType: varchar("mimeType", { length: 100 }),
  /** Dateigröße in Bytes */
  fileSize: int("fileSize"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  uploadedByUserId: int("uploadedByUserId"),
});

export type TaskFile = typeof taskFiles.$inferSelect;
export type InsertTaskFile = typeof taskFiles.$inferInsert;

/**
 * GHL Users - Cache für GoHighLevel Benutzer
 */
export const ghlUsers = mysqlTable("ghlUsers", {
  id: int("id").autoincrement().primaryKey(),
  /** GoHighLevel User ID */
  ghlUserId: varchar("ghlUserId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  /** Letzter Sync-Zeitpunkt */
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
});

export type GhlUser = typeof ghlUsers.$inferSelect;
export type InsertGhlUser = typeof ghlUsers.$inferInsert;

/**
 * App Settings - Globale Einstellungen (API Keys, Location ID)
 */
export const appSettings = mysqlTable("appSettings", {
  id: int("id").autoincrement().primaryKey(),
  /** Setting Key */
  key: varchar("key", { length: 100 }).notNull().unique(),
  /** Setting Value (verschlüsselt für sensible Daten) */
  value: text("value"),
  /** Beschreibung */
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedByUserId: int("updatedByUserId"),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;