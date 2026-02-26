import Link from "next/link";
import { db } from "@/lib/db";
import { chapters, novels, reviews, users } from "@/db/schema"; // Import reviews/users schema
import { eq, asc, gt, lt, desc } from "drizzle-orm";
import { submitReview } from "@/app/actions"; // Server Action

export const dynamic = 'force-dynamic';

export default async function ChapterPage({ params }: { params: { chapterId: string } }) {
  const chapter = await db.select().from(chapters).where(eq(chapters.id, params.chapterId)).get();
  
  if (!chapter) return <div className="p-8 text-center text-red-500">Chapter Not Found</div>;

  const content = chapter.contentEdited || chapter.contentTranslated || "Translation in progress...";

  // Find Next/Prev Chapter Logic (Simple version based on order)
  const prevChapter = await db.select().from(chapters)
    .where(eq(chapters.novelId, chapter.novelId))
    .where(lt(chapters.order, chapter.order))
    .orderBy(desc(chapters.order))
    .limit(1)
    .get();

  const nextChapter = await db.select().from(chapters)
    .where(eq(chapters.novelId, chapter.novelId))
    .where(gt(chapters.order, chapter.order))
    .orderBy(asc(chapters.order))
    .limit(1)
    .get();

  // Fetch Reviews
  const chapterReviews = await db.select()
    .from(reviews)
    .where(eq(reviews.chapterId, params.chapterId))
    .orderBy(desc(reviews.createdAt))
    .all();

  return (
    <div className="min-h-screen bg-gray-50 font-serif leading-relaxed text-gray-900">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm min-h-screen border-l border-r border-gray-100">
        
        {/* Navigation Top */}
        <div className="flex justify-between items-center mb-8 text-sm text-gray-500 font-sans border-b border-gray-100 pb-4">
            <Link href={`/novels/${chapter.novelId}`} className="hover:text-blue-600 transition">
                ← Table of Contents
            </Link>
            <div className="flex gap-4">
                {prevChapter && (
                    <Link href={`/read/${prevChapter.id}`} className="hover:text-blue-600 transition">
                        « Previous
                    </Link>
                )}
                {nextChapter && (
                    <Link href={`/read/${nextChapter.id}`} className="hover:text-blue-600 transition">
                        Next »
                    </Link>
                )}
            </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center leading-tight tracking-tight text-gray-800">
            {chapter.title}
        </h1>

        <div className="prose prose-lg prose-slate max-w-none text-lg leading-loose mb-12 indent-8 text-justify">
            {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
            ))}
        </div>

        {/* Navigation Bottom */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 font-sans mb-12">
             {prevChapter ? (
                <Link 
                    href={`/read/${prevChapter.id}`} 
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 transition font-medium"
                >
                    « Previous Chapter
                </Link>
             ) : <div />}
             
             {nextChapter ? (
                <Link 
                    href={`/read/${nextChapter.id}`} 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-medium shadow-sm hover:shadow"
                >
                    Next Chapter »
                </Link>
             ) : <div />}
        </div>

        {/* Comments Section */}
        <div className="mt-16 pt-8 border-t-2 border-gray-100 font-sans">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Reader Reviews ({chapterReviews.length})</h3>
            
            {/* Review Form */}
            <form action={async (formData) => {
                "use server";
                const comment = formData.get("comment") as string;
                const rating = parseInt(formData.get("rating") as string);
                if (comment && rating) {
                    await submitReview(params.chapterId, rating, comment);
                }
            }} className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <select name="rating" className="w-full p-2 border rounded-md bg-white">
                        <option value="5">⭐⭐⭐⭐⭐ Excellent Translation</option>
                        <option value="4">⭐⭐⭐⭐ Very Good</option>
                        <option value="3">⭐⭐⭐ Good</option>
                        <option value="2">⭐⭐ Needs Improvement</option>
                        <option value="1">⭐ Poor Quality</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                    <textarea 
                        name="comment" 
                        required
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                        placeholder="How was the translation? Any feedback for the editor?"
                    ></textarea>
                </div>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm">
                    Submit Review
                </button>
            </form>

            {/* Review List */}
            <div className="space-y-6">
                {chapterReviews.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                    chapterReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-yellow-500 text-sm">
                                    {"⭐".repeat(review.rating)}
                                </div>
                                <span className="text-xs text-gray-400">
                                    • {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
