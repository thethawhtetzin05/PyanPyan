import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";

// Determine if we are running on Cloudflare Edge (Pages/Workers)
const isCloudflare = typeof process !== "undefined" && process.env && process.env.DB;

let db: any;

if (isCloudflare) {
  // Use Cloudflare D1
  // Access via process.env.DB (binding name must be 'DB' in Cloudflare settings)
  db = drizzle(process.env.DB as any, { schema });
} else {
  // Local Development (SQLite / LibSQL)
  const client = createClient({
    url: process.env.DATABASE_URL || "file:local.db",
  });
  db = drizzleSqlite(client, { schema });
}

export { db };
