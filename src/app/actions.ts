"use server";

import { db } from "@/lib/db";
import { chapters, reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { translateText } from "@/lib/ai";
import { v4 as uuidv4 } from "uuid";

// ... existing actions (getChapter, saveDraft, markAsReviewed, triggerAiTranslation) ...

// Get Chapter Data
export async function getChapter(chapterId: string) {
  const result = await db.select().from(chapters).where(eq(chapters.id, chapterId)).get();
  return result;
}

// Save Draft (Update contentTranslated)
export async function saveDraft(chapterId: string, content: string) {
  try {
    await db.update(chapters)
      .set({ 
        contentTranslated: content,
        // status: "ai_translated" // Or keep existing status
      })
      .where(eq(chapters.id, chapterId));
    
    revalidatePath(`/editor/${chapterId}`);
    return { success: true };
  } catch (error) {
    console.error("Save Draft Error:", error);
    return { success: false, error: "Failed to save draft" };
  }
}

// Mark as Reviewed (Publish to 'human_reviewing' or 'published')
export async function markAsReviewed(chapterId: string, content: string) {
  try {
    await db.update(chapters)
      .set({ 
        contentEdited: content, // Save as Golden Dataset
        status: "human_reviewing", // Move to next stage
        publishedAt: new Date()
      })
      .where(eq(chapters.id, chapterId));

    revalidatePath(`/editor/${chapterId}`);
    return { success: true };
  } catch (error) {
     console.error("Publish Error:", error);
     return { success: false, error: "Failed to publish" };
  }
}

// Trigger AI Translation
export async function triggerAiTranslation(chapterId: string) {
  try {
    // 1. Fetch original content
    const chapter = await db.select().from(chapters).where(eq(chapters.id, chapterId)).get();
    
    if (!chapter || !chapter.contentOriginal) {
      return { success: false, error: "Chapter or original content not found." };
    }

    // 2. Call AI Service
    const translatedText = await translateText(chapter.contentOriginal);

    // 3. Update Database
    await db.update(chapters)
      .set({
        contentTranslated: translatedText,
        status: "ai_translated"
      })
      .where(eq(chapters.id, chapterId));

    revalidatePath(`/editor/${chapterId}`);
    return { success: true, translation: translatedText };

  } catch (error) {
    console.error("AI Translation Failed:", error);
    return { success: false, error: "AI Translation Failed" };
  }
}

// Submit Review
export async function submitReview(chapterId: string, rating: number, comment: string) {
  try {
    // Ideally get current user session. For now, use a dummy user or create one on fly.
    // Let's use the first user in DB or create a guest user.
    let user = await db.select().from(users).limit(1).get();
    
    if (!user) {
         // Create dummy user if none exists (fallback for dev)
         const userId = uuidv4();
         await db.insert(users).values({
            id: userId,
            email: "guest@example.com",
            role: "reader",
         });
         user = { id: userId };
    }

    await db.insert(reviews).values({
      id: uuidv4(),
      userId: user.id,
      chapterId: chapterId,
      rating: rating,
      comment: comment,
      createdAt: new Date(),
    });
    
    revalidatePath(`/read/${chapterId}`);
    return { success: true };
  } catch (error) {
    console.error("Submit Review Error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

import { sql } from "drizzle-orm";

// ... existing imports ...

// Manual Migration for Setup Page
export async function runMigration() {
  try {
    // 0. Cleanup (Drop old tables to reset schema)
    // We do this one by one to avoid dependency errors if FKs exist
    await db.run(sql`DROP TABLE IF EXISTS reviews;`);
    await db.run(sql`DROP TABLE IF EXISTS chapters;`);
    await db.run(sql`DROP TABLE IF EXISTS users;`);
    await db.run(sql`DROP TABLE IF EXISTS novels;`);

    // 1. Create Tables (Simplified without strict Foreign Keys)
    await db.run(sql`CREATE TABLE IF NOT EXISTS novels (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      original_language TEXT NOT NULL,
      status TEXT DEFAULT 'ongoing' NOT NULL,
      cover_url TEXT,
      author TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );`);

    await db.run(sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      role TEXT DEFAULT 'reader' NOT NULL,
      trust_score INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );`);

    await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);`);

    await db.run(sql`CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY NOT NULL,
      novel_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_original TEXT NOT NULL,
      content_translated TEXT,
      content_edited TEXT,
      status TEXT DEFAULT 'pending' NOT NULL,
      order INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0,
      published_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );`);

    await db.run(sql`CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );`);

    // 2. Insert Sample Data (Check if exists first)
    const existingNovel = await db.select().from(novels).limit(1).get();
    if (!existingNovel) {
       await db.run(sql`INSERT INTO novels (id, title, description, original_language, status, author) 
       VALUES ('sample-1', 'The Silent Stars', 'A demo novel.', 'en', 'ongoing', 'Jane Doe');`);

       await db.run(sql`INSERT INTO chapters (id, novel_id, title, content_original, content_translated, status, "order") 
       VALUES ('chap-1', 'sample-1', 'Chapter 1', 'Hello World', 'မင်္ဂလာပါ', 'published', 1);`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Migration Error:", error);
    return { success: false, error: error.message };
  }
}

