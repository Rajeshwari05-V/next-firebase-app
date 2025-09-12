// scripts/compute-phash.js
// Usage: node scripts/compute-phash.js
const imghash = require('imghash');
const admin = require('../lib/firebase-admin');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use global fetch (Node 18+) or fallback to node-fetch if not available
const fetchFn = (typeof fetch !== 'undefined') ? fetch : (...args) => require('node-fetch')(...args);

async function downloadToTemp(url) {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpPath = path.join(os.tmpdir(), `phash-${Date.now()}.jpg`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
}

function safeUnlink(p) {
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e){}
}

function hamming(a = '', b = '') {
  let dist = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

async function main() {
  console.log('Reading products from Firestore...');
  const snapshot = await admin.firestore().collection('products').get();

  console.log(`Found ${snapshot.size} products`);
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const imgs = data.imgs || [];
    const img = imgs[0];
    if (!img) {
      console.log('Skipping', doc.id, '(no images)');
      continue;
    }
    let tmp;
    try {
      tmp = await downloadToTemp(img);
      // imghash.hash returns a string (hex)
      const hash = await imghash.hash(tmp);
      await doc.ref.update({ phash: hash });
      console.log('Updated', doc.id, 'phash=', hash);
    } catch (err) {
      console.error('Failed for', doc.id, err.message || err);
    } finally {
      safeUnlink(tmp);
    }
  }

  console.log('Done.');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
