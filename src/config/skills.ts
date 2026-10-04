// ============================================
// AgentOffice - Specialist Skills Registry (24 Skills)
// ============================================
import type { Skill, SkillCategory } from '../types';

export const SKILLS_CATALOG: Skill[] = [
  // --- LEAD ARCHITECT (Arka - AO) ---
  {
    id: 'task-planning',
    name: 'Task Decomposition & Planning',
    category: 'architecture',
    icon: '📋',
    description: 'Memecah PRD atau tujuan kompleks menjadi subtugas terukur dengan hierarki dependensi dan estimasi waktu.',
    instructions: `### Instruksi Skill: Task Decomposition
1. Identifikasi output utama (artefak desain, kode, pengujian).
2. Urutkan pekerjaan secara kronologis: Desain -> Implementasi -> Pengujian.
3. Tetapkan kriteria penerimaan (Acceptance Criteria) yang jelas untuk tiap subtugas.
4. Tentukan spesialis yang bertanggung jawab tanpa ambiguitas.`,
    tools: ['task_planner', 'dependency_graph', 'timeline_calc'],
  },
  {
    id: 'system-architecture',
    name: 'Fullstack & Cloud Architecture',
    category: 'architecture',
    icon: '🏛️',
    description: 'Merancang arsitektur sistem modular, skema basis data, kontrak antarmuka API, dan Architecture Decision Records (ADR).',
    instructions: `### Instruksi Skill: System Architecture
1. Terapkan prinsip Single Responsibility dan pemisahan concerns.
2. Definisikan kontrak tipe data TypeScript secara ketat sebelum implementasi dimulai.
3. Pastikan komunikasi antar modul terisolasi dan mudah diuji secara independen.`,
    tools: ['adr_generator', 'schema_designer', 'contract_validator'],
  },
  {
    id: 'code-review',
    name: 'Architectural Code Review',
    category: 'architecture',
    icon: '🔍',
    description: 'Memeriksa kualitas kode tingkat lanjut, kepatuhan arsitektur, clean code, serta prinsip SOLID dan DRY.',
    instructions: `### Instruksi Skill: Code Review
1. Periksa apakah kode mengikuti standar penulisan kode modern.
2. Pastikan tidak ada duplikasi logika bisnis (DRY).
3. Verifikasi penanganan error graceful di semua operasi async.`,
    tools: ['ast_linter', 'complexity_analyzer', 'diff_viewer'],
  },
  {
    id: 'team-delegation',
    name: 'Autonomous Multi-Agent Delegation',
    category: 'architecture',
    icon: '🎯',
    description: 'Mendelegasikan tanggung jawab ke agen spesialis dengan konteks dan parameter operasional akurat.',
    instructions: `### Instruksi Skill: Multi-Agent Delegation
1. Tag agen penerima dengan spesifik (@Tiara, @Fajar, @Dimas, @Reza, @Gilang).
2. Berikan konteks hasil tahap sebelumnya agar tidak perlu mengulang pertanyaan.
3. Tunggu konfirmasi penyelesaian sebelum melanjutkan ke tahap berikutnya.`,
    tools: ['agent_router', 'context_handoff', 'notification_dispatch'],
  },
  {
    id: 'sprint-management',
    name: 'Agile Sprint & Backlog Prioritization',
    category: 'architecture',
    icon: '⚡',
    description: 'Mengelola siklus sprint mingguan, estimasi velocity, prioritas backlog, dan pelaporan progres proyek.',
    instructions: `### Instruksi Skill: Sprint Management
1. Kategorikan backlog ke dalam: Deadline Dekat, Nunggu Owner, Ide/Nanti.
2. Prioritaskan item yang menjadi penghambat (blocker) agent lain.
3. Evaluasi kapasitas tiap agent agar tidak terjadi bottleneck.`,
    tools: ['burndown_chart', 'velocity_tracker', 'backlog_matrix'],
  },

  // --- PRODUCT MANAGER (Tiara - PM) ---
  {
    id: 'prd-scoping',
    name: 'PRD & Feature Scoping',
    category: 'research',
    icon: '📑',
    description: 'Menyusun dokumen spesifikasi produk (PRD), batasan fitur MVP, dan metrik keberhasilan produk.',
    instructions: `### Instruksi Skill: PRD Scoping
1. Rumuskan masalah pengguna, tujuan bisnis, dan scope in-scope vs out-of-scope.
2. Buat skenario penggunaan (use cases) yang jelas untuk tim pengembang.
3. Validasi batasan waktu dan alokasi resource bersama Lead Engineer.`,
    tools: ['prd_template', 'scope_matrix', 'kpi_builder'],
  },
  {
    id: 'client-coordination',
    name: 'Client Brief & Requirement Gathering',
    category: 'research',
    icon: '🤝',
    description: 'Menerjemahkan permintaan klien ke dalam requirement teknis dan menyusun laporan status berkala.',
    instructions: `### Instruksi Skill: Client Coordination
1. Tangkap inti kebutuhan klien dan klarifikasi ekspektasi output.
2. Sajikan pembaruan dalam bahasa yang mudah dipahami bisnis maupun teknis.
3. Pastikan milestone disetujui klien sebelum rilis final.`,
    tools: ['brief_analyzer', 'client_report_gen', 'milestone_signer'],
  },
  {
    id: 'user-story-mapping',
    name: 'User Story & Journey Mapping',
    category: 'design',
    icon: '🗺️',
    description: 'Memetakan alur perjalanan pengguna (user journey), persona, dan acceptance criteria tiap cerita.',
    instructions: `### Instruksi Skill: Story Mapping
1. Tulis cerita dengan format: Sebagai [user], Saya ingin [tindakan], Sehingga [manfaat].
2. Identifikasi titik gesekan (pain points) utama dalam perjalanan pengguna.
3. Koordinasikan bersama UI/UX untuk wireframe yang selaras.`,
    tools: ['journey_canvas', 'persona_builder', 'criteria_checklist'],
  },
  {
    id: 'deadline-tracking',
    name: 'Milestone & Deadline Tracking',
    category: 'research',
    icon: '⏱️',
    description: 'Memantau tanggal target rilis, status delivery antar agen, dan mitigasi risiko keterlambatan.',
    instructions: `### Instruksi Skill: Deadline Tracking
1. Pantau progress taskboard secara harian.
2. Berikan peringatan dini (early warning) jika ada tugas tertunda di fase review.
3. Koordinasikan re-estimasi jika ada perubahan scope di tengah jalan.`,
    tools: ['gantt_chart', 'calendar_sync', 'sla_monitor'],
  },

  // --- FRONTEND DEV (Fajar - FE) ---
  {
    id: 'react-ts-dev',
    name: 'React 19 & TypeScript Core Engineering',
    category: 'development',
    icon: '⚛️',
    description: 'Mengimplementasikan komponen React fungsional, custom hooks, typing ketat TypeScript, dan clean architecture.',
    instructions: `### Instruksi Skill: React & TypeScript
1. Gunakan TypeScript strict mode tanpa 'any' yang tidak perlu.
2. Pisahkan state logic ke custom hooks jika komponen memiliki logika kompleks.
3. Terapkan React memoization dengan bijak untuk mencegah re-render berlebih.`,
    tools: ['ts_compiler', 'jsx_formatter', 'hook_linter'],
  },
  {
    id: 'threejs-graphics',
    name: 'Three.js & 3D WebGL Canvas Rendering',
    category: 'development',
    icon: '🌐',
    description: 'Mengembangkan visualisasi ruang 3D, material PBR, pencahayaan dinamis, dan optimasi siklus useFrame.',
    instructions: `### Instruksi Skill: Three.js Graphics
1. Gunakan geometri instancing dan bagikan material untuk menghemat draw calls.
2. Optimalkan animasi di useFrame agar delta waktu stabil pada 60 FPS.
3. Terapkan level of detail (LOD) pada objek berjarak jauh.`,
    tools: ['three_inspector', 'shader_compiler', 'fps_monitor'],
  },
  {
    id: 'state-management',
    name: 'Zustand Reactive State Architecture',
    category: 'development',
    icon: '🔄',
    description: 'Mengelola state aplikasi global reaktif yang tersinkronisasi antar panel, canvas 3D, dan event multi-agent.',
    instructions: `### Instruksi Skill: State Management
1. Hindari mutasi langsung pada state objek atau array.
2. Pisahkan selector secara granular agar komponen hanya merender ulang jika datanya berubah.
3. Simpan perubahan persisten penting ke local storage browser.`,
    tools: ['state_snapshot', 'action_dispatcher', 'store_profiler'],
  },
  {
    id: 'api-integration',
    name: 'Streaming API & Multi-Provider Client',
    category: 'development',
    icon: '⚡',
    description: 'Menangani komunikasi streaming Server-Sent Events / Fetch Streaming ke OpenAI, Claude, Gemini, dan local LLM.',
    instructions: `### Instruksi Skill: Streaming API Client
1. Proses stream token secara progresif menggunakan TextDecoder.
2. Tangani reconnection dan fallback provider jika kuota atau koneksi gagal.
3. Catat kalkulasi token usage untuk pelacakan estimasi biaya.`,
    tools: ['stream_reader', 'sse_client', 'token_counter'],
  },

  // --- BACKEND DEVELOPER (Dimas - DE) ---
  {
    id: 'api-architecture',
    name: 'RESTful & Real-Time Microservices',
    category: 'development',
    icon: '🔌',
    description: 'Merancang endpoint API berkinerja tinggi, websocket handler, middleware auth, dan webhook integrator.',
    instructions: `### Instruksi Skill: API Architecture
1. Buat endpoint RESTful yang idempotent dengan status code HTTP yang benar.
2. Terapkan rate limiter dan validasi payload skema zod/joi.
3. Desain struktur JSON response yang konsisten (data, error, meta).`,
    tools: ['postman_runner', 'rate_limiter', 'openapi_spec'],
  },
  {
    id: 'database-schema',
    name: 'SQLite & Relational Database Design',
    category: 'development',
    icon: '🗄️',
    description: 'Merancang schema database relasional, foreign keys, index, indexing performa tinggi, dan migrasi skema.',
    instructions: `### Instruksi Skill: Database Schema
1. Lakukan normalisasi tabel hingga 3NF untuk integritas data.
2. Buat index pada kolom pencarian dan foreign key.
3. Sediakan file migration dan seed script untuk data awal.`,
    tools: ['migration_manager', 'query_explainer', 'sqlite_studio'],
  },
  {
    id: 'query-optimization',
    name: 'SQL Performance & Query Tuning',
    category: 'development',
    icon: '📈',
    description: 'Menganalisis EXPLAIN QUERY PLAN, mencegah N+1 query problem, dan mengoptimalkan transaksi ACID.',
    instructions: `### Instruksi Skill: Query Tuning
1. Hindari SELECT *; ambil hanya kolom yang dibutuhkan.
2. Gunakan batch insert/update dalam satu database transaction.
3. Pantau execution time query di bawah 20ms.`,
    tools: ['sql_explainer', 'index_advisor', 'slow_query_log'],
  },

  // --- UI/UX & CONTENT DESIGNER (Reza - SM) ---
  {
    id: 'wireframing',
    name: 'Interactive Wireframe Generator',
    category: 'design',
    icon: '📐',
    description: 'Menghasilkan tata letak visual, struktur hierarki antarmuka, dan responsive layout grid untuk web/mobile.',
    instructions: `### Instruksi Skill: Wireframing
1. Utamakan kemudahan navigasi pengguna (intuitive user flow).
2. Tentukan hierarki visual yang jelas: Heading 1, Card utama, Action Button.
3. Pastikan layout adaptif untuk tampilan desktop maupun mobile.`,
    tools: ['grid_builder', 'wireframe_svg', 'layout_calculator'],
  },
  {
    id: 'design-system',
    name: 'Modern & Cyberpunk Design Tokens',
    category: 'design',
    icon: '🎨',
    description: 'Merancang sistem token desain lengkap: palet warna HSL/Hex, typography scale, spacing, dan efek glassmorphism.',
    instructions: `### Instruksi Skill: Design System
1. Gunakan palet gelap berestetika tinggi (Dark Cyberpunk/Neon Glassmorphism).
2. Pertahankan rasio kontras warna teks di atas latar belakang (minimal 4.5:1).
3. Buat variabel CSS standar untuk warna, radius, dan bayangan glow.`,
    tools: ['color_harmonies', 'css_variables_export', 'token_validator'],
  },
  {
    id: 'accessibility-audit',
    name: 'WCAG 2.1 Accessibility Audit',
    category: 'design',
    icon: '👁️',
    description: 'Memastikan kepatuhan aksesibilitas: rasio kontras teks, navigasi keyboard tab-order, dan atribut ARIA.',
    instructions: `### Instruksi Skill: Accessibility Audit
1. Verifikasi kecukupan kontras teks dan ikon di semua status hover/focus.
2. Pastikan elemen interaktif memiliki focus ring yang jelas.
3. Hindari penggunaan warna sebagai satu-satunya indikator status.`,
    tools: ['contrast_checker', 'aria_validator', 'focus_trap_check'],
  },
  {
    id: 'social-media-assets',
    name: 'Viral Visuals & Social Campaign',
    category: 'design',
    icon: '📱',
    description: 'Merancang thumbnail video viral, banner promosi sosial media, dan aset visual kampanye digital.',
    instructions: `### Instruksi Skill: Social Media Assets
1. Buat komposisi visual hook dalam 3 detik pertama.
2. Gunakan tipografi bold yang mudah dibaca di layar smartphone kecil.
3. Pastikan safe-zone rasio 9:16 untuk TikTok/Instagram Reels.`,
    tools: ['aspect_ratio_cropper', 'visual_hook_generator', 'color_pop'],
  },

  // --- CONTENT WRITER & QA (Gilang - CW) ---
  {
    id: 'seo-copywriting',
    name: 'SEO Content & Viral Copywriting',
    category: 'research',
    icon: '✍️',
    description: 'Menulis artikel SEO ramah search engine, copywriting landing page konversi tinggi, dan skrip video pendek.',
    instructions: `### Instruksi Skill: SEO Copywriting
1. Sisipkan keyword utama secara natural di heading H1, H2, dan meta description.
2. Tulis hook pembuka yang memicu rasa ingin tahu (curiosity gap).
3. Sertakan Call to Action (CTA) yang jelas dan persuasif.`,
    tools: ['keyword_density', 'readability_scorer', 'headline_analyzer'],
  },
  {
    id: 'runtime-debugger',
    name: 'Root-Cause Error & Stack Trace Diagnosis',
    category: 'testing',
    icon: '🐛',
    description: 'Mendiagnosis bug, membaca stack trace runtime, unhandled async rejection, dan memberikan rekomendasi perbaikan presisi.',
    instructions: `### Instruksi Skill: Runtime Debugging
1. Telusuri stack trace hingga baris pertama kode pengguna (bukan vendor modules).
2. Jelaskan penyebab utama (root cause) dengan bahasa yang ringkas dan jelas.
3. Berikan solusi kode koreksi (drop-in replacement fix) yang siap diterapkan.`,
    tools: ['stack_analyzer', 'sourcemap_lookup', 'exception_interceptor'],
  },
  {
    id: 'performance-profiler',
    name: 'GPU & Memory Leak Profiling',
    category: 'testing',
    icon: '⏱️',
    description: 'Menganalisis performa WebGL, alokasi memori heap, deteksi event listener leak, dan memastikan target 60 FPS.',
    instructions: `### Instruksi Skill: Performance Profiling
1. Pantau alokasi buffer geometri dan tekstur WebGL yang tidak ter-dispose.
2. Identifikasi re-render siklik pada komponen React.
3. Berikan rekomendasi penurunan beban CPU/GPU jika waktu render frame > 16.6ms.`,
    tools: ['heap_profiler', 'frame_rate_bench', 'memory_leak_detector'],
  },
  {
    id: 'unit-test-gen',
    name: 'Automated Unit & Integration Test Generation',
    category: 'testing',
    icon: '🧪',
    description: 'Menyusun skenario pengujian komprehensif, unit test fungsi kritis, boundary edge case, dan acceptance assertion.',
    instructions: `### Instruksi Skill: Unit Test Generation
1. Uji kondisi batas (null, undefined, empty array, timeout network).
2. Gunakan mock service untuk panggilan API eksternal.
3. Pastikan test suite dapat dijalankan secara deterministik dan cepat.`,
    tools: ['test_generator', 'assertion_validator', 'coverage_estimator'],
  },
  {
    id: 'docs-generator',
    name: 'Technical Docs & Markdown Generator',
    category: 'research',
    icon: '📖',
    description: 'Menghasilkan dokumentasi teknis sistem, README profesional, panduan setup, dan dokumentasi arsitektur.',
    instructions: `### Instruksi Skill: Docs Generator
1. Buat struktur rapi: Pendahuluan, Arsitektur, Instalasi, Contoh Pemanggilan.
2. Sertakan blok kode dengan syntax highlight yang tepat.
3. Tulis penjelasan yang komprehensif untuk pengembang lain.`,
    tools: ['markdown_formatter', 'api_doc_extractor', 'changelog_builder'],
  },
];

export const SKILLS_REGISTRY = SKILLS_CATALOG;

export const SKILL_CATEGORIES: { id: SkillCategory; name: string; icon: string }[] = [
  { id: 'architecture', name: 'Architecture', icon: '🏛️' },
  { id: 'design', name: 'UI/UX & Creative', icon: '🎨' },
  { id: 'development', name: 'Development', icon: '💻' },
  { id: 'testing', name: 'QA & Testing', icon: '🧪' },
  { id: 'devops', name: 'DevOps & Cloud', icon: '☁️' },
  { id: 'research', name: 'Product & Docs', icon: '📊' },
];

export function getSkillById(skillId: string): Skill | undefined {
  return SKILLS_CATALOG.find((s) => s.id === skillId);
}

export function getSkillsForAgent(skillIds: string[]): Skill[] {
  return skillIds
    .map((id) => getSkillById(id))
    .filter((s): s is Skill => Boolean(s));
}

