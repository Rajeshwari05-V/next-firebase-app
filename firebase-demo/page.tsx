// src/app/firebase-demo/page.tsx
"use client";
import React, { useEffect } from "react";
import app from "@/lib/firebase";

export default function FirebaseDemoPage() {
  useEffect(() => {
    console.log("Firebase app initialized:", app);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Firebase Demo Page</h1>
      <p>Check your browser console → You should see Firebase initialized ✅</p>
    </div>
  );
}
