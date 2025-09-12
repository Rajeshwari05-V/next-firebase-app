// app/api/visual-search/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import admin from '@/lib/firebase-admin'; // make sure this path resolves in your project
const imghash = require('imghash');

const fetchFn = (typeof fetch !== 'undefined') ? fetch : (...args: any[]) => require('node-fetch')(...args);

function safeUnlink(p: string | undefined) { try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch(e){} }

function hamming(a = '', b = '') {
  let dist = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

async function downloadToTemp(url: string) {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}.jpg`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageUrl = body.imageUrl;
    const imageBase64 = body.imageBase64; // optional
    const topK = Number(body.topK || 8);

    if (!imageUrl && !imageBase64) return NextResponse.json({ error: 'Send imageUrl or imageBase64' }, { status: 400 });

    let tmpPath: string | undefined;
    try {
      if (imageUrl) {
        tmpPath = await downloadToTemp(imageUrl);
      } else {
        // imageBase64 may be data:...;base64,AAA or just base64
        const match = typeof imageBase64 === 'string' && imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
        const b64 = match ? match[2] : imageBase64;
        const buffer = Buffer.from(b64, 'base64');
        tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}.png`);
        fs.writeFileSync(tmpPath, buffer);
      }

      const qhash = await imghash.hash(tmpPath);
      const prodsSnap = await admin.firestore().collection('products').get();
      const scored = prodsSnap.docs.map(d => {
        const data = d.data();
        const pHash = data.phash || '';
        const score = pHash ? hamming(qhash, String(pHash)) : Number.MAX_SAFE_INTEGER;
        return { id: d.id, score, title: data.title || null, imgs: data.imgs || [], phash: pHash };
      });

      scored.sort((a, b) => a.score - b.score);
      const results = scored.slice(0, topK);
      return NextResponse.json({ results });
    } finally {
      safeUnlink(tmpPath);
    }
  } catch (err: any) {
    console.error('visual-search error', err);
    return NextResponse.json({ error: err?.message || 'internal error' }, { status: 500 });
  }
}
