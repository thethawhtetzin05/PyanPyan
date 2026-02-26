import { db } from "@/lib/db";
import { chapters, reviews } from "@/db/schema";
import { eq, avg, isNotNull, and, desc } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function exportFineTuningData() {
  console.log("🚀 Starting Data Extraction Pipeline...");

  // 1. Define Criteria (e.g., Status = 'human_reviewing' or 'verified_for_training')
  // Ideally, we would join with reviews to filter by avg rating > 4.5
  // For now, let's export ALL human-verified translations.
  
  const verifiedChapters = await db.select({
    original: chapters.contentOriginal,
    translated: chapters.contentEdited, // We want the HUMAN edited version
    status: chapters.status,
    novelId: chapters.novelId,
    chapterId: chapters.id
  })
  .from(chapters)
  .where(
    and(
        isNotNull(chapters.contentEdited), // Must have human edit
        // In a real scenario, filter by status or rating:
        // eq(chapters.status, 'verified_for_training') 
    )
  );

  console.log(`✅ Found ${verifiedChapters.length} verified chapters.`);

  if (verifiedChapters.length === 0) {
    console.warn("⚠️ No data found to export. Make sure to mark chapters as 'Reviewed'.");
    return;
  }

  // 2. Format as JSONL (OpenAI / Gemini / Llama Fine-tuning format)
  const jsonlData = verifiedChapters.map(chapter => {
    return JSON.stringify({
      messages: [
        { role: "system", content: "You are a professional translator translating novels from English to Burmese." },
        { role: "user", content: chapter.original },
        { role: "assistant", content: chapter.translated }
      ]
    });
  }).join("\n");

  // 3. Save to File
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `finetune_data_${timestamp}.jsonl`;
  const outputPath = path.join(process.cwd(), "exports", filename);

  fs.writeFileSync(outputPath, jsonlData);

  console.log(`🎉 Export Successful! Data saved to:`);
  console.log(`   📂 ${outputPath}`);
}

exportFineTuningData().catch(console.error);
