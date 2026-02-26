import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), 
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "editor", "reader"] }).default("reader").notNull(),
  trustScore: integer("trust_score").default(0), // Editor reputation
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const novels = sqliteTable("novels", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  originalLanguage: text("original_language").notNull(), // 'en', 'zh', 'ko'
  status: text("status", { enum: ["ongoing", "completed", "dropped"] }).default("ongoing").notNull(),
  coverUrl: text("cover_url"),
  author: text("author"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  novelId: text("novel_id").references(() => novels.id).notNull(),
  title: text("title").notNull(),
  contentOriginal: text("content_original").notNull(), // Raw source text
  contentTranslated: text("content_translated"), // AI draft
  contentEdited: text("content_edited"), // Human proofread version (Golden dataset)
  status: text("status", { 
    enum: ["pending", "ai_translated", "human_reviewing", "published", "verified_for_training"] 
  }).default("pending").notNull(),
  order: integer("order").notNull(),
  viewCount: integer("view_count").default(0), // Popularity metric
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  chapterId: text("chapter_id").references(() => chapters.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
