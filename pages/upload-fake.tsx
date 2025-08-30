// pages/upload-fake.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

type UploadDoc = {
  filename: string;
  url: string;
  kind: "image" | "audio" | "placeholder";
  ownerUid?: string;
  createdAt?: any;
};

const toDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function UploadFakePage() {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [gallery, setGallery] = useState<UploadDoc[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ uid: u.uid, email: u.email });
      else setUser(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    try {
      const q = query(collection(db, "uploads"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => d.data() as UploadDoc);
      setGallery(docs);
    } catch (e) {
      console.error(e);
    }
  }

  async function uploadFilesAsDataURLs() {
    try {
      if (!user) return alert("Please sign in first at /test");
      setBusy(true);
      setStatus("Preparing files...");
      const jobs: Promise<void>[] = [];

      if (imageFiles) {
        Array.from(imageFiles).forEach((f) => {
          jobs.push(
            (async () => {
              setStatus(`Reading ${f.name}...`);
              const url = await toDataURL(f);
              setStatus(`Saving ${f.name} to Firestore...`);
              await addDoc(collection(db, "uploads"), {
                filename: f.name,
                url,
                kind: "image",
                ownerUid: user.uid,
                createdAt: serverTimestamp(),
              });
            })()
          );
        });
      }

      if (audioFile) {
        jobs.push(
          (async () => {
            setStatus(`Reading ${audioFile.name}...`);
            const url = await toDataURL(audioFile);
            setStatus(`Saving ${audioFile.name} to Firestore...`);
            await addDoc(collection(db, "uploads"), {
              filename: audioFile.name,
              url,
              kind: "audio",
              ownerUid: user.uid,
              createdAt: serverTimestamp(),
            });
          })()
        );
      }

      if (jobs.length === 0) return alert("Pick at least one file or use placeholder.");
      await Promise.all(jobs);
      setStatus("All saved! Fetching gallery...");
      await fetchGallery();
      setStatus("Done ✅");
    } catch (err: any) {
      console.error(err);
      alert("Upload error: " + (err?.message || err));
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(null), 1800);
    }
  }

  // placeholder: uses picsum for images and local sample audio if present
  async function addPlaceholder(kind: "image" | "audio") {
    if (!user) return alert("Please sign in first at /test");
    try {
      setBusy(true);
      setStatus("Creating placeholder...");
      if (kind === "image") {
        const seed = Date.now();
        const url = `https://picsum.photos/seed/${seed}/600/400`;
        await addDoc(collection(db, "uploads"), {
          filename: `placeholder-${seed}.jpg`,
          url,
          kind: "placeholder",
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
        });
      } else {
        // ensure you have /public/sample-audio.mp3 or change the path
        const url = "/sample-audio.mp3";
        await addDoc(collection(db, "uploads"), {
          filename: `placeholder-audio-${Date.now()}.mp3`,
          url,
          kind: "placeholder",
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      await fetchGallery();
      setStatus("Placeholder saved!");
    } catch (e) {
      console.error(e);
      alert("Error saving placeholder: " + (e as any)?.message || e);
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(null), 1200);
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Upload (Fake Storage) — Sign in required</h1>
        <p>
          Go to <a href="/test">/test</a> to signup/login, then return here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>📁 Upload (Fake Storage via Firestore URLs)</h1>
        <div>
          <span style={{ marginRight: 12 }}>{user.email || user.uid}</span>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        <h3>Images (you can choose multiple)</h3>
        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files)} />
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Voice note (optional)</h3>
        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
      </section>

      <div style={{ marginTop: 16 }}>
        <button onClick={uploadFilesAsDataURLs} disabled={busy}>
          ⬆️ Save selected to Firestore (data URLs)
        </button>

        <button style={{ marginLeft: 12 }} onClick={() => addPlaceholder("image")} disabled={busy}>
          🎨 Add image placeholder
        </button>

        <button style={{ marginLeft: 8 }} onClick={() => addPlaceholder("audio")} disabled={busy}>
          🔊 Add audio placeholder
        </button>
      </div>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      <section style={{ marginTop: 28 }}>
        <h2>Gallery (from Firestore)</h2>
        {gallery.length === 0 ? (
          <p>No uploads yet — add one above!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {gallery.map((g, i) => (
              <div key={i} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8 }}>
                <p style={{ fontSize: 12, margin: "6px 0" }}>{g.filename} • {g.kind}</p>
                {g.kind === "audio" ? (
                  <audio controls src={g.url} style={{ width: "100%" }} />
                ) : (
                  <img src={g.url} alt={g.filename} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
