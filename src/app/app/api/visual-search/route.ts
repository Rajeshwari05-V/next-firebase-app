import imghash from 'imghash';
import admin from '../../lib/firebase-admin'; // init admin SDK for scripts

function hamming(a: string, b: string) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

// Pseudo: compute qhash from uploaded image buffer (use imghash.hash on saved temp file)
const qhash = await imghash.hash('/tmp/upload.jpg');
const prods = await admin.firestore().collection('products').get();
const scored = prods.docs.map(d => ({ id: d.id, score: hamming(qhash, d.data().phash) }));
scored.sort((x,y)=>x.score-y.score);
res.json(scored.slice(0,8));
