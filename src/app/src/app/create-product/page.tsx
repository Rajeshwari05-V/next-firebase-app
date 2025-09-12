"use client";

import React, { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreateProductPage() {
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length > 6) {
        alert("Max 6 images allowed");
        return;
      }
      setImages(e.target.files);
    }
  };

  const handlePublish = async () => {
    if (!title || !story) {
      alert("Please fill in title and story!");
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];

      if (images) {
        for (const file of Array.from(images)) {
          const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          imageUrls.push(url);
        }
      }

      await addDoc(collection(db, "products"), {
        title,
        transcript,
        story,
        images: imageUrls,
        createdAt: Timestamp.now(),
      });

      alert("Product published!");
      setTranscript("");
      setTitle("");
      setStory("");
      setImages(null);
    } catch (error) {
      console.error("Error publishing product:", error);
      alert("Failed to publish.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create product — Voice → Transcript → Story</h1>

      <textarea
        className="w-full border p-2 mb-3 rounded"
        placeholder="Transcript (editable)"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />

      <input
        type="text"
        className="w-full border p-2 mb-3 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2 mb-3 rounded"
        placeholder="Story"
        value={story}
        onChange={(e) => setStory(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        multiple
        className="mb-3"
        onChange={handleFileChange}
      />

      <button
        onClick={handlePublish}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish product"}
      </button>
    </div>
  );
}
