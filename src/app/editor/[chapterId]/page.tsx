"use client";

import { useState, useEffect, use } from "react";
import { getChapter, saveDraft, markAsReviewed, triggerAiTranslation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Chapter {
  id: string;
  title: string;
  contentOriginal: string;
  contentTranslated: string | null;
  contentEdited: string | null;
  status: string;
}

export default function EditorPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = use(params);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getChapter(chapterId);
        if (data) {
          setChapter(data as any); // Type assertion for now due to drizzle result type
          // If already edited, use that, otherwise use AI translation
          setEditedContent(data.contentEdited || data.contentTranslated || ""); 
        } else {
            setError("Chapter not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load chapter");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [chapterId]);

  const handleSave = async () => {
    if (!chapter) return;
    setIsSaving(true);
    const result = await saveDraft(chapter.id, editedContent);
    if (result.success) {
      alert("Draft Saved!");
    } else {
      alert("Failed to save draft.");
    }
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!chapter) return;
    if (confirm("Are you sure you want to mark this as Human Edited? This will save it to the Golden Dataset.")) {
      const result = await markAsReviewed(chapter.id, editedContent);
       if (result.success) {
        alert("Published! Status updated to 'human_reviewing'");
        // Ideally, redirect or refresh status here
      } else {
        alert("Failed to publish.");
      }
    }
  }

  const handleAiTranslate = async () => {
    if (!chapter) return;
    if (chapter.contentTranslated && !confirm("This chapter already has a translation. Re-translating will overwrite it. Continue?")) {
      return;
    }

    setIsTranslating(true);
    const result = await triggerAiTranslation(chapter.id);
    if (result.success && result.translation) {
      setEditedContent(result.translation);
      alert("AI Translation Complete!");
    } else {
      alert("AI Translation Failed: " + (result.error || "Unknown Error"));
    }
    setIsTranslating(false);
  };

  if (loading) return <div className="p-10 text-center">Loading Editor...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!chapter) return <div className="p-10 text-center">Chapter not found</div>;

  return (
    <div className="flex h-full">
      {/* Left Panel: Original Source */}
      <div className="w-1/2 border-r p-6 overflow-y-auto bg-gray-50 h-[calc(100vh-64px)]">
        <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide sticky top-0 bg-gray-50 py-2">
          Original Source: {chapter.title}
        </h2>
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
          {chapter.contentOriginal}
        </div>
      </div>

      {/* Right Panel: Editor Workspace */}
      <div className="w-1/2 p-6 bg-white flex flex-col h-[calc(100vh-64px)]">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 z-10">
             <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Translation (Editable)
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    chapter.status === 'published' ? 'bg-green-100 text-green-800' : 
                    chapter.status === 'ai_translated' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                }`}>
                    {chapter.status}
                </span>
             </div>
            <div className="space-x-2 flex">
                 <Button 
                    onClick={handleAiTranslate}
                    disabled={isTranslating}
                    variant="secondary"
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800"
                 >
                    {isTranslating ? "Translating..." : "✨ AI Translate"}
                 </Button>
                 <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="outline"
                 >
                    {isSaving ? "Saving..." : "Save Draft"}
                 </Button>
                 <Button 
                    onClick={handlePublish}
                    variant="default"
                 >
                    Mark as Reviewed
                 </Button>
            </div>
        </div>
       
        <Textarea
          className="flex-1 w-full p-4 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans text-lg leading-relaxed min-h-[500px]"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Start editing translation..."
        />
      </div>
    </div>
  );
}
