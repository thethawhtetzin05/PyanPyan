import { db } from "@/lib/db";
import { users, novels, chapters, reviews } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding database...");

  // 1. Create a User (Editor)
  const userId = uuidv4();
  await db.insert(users).values({
    id: userId,
    email: "editor@example.com",
    role: "editor",
    trustScore: 100,
  });

  // 2. Create a Novel
  const novelId = uuidv4();
  await db.insert(novels).values({
    id: novelId,
    title: "The Silent Stars",
    description: "A sci-fi romance about a girl who fell in love with a star.",
    originalLanguage: "en",
    status: "ongoing",
    author: "Jane Doe",
  });

  // 3. Create a Chapter (Status: ai_translated)
  const chapterId = uuidv4();
  await db.insert(chapters).values({
    id: chapterId,
    novelId: novelId,
    title: "Chapter 1: The Beginning",
    contentOriginal: "She looked at the stars and sighed. It was a cold night, but the warmth of the fire kept her company.",
    contentTranslated: "သူမသည် ကြယ်ကလေးများကို မော့ကြည့်ကာ သက်ပြင်းချလိုက်သည်။ အေးစက်သော ညတစ်ညဖြစ်သော်လည်း မီးဖိုမှ အနွေးဓာတ်က သူမကို အဖော်ပြုပေးနေသည်။",
    status: "ai_translated",
    order: 1,
  });

  console.log("Seeding complete!");
  console.log(`User ID: ${userId}`);
  console.log(`Novel ID: ${novelId}`);
  console.log(`Chapter ID: ${chapterId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
