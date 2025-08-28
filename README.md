# AI‑Powered Marketplace Assistant for Local Artisans

> Repository: **next-firebase-app**  
> Status: Day 1 complete ✅ (scaffold + docs)

---

## 🌍 Problem
Local artisans struggle to sell online due to low‑quality product content, limited discovery, weak trust signals, and language barriers.

## 🎯 Solution (What this project builds)
A **free‑first** prototype that turns an artisan’s **photos + short voice note** into a multilingual, trust‑rich product page in **under 3 minutes**, plus:
- **AI Catalog Studio** → cleans photos, writes title/bullets/story, generates audio narration.
- **Visual Search** → buyers upload a room/outfit photo to find matching crafts.
- **Co‑Create Configurator** → buyers pick motif/colors/size and see a live preview; system emits a spec JSON for the artisan.
- **Craft Passport (QR)** → provenance page with signed JSON of technique, materials, and short making‑clip hashes.
- **One‑Click Publish** → public mini‑store URL + WhatsApp share.

> Judges asked for *“not just a chatbot”* — this is a **multimodal system** with real utility and trust.

---

## 🧱 Architecture (MVP)
**Frontend**: Next.js (App Router, PWA ready)

**Auth**: Firebase Auth (Phone OTP) — free Spark plan

**Database**: Firestore (artisan, product, passport, order) — free tier

**Storage**: Firebase/Cloud Storage for media — free tier

**AI (free‑first path for prototype)**:
- Text generation: start with rule‑based templates (Day 3 adds Gemini/Vertex if credits available)
- Photo cleanup: simple background removal via open‑source lib or pre‑processed samples
- STT/TTS: optional; can stub with sample transcripts/audio to stay free

**Search**: simple cosine‑similarity (FAISS/JS embeddings) for Day 5 prototype

---

## 📐 Data Model (essentials)
```
artisan: { id, name, langs[], region, whatsapp }
product: { id, artisan_id, title, desc[], tags[], imgs[], price_suggested, passport_id, options{size,color} }
passport: { id, product_id, signed_meta{ technique, timehashes[], region }, qr_url }
order: { id, product_id, buyer_specs{}, status, price_final }
```

---

## 🗓️ Roadmap (10‑Day Prototype)
**P0 (must show to judges)**
1) Photos + voice ⇒ page (EN + 1 local), audio narration  
2) Visual search from buyer image  
3) Co‑create preview + spec JSON  
4) Craft Passport (QR → signed JSON)  
5) One‑click publish + WhatsApp share

**Day‑wise**
- **Day 1** – ✅ Scaffold Next.js, repo, README
- **Day 2** – Media pipeline: upload → storage; background remove/compress worker (stub OK)
- **Day 3** – Voice → transcript → generate title/bullets/story (template), translation + TTS (stub/sample)
- **Day 4** – Public product page + mini‑store + share link
- **Day 5** – Visual search (embeddings index, top‑k UI)
- **Day 6** – Co‑Create (color/size/motif) → preview & spec JSON
- **Day 7** – Craft Passport: sign JSON + QR rendering
- **Day 8** – i18n (EN + HI + 1 South Indian lang), PWA polish
- **Day 9** – Seed 3 artisans, test T2List < 3m, record demo
- **Day 10** – Submission pack: README, PRD 1‑pager, deck, demo video

---

## 🧪 Local Setup
### Prerequisites
- Node 18+
- Git

### Install & run
```bash
# clone
git clone https://github.com/Rajeshwari05-V/next-firebase-app.git
cd next-firebase-app

# install deps
npm install

# env (create from example)
cp .env.local.example .env.local

# dev
npm run dev
```

### `.env.local.example`
```ini
# Firebase (Spark plan – free)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> Tip: Keep secrets out of commits. Never commit your filled `.env.local`.

---

## ✅ Day‑1 Progress Log 
- [x] Next.js scaffolded (`create-next-app`)
- [x] Repo connected & pushed to GitHub
- [x] README with problem, solution, MVP, roadmap (this file)
- [ ] Firebase init & config file
- [ ] Upload page stub
      
---

### ✅ Day 2
- Installed & configured **Firebase**
- Added **Firebase Auth** and **Firestore**
- Created **Firebase Test Page**:
  - Signup/Login with Email & Password
  - Add user to Firestore
  - Fetch users and display them  

---

## 📄 PRD & Docs (to be added in `/docs`)
- `PRD.md` – problem → user stories → acceptance criteria
- `demo-script.md` – 2–3 minute flow
- `architecture.md` – diagrams + trade‑offs

---

## 📜 License
MIT (or your choice)

---

## 🙏 Acknowledgements
Google Cloud GenAI Hackathon community & mentors; open‑source libraries used in the prototype.

