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

// Get Reviews
export async function getReviews(chapterId: string) {
    const results = await db.select()
        .from(reviews)
        .where(eq(reviews.chapterId, chapterId))
        .orderBy(desc(reviews.createdAt))
        .all();
    return results;
}
