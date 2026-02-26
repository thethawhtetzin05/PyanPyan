import Link from "next/link";
import { db } from "@/lib/db";
import { chapters, novels } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const allNovels = await db.select().from(novels).all();
  // Get latest updated chapters if we want, but let's keep it simple.

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-12 flex justify-between items-center max-w-6xl mx-auto">
        <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ATW Novel Reader</h1>
            <p className="text-gray-600 mt-2 text-lg">Discover the best web novel translations.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition">
            Translator Dashboard →
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {allNovels.map((novel) => (
          <div key={novel.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400 font-medium">
                {/* Placeholder Cover */}
                {novel.coverUrl ? (
                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                    "No Cover Image"
                )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-gray-900 leading-snug">{novel.title}</h2>
            <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                {novel.description || "No description available."}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
               <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                 {novel.originalLanguage} • {novel.status}
               </span>
               <Link 
                   href={`/novels/${novel.id}`}
                   className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
               >
                   Read Now
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
