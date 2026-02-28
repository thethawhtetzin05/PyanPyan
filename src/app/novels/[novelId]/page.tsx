import Link from "next/link";
import { db } from "@/lib/db";
import { chapters, novels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = 'force-dynamic';
export const runtime = "edge";

export default async function NovelPage({ params }: { params: Promise<{ novelId: string }> }) {
  const { novelId } = await params;
  const novel = await db.select().from(novels).where(eq(novels.id, novelId)).get();
  
  if (!novel) return <div className="p-8 text-center text-red-500">Novel Not Found</div>;

  const novelChapters = await db.select()
    .from(chapters)
    .where(eq(chapters.novelId, novelId))
    .orderBy(asc(chapters.chapterOrder))
    .all();

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <header className="mb-8 border-b pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{novel.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">{novel.description}</p>
            <div className="flex gap-4 text-sm text-gray-500">
                <span>By {novel.author || "Unknown"}</span>
                <span>•</span>
                <span className="uppercase">{novel.originalLanguage}</span>
                <span>•</span>
                <span className="capitalize">{novel.status}</span>
            </div>
        </header>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2 inline-block">Table of Contents</h2>
        
        <ul className="space-y-4">
            {novelChapters.map((chapter) => (
                <li key={chapter.id} className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition p-2 rounded">
                    <Link href={`/read/${chapter.id}`} className="text-lg text-blue-700 hover:text-blue-900 font-medium hover:underline flex-1">
                        {chapter.title}
                    </Link>
                    <span className="text-sm text-gray-400">
                        {new Date(chapter.publishedAt || chapter.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                </li>
            ))}
            {novelChapters.length === 0 && (
                <p className="text-gray-500 italic">No chapters released yet.</p>
            )}
        </ul>

        <div className="mt-8 text-center">
            <Link href="/" className="text-blue-500 hover:underline text-sm">
                ← Back to Library
            </Link>
        </div>
      </div>
    </div>
  );
}
