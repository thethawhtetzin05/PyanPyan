import React from "react";

export const runtime = "edge";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="border-b bg-white p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold">ATW Editor Workspace</h1>
        <div className="flex gap-2">
           {/* Actions will go here */}
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
