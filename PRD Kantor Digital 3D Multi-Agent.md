# PRD: Kantor Digital 3D Multi-Agent ("AgentOffice")

**Versi:** 1.0 (Draft) | **Tanggal:** 4 Oktober 2026

---

## 1. Ringkasan

AgentOffice adalah aplikasi web berupa **kantor virtual 3D** tempat pengguna "bekerja" bersama tim agent AI. Setiap agent punya peran (Lead Engineer, UI/UX, Debugger, dll), skill sendiri, dan **otak LLM yang bisa dipilih per agent** (Claude, Gemini, GPT, atau API custom yang kompatibel OpenAI). Pengguna memberi tugas, agent berkolaborasi, dan progres terlihat lewat animasi 3D di ruangan kantor.

## 2. Latar Belakang & Masalah

- Pengguna harus berpindah-pindah tool AI untuk tugas berbeda (coding, desain, debugging, riset).
- Chat biasa tidak memperlihatkan siapa mengerjakan apa dan sampai mana.
- Setiap penyedia LLM punya kekuatan berbeda, tapi sulit dipakai bersamaan dalam satu alur kerja.
- Interaksi AI terasa membosankan; visualisasi kantor membuat kerja multi-agent lebih mudah dipahami dan menyenangkan.

## 3. Tujuan & Non-Tujuan

**Tujuan**

1. Satu tempat untuk mendelegasikan tugas ke banyak agent spesialis.
2. Tiap agent dapat dikonfigurasi: peran, skill, prompt, tools, dan model LLM.
3. Mendukung multi-provider + custom endpoint OpenAI-compatible.
4. Visualisasi 3D real-time status kerja agent.
5. Meningkatkan produktivitas: waktu dari ide ke hasil lebih singkat.

**Non-Tujuan (v1)**

- Game/simulasi kantor yang kompleks (ekonomi, level, dll).
- Voice call real-time antar agent.
- Marketplace publik agent (masuk roadmap).

## 4. Target Pengguna

| Persona | Kebutuhan |
| --- | --- |
| Developer/AI engineer solo | Tim virtual: lead, UI/UX, debugger, reviewer |
| Founder/produk | Mengubah ide jadi PRD, desain, dan kode |
| Tim kecil | Workspace bersama dengan agent bersama |
| Power user | Pakai model/API sendiri (self-host, proxy, OpenRouter, dll) |

## 5. Daftar Agent Bawaan

| Agent | Tugas Utama | Skill/Tools Contoh |
| --- | --- | --- |
| **Lead Engineer** | Memecah tugas, arsitektur, review, mendelegasikan ke agent lain | Task planning, code review, arsitektur |
| **UI/UX Designer** | Wireframe, design system, review aksesibilitas | Generate layout, palet, komponen |
| **Frontend Dev** | Implementasi UI | React/HTML/CSS, sandbox preview |
| **Backend Dev** | API, database, integrasi | REST/SQL, schema design |
| **Debugger** | Analisis error, reproduksi bug, saran fix | Baca log, stack trace, run code |
| **QA/Tester** | Skenario & unit test | Test generation, checklist |
| **Product Manager** | PRD, user story, prioritas | Template PRD, backlog |
| **Researcher** | Riset web & ringkasan | Web search, summarization |
| **Writer/Docs** | Dokumentasi, README, konten | Markdown, tone control |

Pengguna dapat **membuat agent custom** (lihat 6.3).

## 6. Fitur & Kebutuhan Fungsional

### 6.1 Kantor 3D

- Ruangan 3D (Three.js / React Three Fiber) dengan meja per agent, ruang meeting, papan tugas.
- Avatar agent beranimasi berdasarkan status: **idle, thinking, typing/coding, berdiskusi, selesai, error**.
- Klik agent → buka panel chat & detail tugas.
- Indikator di atas kepala agent (bubble status, progress).
- Kamera: orbit, fokus otomatis ke agent yang sedang aktif, toggle mode 2D ringan.
- Tema ruangan dapat diganti (modern, loft, ruang kapal, dll).
- **Mode performa rendah** untuk perangkat lemah (kualitas grafis, matikan animasi).

### 6.2 Manajemen Tugas & Kolaborasi

- Pengguna membuat tugas lewat chat ke Lead Engineer atau langsung ke agent tertentu.
- Lead Engineer menghasilkan rencana → membagi subtugas → agent mengerjakan paralel/berurutan.
- **Papan tugas** (To Do, In Progress, Review, Done) sinkron dengan animasi.
- Agent dapat saling mengirim pesan & handoff hasil (terlihat di ruang meeting 3D).
- Approval gate: pengguna menyetujui langkah penting (menjalankan kode, mengubah file, memanggil tool berbiaya).
- Riwayat tugas, log aktivitas, dan hasil (artifact: kode, dokumen, desain).

### 6.3 Konfigurasi Agent

Setiap agent memiliki:

- Nama, avatar 3D, peran, deskripsi.
- **System prompt** dan gaya kerja.
- **Skill** (modul yang dapat dipasang/dilepas): kumpulan instruksi + tools, format `skill.md`.
- **Tools** yang diizinkan (web search, code runner, baca/tulis file, GitHub, dll).
- **Otak (Model)**: provider + model + parameter (temperature, max tokens).
- Memori: ringkasan percakapan & knowledge per agent (opsional).
- Template agent dapat diduplikasi, diekspor, dan diimpor (JSON).

### 6.4 Multi-Provider LLM ("Brain Router")

- Provider bawaan: **Anthropic (Claude), Google (Gemini), OpenAI (GPT)**, dan lainnya (OpenRouter, Groq, dll).
- **Custom API OpenAI-compatible**: pengguna mengisi `Base URL`, `API Key`, `Model name`, header tambahan opsional (cocok untuk Ollama, LM Studio, vLLM, LiteLLM, proxy sendiri).
- Tombol **Test Connection** dan validasi model.
- Fallback otomatis: jika model utama gagal/limit, pakai model cadangan.
- Rekomendasi model per peran (mis. reasoning kuat untuk Lead Engineer, model cepat untuk Researcher).
- Adapter layer: satu antarmuka internal (chat, streaming, tool calling, vision) yang dipetakan ke tiap provider.
- Pelacakan penggunaan token & estimasi biaya per agent/tugas.

### 6.5 Akun & Workspace

- Registrasi/login (email, Google/GitHub).
- Banyak workspace/proyek; undang anggota (peran: owner, editor, viewer) — fase 2.
- **API key disimpan terenkripsi** (server-side, atau mode BYOK lokal di browser).

### 6.6 Artifact & Ekspor

- Hasil agent tersimpan sebagai artifact: kode, markdown, diagram, file.
- Ekspor ke ZIP, Markdown, atau push ke GitHub.
- Preview langsung untuk output web (iframe sandbox).

## 7. Alur Pengguna Utama

1. Pengguna masuk → memilih/membuat workspace → memasuki kantor 3D.
2. Menambah/mengatur agent dan memilih otak tiap agent (atau mengisi custom API).
3. Mengetik tugas ke Lead Engineer: *"Buatkan aplikasi todo dengan login."*
4. Lead Engineer membuat rencana, pengguna menyetujui.
5. Subtugas didistribusikan: UI/UX membuat desain → Frontend/Backend mengimplementasi → Debugger & QA memeriksa.
6. Animasi menunjukkan siapa bekerja; papan tugas ikut ter-update.
7. Pengguna mereview hasil, minta revisi, lalu ekspor.

## 8. Kebutuhan Non-Fungsional

| Aspek | Target |
| --- | --- |
| Performa 3D | ≥ 30 FPS di laptop menengah; mode hemat untuk perangkat lemah |
| Latensi UI | Respons klik \< 200 ms; streaming token ke UI |
| Keamanan | Enkripsi API key, sandbox untuk eksekusi kode, rate limit |
| Privasi | Data pengguna tidak dipakai untuk melatih model; opsi hapus data |
| Skalabilitas | Min. 10 agent aktif per workspace |
| Keandalan | Retry + fallback model; tugas dapat dilanjutkan setelah gagal |
| Aksesibilitas | Mode 2D/teks, navigasi keyboard, kontras memadai |
| Responsif | Desktop utama; mobile tampilan ringkas (list agent + chat) |

## 9. Arsitektur Teknis (Usulan)

- **Frontend:** React + TypeScript, React Three Fiber/Three.js, Zustand, Tailwind.
- **Backend:** Node.js (NestJS/Fastify) atau Python (FastAPI); WebSocket/SSE untuk streaming.
- **Orkestrasi agent:** event-driven task queue (mis. BullMQ), state machine per agent.
- **LLM gateway:** adapter per provider + adapter OpenAI-compatible generik.
- **Database:** PostgreSQL (data), Redis (antrian/state), object storage (artifact), pgvector (memori opsional).
- **Eksekusi kode:** container sandbox terisolasi (mis. Docker/Firecracker), dengan batas waktu & resource.
- **Aset 3D:** glTF/GLB, animasi via skeletal animation; lazy loading.

## 10. Model Data Ringkas

- `User`, `Workspace`, `Member`
- `Agent` (role, system_prompt, model_config_id, skills\[\], tools\[\], avatar)
- `ModelConfig` (provider, base_url, api_key_ref, model, params, fallback_id)
- `Skill` (nama, instruksi, tools, versi)
- `Task` (judul, status, parent_id, assigned_agent, hasil)
- `Message` (agent/user, konten, task_id)
- `Artifact` (tipe, isi/URL, versi)
- `UsageLog` (agent, model, token_in/out, biaya)

## 11. Metrik Keberhasilan

- Aktivasi: ≥ 60% pengguna baru menyelesaikan 1 tugas multi-agent di sesi pertama.
- Retensi minggu ke-4 ≥ 25%.
- Rata-rata ≥ 3 agent aktif per workspace.
- ≥ 30% pengguna mengonfigurasi lebih dari satu provider/custom API.
- Tingkat keberhasilan tugas (diterima pengguna tanpa revisi besar) ≥ 70%.

## 12. Roadmap

| Fase | Cakupan |
| --- | --- |
| **MVP (6–8 minggu)** | Kantor 3D dasar (1 ruangan), 4 agent (Lead, UI/UX, Dev, Debugger), chat + papan tugas, provider Claude/Gemini/GPT + custom OpenAI-compatible, BYOK |
| **v1.1** | Agent lengkap, skill.md, approval gate, artifact & ekspor, fallback model, usage tracking |
| **v1.2** | Kolaborasi tim, integrasi GitHub, memori agent, tema ruangan |
| **v2.0** | Marketplace agent/skill, voice, MCP/tools eksternal, self-host |

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Biaya token membengkak | Batas anggaran per tugas, estimasi biaya, model murah untuk tugas ringan |
| Agent saling loop/berbicara tak berujung | Batas iterasi, timeout, kontrol Lead Engineer |
| Kebocoran API key | Enkripsi, tidak ditampilkan ulang, mode BYOK lokal |
| Eksekusi kode berbahaya | Sandbox terisolasi, approval pengguna |
| 3D berat di perangkat lemah | Mode 2D/hemat, optimasi aset, LOD |
| Inkonsistensi antar provider (tool calling, format) | Adapter layer + test kompatibilitas per provider |

## 14. Pertanyaan Terbuka

1. Platform awal: web saja, atau juga desktop (Electron/Tauri)?
2. Model bisnis: gratis + BYOK, langganan, atau kredit?
3. Apakah agent boleh bekerja otomatis tanpa approval (mode autopilot)?
4. Gaya visual 3D: low-poly, stylized, atau realistis?
5. Perlukah dukungan bahasa Indonesia penuh di UI dan prompt bawaan agent?

---

## Lampiran A: Contoh Konfigurasi Custom API (OpenAI-compatible)

```json
{
  "provider": "custom-openai",
  "base_url": "https://api.contoh-saya.com/v1",
  "api_key": "••••••••",
  "model": "nama-model-saya",
  "temperature": 0.3,
  "max_tokens": 4096,
  "extra_headers": { "X-Org": "tim-saya" }
}
```

## Lampiran B: Contoh Definisi Agent

```json
{
  "name": "Debugger",
  "role": "Menganalisis error dan memperbaiki bug",
  "model": { "provider": "anthropic", "model": "pilih-di-ui", "fallback": "custom-openai" },
  "skills": ["log-analysis", "root-cause", "fix-suggestion"],
  "tools": ["code_runner", "file_read", "web_search"],
  "system_prompt": "Kamu adalah debugger senior. Reproduksi masalah, cari akar penyebab, usulkan perbaikan minimal."
}
```