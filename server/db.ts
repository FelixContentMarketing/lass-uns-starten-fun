import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Task Queries
// ============================================

export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  const { tasks } = await import("../drizzle/schema");
  return db.select().from(tasks).orderBy(tasks.createdAt);
}

export async function getTaskById(taskId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { tasks } = await import("../drizzle/schema");
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTasksByStatus(status: "posteingang" | "in_freigabe" | "in_bearbeitung" | "erledigt") {
  const db = await getDb();
  if (!db) return [];
  const { tasks } = await import("../drizzle/schema");
  return db.select().from(tasks).where(eq(tasks.status, status));
}

export async function createTask(task: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { tasks } = await import("../drizzle/schema");
  await db.insert(tasks).values(task);
  // Return the task to get the ID from the database
  const inserted = await db.select().from(tasks).orderBy(tasks.id).limit(1);
  return inserted[0]?.id;
}

export async function updateTask(taskId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { tasks } = await import("../drizzle/schema");
  await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
}

export async function deleteTask(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { tasks } = await import("../drizzle/schema");
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

// ============================================
// Task Status History
// ============================================

export async function addTaskStatusHistory(history: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { taskStatusHistory } = await import("../drizzle/schema");
  await db.insert(taskStatusHistory).values(history);
}

export async function getTaskStatusHistory(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  const { taskStatusHistory } = await import("../drizzle/schema");
  return db.select().from(taskStatusHistory).where(eq(taskStatusHistory.taskId, taskId)).orderBy(taskStatusHistory.changedAt);
}

// ============================================
// Task Files
// ============================================

export async function addTaskFile(file: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { taskFiles } = await import("../drizzle/schema");
  await db.insert(taskFiles).values(file);
  // Return the file to get the ID from the database
  const inserted = await db.select().from(taskFiles).orderBy(taskFiles.id).limit(1);
  return inserted[0]?.id;
}

export async function getTaskFiles(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  const { taskFiles } = await import("../drizzle/schema");
  return db.select().from(taskFiles).where(eq(taskFiles.taskId, taskId));
}

export async function deleteTaskFile(fileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { taskFiles } = await import("../drizzle/schema");
  await db.delete(taskFiles).where(eq(taskFiles.id, fileId));
}

// ============================================
// GHL Users
// ============================================

export async function getAllGhlUsers() {
  const db = await getDb();
  if (!db) return [];
  const { ghlUsers } = await import("../drizzle/schema");
  return db.select().from(ghlUsers);
}

export async function upsertGhlUser(user: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { ghlUsers } = await import("../drizzle/schema");
  await db.insert(ghlUsers).values(user).onDuplicateKeyUpdate({
    set: {
      name: user.name,
      email: user.email,
      lastSyncedAt: new Date(),
    },
  });
}

// ============================================
// App Settings
// ============================================

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { appSettings } = await import("../drizzle/schema");
  const result = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSetting(key: string, value: string, description?: string, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { appSettings } = await import("../drizzle/schema");
  await db.insert(appSettings).values({
    key,
    value,
    description,
    updatedByUserId: userId,
  }).onDuplicateKeyUpdate({
    set: {
      value,
      description,
      updatedByUserId: userId,
      updatedAt: new Date(),
    },
  });
}
