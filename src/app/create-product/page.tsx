// src/app/create-product/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

function generateProductFromTranscript(transcript: string) {
  const short = transcript.trim().replace(/\s+/g, " ");
  const title = short.split(/[.?!]/)[0].slice(0, 60) || "Handmade craft";
  const bullets = [
    short.slice(0, 120) || "Handcrafted using traditional techniques.",
    "Materials: natural / hand-worked",
    "Care: gentle hand wash",
  ];
  const story = `Story: ${short}\n\nMade traditionally by local artisans using time-tested techniques. Perfect for gifting or home decor.`;
  return { title, bullets, story };
}

export default function CreateProductPage() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null); // SpeechRecognition
  const [generated, setGenerated] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);

  // START/STOP recording using MediaRecorder + SpeechRecognition when available
  const startRecording = async () => {
    setTranscript("");
    // SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const r = new SpeechRecognition();
      r.lang = "en-US";
      r.interimResults = true;
      r.onresult = (ev: any) => {
        const text = Array.from(ev.results)
          .map((res: any) => res[0].transcript)
          .join(" ");
        setTranscript(text);
      };
      r.onerror = (e: any) => console.warn("STT error", e);
      r.start();
      recognitionRef.current = r;
    }

    // MediaRecorder
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };
    mr.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }
    setRecording(false);
  };

  // image file selection
  const onImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImageFiles(Array.from(e.target.files).slice(0, 6));
  };

  // generate title/bullets/story from transcript
  const onGenerate = () => {
    const g = generateProductFromTranscript(transcript || "");
    setGenerated(g);
    // quick TTS preview
    if ("speechSynthesis" in window) {
      const ut = new SpeechSynthesisUtterance(g.story);
      ut.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(ut);
    }
  };

  // upload helper
  const uploadFiles = async (files: File[], prefix = "products") => {
    const urls: string[] = [];
    for (const f of files) {
      const path = `${prefix}/${Date.now()}_${f.name}`;
      const r = storageRef(storage, path);
      const snap = await uploadBytes(r, f);
      const url = await getDownloadURL(snap.ref);
      urls.push(url);
    }
    return urls;
  };

  const blobToFile = (b: Blob, name = "audio.webm") =>
    new File([b], name, { type: b.type });

  // publish product: upload images + audio, create Firestore doc
  const onPublish = async () => {
    setPublishing(true);
    try {
      const imgUrls = imageFiles.length ? await uploadFiles(imageFiles) : [];
      const audioUrl = audioBlob ? await uploadFiles([blobToFile(audioBlob)], "audio") : null;
      const productData = {
        artisan_id: "demo-artisan", // replace with actual user uid after Auth
        title: generated?.title || "Handmade product",
        desc: { en: generated?.story || transcript || "" },
        bullets: generated?.bullets || [],
        imgs: imgUrls,
        audio_url: audioUrl ? audioUrl[0] : null,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "products"), productData);
      alert("Published! Product id: " + ref.id);
      // optionally navigate to `/product/${ref.id}`
    } catch (err) {
      console.error(err);
      alert("Publish failed: " + (err as any).message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create product — Voice → Transcript → Story</h2>

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => (recording ? stopRecording() : startRecording())}>
          {recording ? "Stop recording" : "Start recording (mic)"}
        </button>
        <span style={{ marginLeft: 12 }}>{recording ? "Recording…" : ""}</span>
      </div>

      <div>
        <label>Transcript (editable):</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Images (max 6):</label>
        <input type="file" accept="image/*" multiple onChange={onImages} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {imageFiles.map((f, i) => (
            <div key={i} style={{ fontSize: 12 }}>{f.name}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={onGenerate}>Generate title & story</button>
        <button onClick={onPublish} disabled={publishing || !generated} style={{ marginLeft: 12 }}>
          {publishing ? "Publishing…" : "Publish product"}
        </button>
      </div>

      {generated && (
        <div style={{ marginTop: 18, padding: 12, border: "1px solid #ddd" }}>
          <h3>{generated.title}</h3>
          <ul>
            {generated.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
          </ul>
          <p>{generated.story}</p>
        </div>
      )}
    </div>
  );
}
