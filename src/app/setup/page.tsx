"use client";

import { useState } from "react";
import { runMigration } from "@/app/actions";

export default function SetupPage() {
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState("");

  const handleRun = async () => {
    setStatus("Running...");
    setError("");
    try {
      const result = await runMigration();
      if (result.success) {
        setStatus("Success! Tables created.");
      } else {
        setStatus("Failed.");
        setError(result.error || "Unknown error");
      }
    } catch (e: any) {
      setStatus("Error");
      setError(e.message);
    }
  };

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Database Setup</h1>
      <p className="mb-4">Click below to create the necessary tables in D1.</p>
      
      <button 
        onClick={handleRun}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Migrations
      </button>

      <div className="mt-4 p-4 border rounded bg-gray-50">
        <p><strong>Status:</strong> {status}</p>
        {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
      </div>
    </div>
  );
}
