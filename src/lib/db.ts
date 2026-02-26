import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client"; 
import * as schema from "@/db/schema";

let dbInstance: any;

if (process.env.NODE_ENV === "development") {
    const client = createClient({
        url: process.env.DATABASE_URL || "file:local.db",
    });
    dbInstance = drizzleLibsql(client, { schema });
} else {
    // Production (Cloudflare Pages)
    // We expect process.env.DB to be available at RUNTIME.
    // During BUILD, it might be missing.
    if (typeof process !== "undefined" && process.env && process.env.DB) {
        dbInstance = drizzle(process.env.DB as any, { schema });
    } else {
        // Build time placeholder or misconfiguration
        // This prevents the "URL_SCHEME_NOT_SUPPORTED" error during build
        // because we avoid initializing LibSQL with 'file:' in production env.
        dbInstance = new Proxy({}, {
            get: function(target, prop) {
                 if (prop === 'then') return undefined; // Promise safety
                 // throw new Error("Database accessed during build or DB binding missing.");
                 return () => {}; // Return dummy function to avoid crash if called
            }
        });
    }
}

export const db = dbInstance;
