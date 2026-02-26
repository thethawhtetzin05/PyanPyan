import Link from "next/link";
import { db } from "@/lib/db";
import { chapters, novels } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const allChapters = await db.select().from(chapters).all();
  const allNovels = await db.select().from(novels).all();

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Editor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage translations and reviews.</p>
        </div>
        <Link href="/" className="text-blue-600 hover:underline">
            Back to Home (Reader View)
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allNovels.map((novel) => (
          <div key={novel.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-2">{novel.title}</h2>
            <div className="flex items-center gap-2 mb-4">
               <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full uppercase font-bold">
                 {novel.originalLanguage}
               </span>
               <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full uppercase font-bold">
                 {novel.status}
               </span>
            </div>
            
            <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Chapters:</h3>
                <ul className="space-y-2">
                    {allChapters
                        .filter(c => c.novelId === novel.id)
                        .map(chapter => (
                        <li key={chapter.id} className="flex justify-between items-center text-sm">
                            <span className="truncate w-2/3">{chapter.title}</span>
                            <div className="flex gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    chapter.status === 'published' ? 'bg-green-100 text-green-800' : 
                                    chapter.status === 'ai_translated' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                                }`}>
                                    {chapter.status}
                                </span>
                                <Link 
                                    href={`/editor/${chapter.id}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    Edit
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
