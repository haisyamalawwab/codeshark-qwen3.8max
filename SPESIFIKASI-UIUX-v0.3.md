# SPESIFIKASI UI/UX — CodeShark v0.3

> Companion dari `ANALISIS.md` (v0.2). Tanggal: 2026-10-05.
> **Fokus:** meningkatkan kualitas *gameplay feel* dan *interface* — HUD, kejelasan syarat rank, onboarding, layar hasil, mobile, aksesibilitas.
> **Sumber:** dokumen `ANALISIS.md` plus apa yang bisa disimpulkan dari arsitektur yang Anda jelaskan (React + Vite + TypeScript, `src/components/TypingGame.tsx`, `src/index.css`, `src/lib/api`, `api/index.php`, `database/codeshark.sql`).
> **Catatan penting:** saya belum membaca kode sumber Anda. Semua cuplikan kode di dokumen ini adalah *pola implementasi* yang perlu disesuaikan dengan nama variabel dan komponen aktual. Daftar file yang perlu saya lihat untuk menghasilkan diff persis ada di [§17](#17-file-yang-perlu-saya-lihat-untuk-membuat-diff-persis).

---

## Daftar Isi

| § | Isi |
|---|---|
| [0](#0-ringkasan-eksekutif) | Ringkasan eksekutif — 12 keputusan desain |
| [1](#1-asumsi-dan-peta-ke-kode-anda) | Asumsi dan peta ke kode Anda |
| [2](#2-audit-uiux-singkat-12-masalah) | Audit: 12 masalah UI/UX |
| [3](#3-design-system-v3) | Design system v3 (token, tipografi, motion) |
| [4](#4-model-informasi-dan-alur-layar) | Model informasi dan alur layar |
| [5](#5-onboarding-dan-first-run) | Onboarding dan first-run |
| [6](#6-layar-home-dan-peta-misi) | Layar Home dan peta misi |
| [7](#7-countdown-dan-transisi-mulai) | Countdown dan transisi mulai |
| [8](#8-hud-redesign-inti) | **HUD redesign (inti)** |
| [9](#9-layar-hasil-redesign) | **Layar Hasil redesign** |
| [10](#10-dashboard-dan-riwayat) | Dashboard, statistik, dan riwayat |
| [11](#11-mobile-dan-touch) | Mobile dan touch |
| [12](#12-aksesibilitas) | Aksesibilitas |
| [13](#13-microcopy-bahasa-indonesia) | Microcopy Bahasa Indonesia |
| [14](#14-instrumentasi-dan-analytics) | Instrumentasi (terhubung ke MySQL) |
| [15](#15-roadmap-implementasi) | Roadmap implementasi per fase |
| [16](#16-qa--test-checklist) | QA dan test checklist |
| [17](#17-file-yang-perlu-saya-lihat-untuk-membuat-diff-persis) | File yang perlu dikirim untuk diff persis |

---

## 0. Ringkasan Eksekutif

Dua prinsip yang mengikat seluruh dokumen ini:

1. **Pemain harus selalu tahu apakah dia sedang menang atau kalah** — real-time, bukan baru setelah selesai.
2. **Setiap layar harus bisa menjelaskan dirinya sendiri** — Particularly, layar hasil harus menjawab "kenapa saya dapat rank ini" dan "apa yang harus saya perbaiki".

Tujuan akhirnya menghapus *opacity* (kekaburan) yang Anda identifikasi di ANALISIS §4.3, §4.5, dan §4.8.

| # | Keputusan desain | Masalah yang diselesaikan (ANALISIS) |
|---|---|---|
| 1 | **Rank Trajectory HUD** — tiga chip syarat rank (ACC / HP / WPM) live di layar, berubah hijau saat terpenuhi | 4.3 — syarat S ganda dan tersembunyi |
| 2 | **Layar hasil berbasis alasan, bukan angka** — headline menjelaskan penyebab rank | 4.3, 4.5 |
| 3 | **Waterfall skor** — setiap poin terlihat asal-usulnya | 4.1 — skor buta terhadap apa pun |
| 4 | **Keycap Hint** — tiga karakter berikutnya tampil di guide QWERTY beserta posisi jarinya | 4.4, 4.5 — belajar tanda baca |
| 5 | **Damage Log ringkas** — delapan slot karakter terakhir yang salah, dengan karakter target di bawahnya | 4.5, 4.6 — umpan balik yang mengajari |
| 6 | **Overdrive telegraph** — cincin hitung mundur 1,5 detik dan banner "×2 selama 8 dtk" | §2 — respons overdrive |
| 7 | **Ruang Latihan** 60 detik sebagai misi #0, tidak bisa gagal | 4.4, 4.5 — pemula |
| 8 | **Briefing pra-misi** — tiga baris: apa yang akan diketik, syarat rank, konsekuensi salah | 4.3, 4.8 |
| 9 | **Auto-pause + Esc di semua state** + resume hitung mundur 3-2-1 | 4.9 — timer jalan saat tabBlur |
| 10 | **Mobile: hidden input + layout portrait + badge "Butuh keyboard"** | 4.8 — mobile tidak bisa main |
| 11 | **Statistik jujur** — "Akurasi rata-rata (n=24 upaya selesai)" dari DB, bukan best-by-score | 4.7 — statistik dashboard kabur |
| 12 | **Fault map per baris** di layar hasil — baris mana yang bocor dan karakter mana | 4.5, 4.6 — perfect line terakhir |

Prinsip editorial yang mengikat semuanya: **hanya lima elemen HUD yang boleh selalu tampil.** Papan kode adalah bintang; sisanya menempel di tepi, redup, dan bisa dimatikan. Tidak ada modal yang menutupi papan kode selama permainan.

---

## 1. Asumsi dan Peta ke Kode Anda

| Asumsi (berdasar ANALISIS) | Implikasi untuk spesifikasi ini |
|---|---|
| Single-page React, CSS global di `src/index.css` | Token ditulis sebagai CSS custom properties di `:root` — cukup, tanpa Tailwind atau PostCSS baru |
| `src/components/TypingGame.tsx` memegang countdown → play → hasil | Semua perbaikan HUD masuk ke file ini; layar hasil dikirim sebagai komponen terpisah `ResultScreen.tsx` agar bisa diuji terpisah |
| State progres di `localStorage` (level, XP, rank terbaik, lencana) | Onboarding memakai satu flag baru, misalnya `cs.onboarded.v3` — skema lama tidak diubah |
| `api/index.php` sudah punya agregat `stats.avgAcc` | Dashboard v3 memakai angka DB; riwayat lokal tetap sebagai fallback offline |
| `.ch-wrong`, drop-shadow combo, dan vignette HP ≤ 30 sudah ada | Token v3 **mengganti** nilai yang ada, bukan menumpuk lapisan baru — hindari rantai `!important` |
| 9 misi, 3 dunia, 3 mode, 7 level, rank S/A/B/C | Semua angka dalam dokumen ini memakai angka tersebut; ubah hanya di satu file data misi |

> ⚠️ Nama file `src/data/lessons.ts`, `src/lib/api.ts`, serta struktur komponen Home dan Dashboard adalah **asumsi saya**. Kirim struktur direktorinya (misal `tree -L 3 src`) dan saya sesuaikan.

---

## 2. Audit UI/UX Singkat (12 Masalah)

Dampak: 🔴 tinggi · 🟡 sedang · 🟢 rendah.

| # | Masalah | Gejala yang dirasakan pemain | Dampak | Solusi (§) |
|---|---|---|---|---|
| 1 | HUD terlalu sunyi | Tidak tahu sedang menang atau kalah sebelum selesai | 🔴 | [8](#8-hud-redesign-inti) |
| 2 | Syarat rank tak terlihat | "Akurasi 98% kok cuma A?" | 🔴 | 8.6, 9.2 |
| 3 | Skor tidak terbaca | Skor 12.400 — dari mana? | 🔴 | 9.3 waterfall |
| 4 | Layar hasil hanya daftar angka | Tidak ada pelajaran, tidak ada langkah berikutnya | 🔴 | [9](#9-layar-hasil-redesign) |
| 5 | Tidak ada onboarding | Baru paham "tidak ada backspace" setelah gagal tiga kali | 🔴 | [5](#5-onboarding-dan-first-run) |
| 6 | Tidak ada preview karakter berikutnya | Pemula macet di `"` `;` `{` | 🟡 | 8.5 keycap hint |
| 7 | Overdrive datang mendadak | Pemain kaget karena pengali mendadak, tidak terasa "dapat" | 🟡 | 8.6 telegraph |
| 8 | Tidak ada pause | Notifikasi HP menghukum pemain yang sedang konsentrasi | 🟡 | 8.8 |
| 9 | Mobile mentok di countdown | Keluhan "gak bisa main di HP" | 🔴 | [11](#11-mobile-dan-touch) |
| 10 | Tombol saat countdown terbuang | Tekan spasi diabaikan, pemain frustrasi | 🟡 | [7](#7-countdown-dan-transisi-mulai) |
| 11 | Statistik dashboard menyesatkan | Label "rata-rata" sebenarnya memakai data terbaik | 🟡 | [10](#10-dashboard-dan-riwayat) |
| 12 | Tidak ada layout mobile/tablet | Layout 1440px dipaksakan ke 390px | 🟡 | 11.3 |

Yang **tidak** saya usulkan, agar tidak menambah beban: tab navigasi baru, popup achievement bertumpuk, animasi latar tambahan, mode terang (game sudah bernuansa malam — tambahkan cahaya, jangan kurangi).

---

## 3. Design System v3

### 3.1 Prinsip

1. **Kode adalah konten utama.** Papan kode punya area terbesar, kontras tertinggi, dan tidak pernah tertutupi elemen lain.
2. **Informasi selalu punya bentuk dan angka.** HP tidak hanya merah — ada bar, ada angka, ada hiu yang bergerak. Tidak ada makna yang dibawa warna saja.
3. **Umpan balik di bawah 120 ms.** Setiap ketikan menghasilkan bunyi, warna, dan mikro-animasi dalam satu frame.
4. **Redup sampai dibutuhkan.** Elemen HUD default `opacity: .85` dan naik ke `1` saat berubah: combo naik, HP kena, overdrive penuh.
5. **Gerak selalu punya alasan.** Setiap animasi menjelaskan sesuatu (state berubah, kejadian terjadi), bukan sekadar mengisi ruang.

### 3.2 Token Warna

Tempelkan di awal `src/index.css`. **Ganti** nilai yang sudah ada, jangan tambahkan duplikat.

```css
:root {
  /* ——— Permukaan & kedalaman ——— */
  --bg-0:#050a14;  /* abyss — body */
  --bg-1:#0a1222;  /* page */
  --bg-2:#0f1a2e;  /* panel */
  --bg-3:#16243d;  /* raised / hover */
  --bg-4:#1e3050;  /* input / chip */
  --line:    #24395e;   /* hairline */
  --line-2:  #33517f;   /* hairline kuat */

  /* ——— Teks ——— */
  --fg-0:#eaf2ff;  /* utama (kode) */
  --fg-1:#a9bbd6;  /* sekunder */
  --fg-2:#7b8fae;  /* caption — pastikan rasio ≥ 4.5:1 di atas --bg-2 */
  --fg-3:#4d5f7a;  /* nonaktif / dekoratif saja */

  /* ——— Semantik ——— */
  --ok:   #2ee6a8;  --ok-dim:  #0d6b51;
  --warn: #ffc23d;  --warn-dim:#8a5c00;
  --bad:  #ff5f6e;  --bad-dim: #8c1220;
  --info: #4dc4ff;  --info-dim:#0d4a75;
  --od:   #ff7a18;  --od-hi:   #ffc861;  /* overdrive */
  --gold: #ffd45e;  /* rank S, lencana */
  --shark:#7fd7ff;  /* maskot */

  /* ——— Rank ——— */
  --rank-s:var(--gold);
  --rank-a:#2ee6a8;
  --rank-b:#4dc4ff;
  --rank-c:#7b8fae;

  /* ——— Gerak ——— */
  --dur-1: 90ms;   /* feedback ketikan */
  --dur-2: 160ms;  /* transisi status */
  --dur-3: 260ms;  /* panel masuk */
  --dur-4: 420ms;  /* banner / flyout */
  --ease-out: cubic-bezier(.22,1,.36,1);
  --ease-snap: cubic-bezier(.34,1.56,.64,1);
  --ease-in-out: cubic-bezier(.65,0,.35,1);

  /* ——— Bentuk ——— */
  --r-sm: 6px; --r-md: 10px; --r-lg: 16px;
  --clip-panel: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));

  /* ——— Layer ——— */
  --z-hud: 10; --z-banner: 30; --z-pause: 50; --z-toast: 60; --z-modal: 70;
}
```

### 3.3 Token Tipografi

Empat peran, tidak lebih. Kode memakai mono dengan fallback sistem yang aman.

```css
:root{
  --font-code: ui-monospace, "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
  --font-ui: system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
  --font-display: "Chakra Petch", var(--font-ui);  /* judul besar saja; fallback aman */

  /* skala fluid — clamp(min, preferred, max) */
  --fs-code:  clamp(15px, 1.05vw + 10px, 22px);
  --fs-hud:   clamp(11px, .35vw + 9px, 13px);
  --fs-body:  14px;
  --fs-lead:  16px;
  --fs-h2:    clamp(18px, .8vw + 14px, 24px);
  --fs-h1:    clamp(26px, 1.6vw + 18px, 40px);
  --fs-metric:clamp(22px, 1.4vw + 16px, 34px);   /* angka besar: skor, WPM */
}
```

Aturan: **angka besar selalu `font-variant-numeric: tabular-nums`**, supaya tidak "berjumps" saat WPM naik atau timer berjalan.

### 3.4 Aturan Aksesibilitas Warna

| Pasangan | Rasio (perkiraan) | Catatan |
|---|---|---|
| `--fg-0` di atas `--bg-2` | ~13:1 | Aman |
| `--fg-1` di atas `--bg-2` | ~7:1 | Aman untuk body |
| `--fg-2` di atas `--bg-2` | ~4.6:1 | Batas — jangan dipakai untuk angka penting |
| `--bad` di atas `--bg-2` | ~4.5:1 | Kalau teks kecil, naikkan ke `#ff7280` |
| Warna sebagai satu-satunya pembeda | ❌ | Selalu accompanied oleh ikon, bentuk, atau teks |

Untuk pemain buta warna: merah, kuning, dan hijau tidak pernah menjadi satu-satunya pembawa makna. Aura combo selalu disertai angka `×2.5`; HP rendah selalu disertai angka; ghost char merah selalu disertai bentuk berbeda dari karakter target.

### 3.5 Motion

Penanganan `prefers-reduced-motion` sudah ada di v0.2 — pertahankan dan lengkapi:

```css
@media (prefers-reduced-motion: reduce){
  :root{ --dur-1:0ms; --dur-2:0ms; --dur-3:0ms; --dur-4:0ms; }
  /* tetap beri feedback tanpa gerak: perubahan warna dan opacity, tanpa scale/translate */
}
```

---

## 4. Model Informasi dan Alur Layar

### 4.1 Peta Layar

```
[App Shell: TopBar persisten — Logo · Level+XP mini · Nav · Status DB]
│
├── HOME / PETA MISI ────────────┐
│   └── Kartu Misi → BRIEFING   │  (modal tipis, 3 baris, bisa ditutup)
│          └── COUNTDOWN (3-2-1)│
│               └── PLAY  ──┐   │
│                             ├── PAUSE (overlay + blur)
│               └── HASIL     │   │
│   ├── TEORI SLIDE           │◄──┘
│   ├── DASHBOARD / STATISTIK │
│   ├── RIWAYAT               │
│   └── PENGATURAN (reset progres, nama pemain) │
```

### 4.2 Navigasi: empat, tidak lebih

`Beranda · Teori · Statistik · Riwayat`, ditambah chevron "‹ Kembali" kontekstual di sub-layar. **Jangan** menambah tab; empat sudah batas nyaman untuk pemain kasual.

### 4.3 TopBar Global

Fungsi: menampilkan progresi (satu-satunya angka yang layak tampil di luar gameplay) dan status koneksi DB.

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🦈 CodeShark   Lv.4 ▰▰▰▰▰▱▱▱  1.850/2.250 XP   Beranda Teori Statistik Riwayat   ● │
└──────────────────────────────────────────────────────────────────────┘
```

- Bar XP hanya di TopBar, lebar tetap 120px, dengan tooltip saat hover: "1.500 XP lagi ke Lv.5 — Analis DOM".
- Indikator DB: hijau = tersambung, amber = offline. Saat offline, hover menampilkan: "Mode offline: progres tetap aman di perangkat ini." Jangan pernah merah kecuali terjadi error fatal.

---

## 5. Onboarding dan First-Run

**Masalah:** pemain baru tidak tahu aturan main sebelum memulai. **Solusi:** pembukaan bertahap — satu layar penuh saat pertama masuk, lalu tips kontekstual satu kalimat per kejadian.

### 5.1 Layar 1 — Pembuka (sekali, saat flag onboarding belum ada)

```
┌──────────────────────────────────────────────┐
│            🦈  SELAMAT DATANG                │
│                                              │
│  1. Baca slide teori, lalu KETIK ULANG kode │
│     persis seperti yang tertulis.            │
│                                              │
│  2. Salah ketik = HP turun. Mode Standar:     │
│     tidak ada backspace. Mode Santai: ada.   │
│                                              │
│  3. Rank S butuh akurasi ≥97% + HP ≥70.      │
│     Kecepatan (WPM) menjadi pembeda saat     │
│     seri panjang.                            │
│                                              │
│        [ Mulai Ruang Latihan ]                │
│        [ Lewati ]                             │
└──────────────────────────────────────────────┘
```

### 5.2 Ruang Latihan (Misi #0)

- Kode pendek, **tidak bisa gagal**: HP tidak turun dan sesi dipaksa selesai setelah 60 detik atau 8 baris.
- Delapan baris bertingkat: `const` → `;` → `{}` → `=>` → string dengan `"` → template literal.
- Tiap baris selesai: bunyi naik satu oktaf dan kilau kecil di baris tersebut. Fungsi melatih mémoire otot tangan, bukan skor.
- Setelah selesai: kartu pengarah — "Jari sudah panas. Coba Misi 01 dengan Mode Santai", lengkap dengan alasannya.

### 5.3 Tips Kontekstual (in-game, satu kalimat, maksimal tiga kali per misi)

Ditampilkan sebagai toast 2,5 detik di bawah papan kode, tidak pernah memblokir:

| Pemicu | Teks |
|---|---|
| Salah pertama | "Tidak apa-apa — kursor tidak maju. Lanjut ketik karakter yang disorot." |
| Salah pada `"` atau `'` | "Tanda kutip butuh Shift. Lihat keycap di bawah papan." |
| Salah tiga kali berturut-turut | "Tarik napas dua detik, lalu lanjutkan — HP masih aman." |
| Overdrive penuh | "OVERDRIVE! Skor ×2 selama 8 detik — tetap presisi." |
| Baris sempurna | "Garis sempurna: +80 skor, +2 HP. Pertahankan." |
| 60% waktu habis | "Sisa waktu menipis — akurasi tetapdidahulukan kecepatan." |

### 5.4 Kriteria Onboarding Selesai

- Simpan `cs.onboarded.v3 = 1` setelah pemain menekan "Mulai Ruang Latihan" — bukan setelah selesai, supaya tidak pernah menjadi gerbang progres.
- Ruang Latihan bisa diulang kapan saja dari Beranda lewat tombol "Latihan".

---

## 6. Layar Home dan Peta Misi

### 6.1 Anatomi Kartu Misi

Setiap kartu harus menjawab empat pertanyaan tanpa perlu diklik: **ini apa, sudah sampai mana, seberapa sulit, dan apa yang terjadi kalau saya main.**

```
┌──────────────────────────────────────────┐
│ DUNIA 1 · HTML Dasar            ✓ SELESAI │
│ ┌──────────────────────────────────────┐ │
│ │ #02  Struktur & Atribut             │ │
│ │ <div class="card">                  │ │  ← preview kode, mono, 2 baris
│ │ Rank terbaik  S  ·  Skor 1.240      │ │
│ │ ▰▰▰▰▰▰▰▰▱▱  2 dari 3 baris contoh   │ │
│ │ [Teori]   [ ⌨ Mulai Misi ]          │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- **Status terkunci:** overlay gelap, ikon gembok, dan **alasan** tertulis ("Selesaikan Misi 01 terlebih dahulu"). Jangan hanya membuat kartu jadi abu-abu.
- **Badge perangkat:** bila `matchMedia('(pointer: coarse)')` cocok, tampilkan `⌨ Butuh keyboard` pada misi lebih dari lima baris (lihat §11).
- **Pill rank terbaik:** S/A/B/C berwarna sesuai token rank. Belum pernah main → tulis "Belum Dicoba" dengan `--fg-3`, bukan skor nol.
- **Hover:** kartu naik 2px, border jadi `--line-2`, dan tiga karakter acak pada preview kode disorot halus.

### 6.2 Peta Dunia (opsional, prioritas P1)

Jika peta dunia ditambahkan: tiga dunia sebagai progress bar horizontal dengan node misi. Dunia terbuka = terang; dunia terkunci = redup dengan label syarat. Dunia terkunci harus tetap terlihat — janganutsu taruh di bawah lipatan yang harus di-scroll.

### 6.3 Micro-interaction

Klik "Mulai Misi" → kartu membesar sedikit → wipe ke Briefing → Countdown. Target waktu dari tekan sampai kursor pertama bergerak: **di bawah dua detik**. Briefing harus bisa ditutup dengan sekali tekan atau Enter, bukan memaksa klik.

---

## 7. Countdown dan Transisi Mulai

Tiga masalah yang harus diselesaikan di state ini:

1. Tekan tombol saat countdown terbuang (ANALISIS 4.9).
2. Pemain terkejut karakter pertama.
3. Esc tidak berfungsi.

### 7.1 Spesifikasi

```
     3                    2                    1                   GO
  ┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
  │  const │          │  <div │          │  class │          │  ▮     │
  │  layo… │  (lima karakter pertama, mono besar, blur → tajam)
  └────────┘
  Tekan [Esc] untuk batal   ·   tekan tombol apa saja untuk mulai
```

- **Primer karakter:** lima karakter pertama ditampilkan besar dengan kursor berkedip, lalu zoom-in ke papan kode saat "GO".
- **Buffer tombol:** 1,5 detik sebelum GO, satu tekanan tombol apa pun langsung memulai permainan (buffer maksimal satu karakter agar tidak menumpuk). Jika belum ditekan, tampilkan teks "Tekan tombol apa saja untuk mulai".
- **Esc = batal** kembali ke Briefing, bukan langsung ke Home — lebih murah bagi pemain.
- Countdown dibatalkan otomatis saat `blur` (lihat §8.8).

---

## 8. HUD Redesign (Inti)

Ini layar yang dipakai sekitar 90% waktu sesi. Prinsipnya: **lima elemen persisten, sisanya kontekstual.** Rail kiri dan kanan bisa dikecilkan (ikon chevron di tengah tepi) untuk monitor kecil atau Mode Santai; state disimpan di localStorage.

### 8.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ‹ Mundur   #03 Struktur & Atribut        [⚡ Hiu Galak]     01:12    ⏸  │ ← (1) top
├────────────┬────────────────────────────────────────────┬────────────────┤
│ HP         │                                            │ OVERDRIVE      │
│ 🦈        │   const .card {                            │  ◔ 72%         │ ← (2) gauge
│ ▰▰▰▰▰▰▰▰▱▱ 85     ← bar + angka      display: grid;   │  siap 1.7 dtk  │
│            │                                            │ ────────────   │
│ ❌ "  ×2   │     gap: 12px;                            │ COMBO          │
│ ❌ ;  ×1   │   }                                       │  ×2.5  ▰▰▰▰▰▱▱▱ │ ← (3) meter
│ ✅ ⏎       │                                            │  38 combo      │
│            │                                            │ ────────────   │
│ SYARAT S   │                                            │  68 WPM        │ ← (4) metrik
│ ✓ ACC 97%  │                                            │  97.2% akurasi │
│ ✓ HP 85    │                                            │  [ ● S ]       │ ← (5) rank
│ ○ WPM 60   │                                            │                │
├────────────┴────────────────────────────────────────────┴────────────────┤
│ ▰▰▰▰▰▰▰▰▱▱▱  7/12 baris                 ⌨ z  x  c  v  ,  .  ⏎        │ ← bawah
└──────────────────────────────────────────────────────────────────────────┘
```

### 8.2 (1) TopBar Sesi

| Elemen | Spesifikasi |
|---|---|
| ‹ Mundur | Kembali ke Briefing; konfirmasi bila HP < 50 |
| Nama misi | `#03 · Struktur & Atribut`, satu baris, truncate |
| Chip mode | `[⚡ Hiu Galak]`, warna sesuai mode: Santai `--info`, Standar `--warn`, Hiu Galak `--bad`. **Wajib terlihat** — pemain harus tahu pengali damage-nya berapa |
| Timer | `01:12` tabular; di bawah 00:15 berubah amber dan berdenyut (hormati reduced motion) |
| ⏸ | Pause; pintasan yang sama adalah Esc |

### 8.3 (2) Rail Kiri — HP dan Damage Log

```
🦈  ← SVG hiu miring, "tenggelam" proporsional terhadap HP (v0.2 sudah ada, pertahankan)
▰▰▰▰▰▰▰▰▱▱  85        ← bar + ANGKA (wajib: merah ≤30, amber ≤60)
❌ " ×2   ← damage log: 8 slot. Karakter yang diketik (merah) di atas
❌ ; ×1        karakter target (abu-abu) di bawahnya, fade 2.5 dtk
✅ ⏎           ← Enter benar = centang hijau (penguatan positif)
```

Damage log adalah **fitur belajar**, bukan dekorasi: pola salah yang berulang (selalu `"`, selalu `;`) langsung terlihat, sehingga pemain tahu mana yang perlu dilatih. Data sumber sudah ada di loop (posisi karakter salah per baris) — cukup simpan delapan terakhir saat runtime.

### 8.4 (3) Rail Kanan — Overdrive dan Combo

- **Overdrive gauge:** cincin atau bar tipis, label `72% · siap 1.7 dtk`. Saat penuh: bar berubah jadi `--od` yang berdenyut, lalu **telegraph 1,5 detik** sebelum aktif:

| Fase | Gema visual | Gema suara |
|---|---|---|
| Mengisi | Bar naik, warna `--od` redup | — |
| Penuh (telegraph) | Bar berdenyut 3×, banner `OVERDRIVE siap` | riser |
| Aktif | `×2 · 6.4 dtk` + angka sisa waktu; tiap karakter benar memunculkan percikan kecil | roar singkat |
| Selesai | Bar kembali ke 0, label `terpakai 5.4 dtk` (rekap, untuk coaching) | turun |

- **Combo meter:** `×2.5 · 38 combo` dengan bar tersegmentasi sesuai `min(4, floor(combo/12))`. Kenaikan tier memberi flash outline 200 ms plus suara naik satu nada. **Angka tier selalu ditampilkan besar** — glow saja (yang sudah ada di v0.2) tidak terbaca secepat angka.

### 8.5 (4) Rail Kanan Bawah — Metrik Live

```
  68 WPM        ← fs-metric, tabular; pita target 40–80 ditandai garis tipis
  97.2%         ← akurasi = typed / (typed + errors)
  [ ● S ]       ← rank trajectory (lihat 8.6)
```

- **WPM:** tampilkan mulai detik ke-3; sebelumnya tulis `—`, bukan `0`. Di atas 80 WPM tampilkan ikon api kecil ("ritme api").
- **Akurasi:** beri peringatan amber tipis di bawah 92% (ambang rank A) — peringatan dini, bukanigate setelah gagal.

### 8.6 (5) Rank Trajectory — Perbaikan Utama untuk 4.3

Tiga chip, selalu terlihat di rail kanan (dan versi mini di top bar saat layar sempit):

```
[✓ ACC 97%]   [✓ HP 85]   [○ WPM 60]
```

Logika helper (tidak mengubah aturan skor yang sudah ada):

```ts
// src/lib/rank.ts — helper UI, murni tampilan
export type RankChip = { key:'acc'|'hp'|'wpm'; label:string; ok:boolean; value:number };

export function rankChips(acc:number, hp:number, wpm:number): RankChip[]{
  return [
    { key:'acc', label:'ACC', ok: acc >= 0.97, value: Math.round(acc * 100) },
    { key:'hp',  label:'HP',  ok: hp >= 70,        value: hp },
    { key:'wpm', label:'WPM', ok: wpm >= 60,       value: Math.round(wpm) },
  ];
}
```

- Abu `○` → amber `◐` saat sudah mencapai 80% ambang → hijau `✓` saat terpenuhi.
- Jika ketiganya hijau, chip S berkilat sekali dan berbunyi kecil — reward, bukan alarm.
- Tooltip pada chip: "Rank S butuh akurasi ≥97% dan HP ≥70 dan kecepatan ≥60 WPM".
- Dengan begitu masalah 4.3 mustahil terjadi lagi: pemain selalu bisa melihat **kenapa** dia belum S, secara real-time, bukan baru di layar hasil.

> Catatan: saat ini WPM belum memengaruhi rank (ANALISIS 4.1). Chip WPM sengaja ditampilkan sebagai **indikator** dengan ambang 60 yang polymers decay; begitu Anda memutuskan memasukkan kecepatan ke rumus rank, cukup ubah angka di satu fungsi ini.

### 8.7 Bawah — Progress Baris dan Keycap Hint

```
▰▰▰▰▰▰▰▰▱▱▱  7/12 baris        ⌨ z  x  c  v  ,  .  ⏎
```

- **Progress baris:** satu segmen per baris; selesai = hijau (sudah ada di v0.2). Tambahkan: baris yang **pernah** disalah ketik diberi merah pucat.
- **Keycap hint:** tiga karakter berikutnya ditampilkan di guide QWERTY beserta tombol fisik dan panduan jari. Ada toggle di Pengaturan; default ON untuk Lv.1–2 dan OFF untuk Lv.3+ agar tidak jadi ketergantungan. Untuk karakter non-QWERTY seperti `=>` atau backtick, tampilkan keycap `Shift` yang menyala.
- Tidak boleh ada apa pun di tengah papan kode: tidak ada panel tutorial, tidak ada tombol melayang.

### 8.8 Pause dan Auto-pause

```tsx
// src/components/TypingGame.tsx — tambahan
function useAutoPause(onPause: () => void){
  useEffect(() => {
    const go = () => { if (document.visibilityState === 'hidden') onPause(); };
    document.addEventListener('visibilitychange', go);
    window.addEventListener('blur', go);
    return () => {
      document.removeEventListener('visibilitychange', go);
      window.removeEventListener('blur', go);
    };
  }, [onPause]);
}
```

- **Overlay pause:** backdrop blur dengan bentuk `clip-panel`, tiga tombol — `Lanjut`, `Ulangi`, `Keluar ke Briefing`. Tampilkan `Skor saat ini: 4.120 · Sisa waktu 01:12`.
- **Resume dengan hitung mundur 3-2-1** (2,4 detik) supaya pemain tidak langsung kehilangan nyawa setelah kembali fokus. Tahan tombol apa pun untuk langsung lanjut.
- **Esc** berfungsi di play, countdown, dan briefing. Tidak di layar hasil.
- Jumlah pause dicatat pada `attempt.pauses` untuk instrumentasi (§14).

### 8.9 Mapping Kejadian ke Sinyal Visual dan Audio

| Kejadian | Visual | Suara (sudah ada) | Durasi |
|---|---|---|---|
| Ketik benar | Karakter jadi `--fg-0`, kursor maju | tik | 0 |
| Ketik salah | Ghost char merah 300 ms + entri damage log + hiu bergetar | buzz | 300 ms |
| Baris selesai | Nomor baris berubah hijau bercahaya | blip naik | 200 ms |
| Garis sempurna | Flyout `+80`, chip hijau `+2 HP` di gauge HP | shimmer | 600 ms |
| Combo naik tier | Flash outline, angka tier scale 1 → 1.15 → 1 | suara naik | 200 ms |
| Milestone (25/50/75/100/150) | Banner di bawah papan, tidak menutupi kode | fanfare | 1,2 s |
| Overdrive siap | Gauge amber berdenyut 3× lalu banner `OD ×2` | riser | 1,5 s |
| HP ≤ 30 | Vignette merah berdenyut (sudah ada), hiu panik | denyut rendah | loop |
| Countdown | Angka 3-2-1 scale-in | tick | 1 s per angka |
| Pause | Overlay blur | — | 200 ms |

Aturan keras: **maksimal satu banner pada satu waktu.** Banner yang baru menggeser yang lama (antrean), tidak menumpuk.

### 8.10 Kerangka Implementasi

```tsx
// src/components/TypingGame.tsx (tambahan)
import { rankChips, type RankChip } from '../lib/rank';

function HudRail({ chips, wpm, acc }: {
  chips: RankChip[]; wpm: number; acc: number;
}){
  return (
    <aside className="hud-rail hud-right" aria-label="Status permainan">
      <OverdriveGauge value={odRatio} phase={odPhase} />   {/* 8.4 */}
      <ComboMeter tier={comboTier} combo={comboCount} />   {/* 8.4 */}
      <dl className="hud-metrics">
        <div><dt>WPM</dt><dd>{wpm || '—'}</dd></div>
        <div><dt>Akurasi</dt><dd>{(acc * 100).toFixed(1)}%</dd></div>
      </dl>
      <ul className="rank-chips" aria-live="polite">
        {chips.map(c => (
          <li key={c.key} className={`chip ${c.ok ? 'is-ok' : ''}`}
              title={`Syarat S — ${c.label}: ${c.ok ? 'terpenuhi' : 'belum terpenuhi'}`}>
            <span aria-hidden>{c.ok ? '✓' : '○'}</span> {c.label} {c.value}
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

CSS inti rail:

```css
.hud-rail{ position:absolute; inset-block:0; width:180px; z-index:var(--z-hud);
           display:flex; flex-direction:column; gap:14px; padding:16px;
           opacity:.85; transition:opacity var(--dur-2) var(--ease-out); }
.hud-rail:hover, .hud-rail:focus-within{ opacity:1; }
.hud-left{ left:0; } .hud-right{ right:0; align-items:flex-end; text-align:right; }

.rank-chips{ display:flex; flex-direction:column; gap:6px; list-style:none; margin:0; padding:0; }
.rank-chips .chip{ font:600 var(--fs-hud)/1 var(--font-ui); letter-spacing:.04em;
                   padding:5px 9px; border-radius:var(--r-sm);
                   background:var(--bg-3); color:var(--fg-2);
                   border:1px solid var(--line); }
.rank-chips .chip.is-ok{ color:var(--ok); border-color:var(--ok-dim);
                         background:color-mix(in srgb, var(--ok) 12%, var(--bg-3)); }

/* < 900px: rail menyatu jadi strip horizontal di atas papan kode */
@media (max-width:900px){
  .hud-rail{ position:static; width:auto; flex-direction:row; flex-wrap:wrap;
             align-items:center; justify-content:space-between; padding:10px 12px; }
  .hud-right{ text-align:left; }
}
```

`aria-live="polite"` pada rank chips memberi tahu pembaca layar saat syarat S tercapai, tanpa membuat announcements per karakter.

---

## 9. Layar Hasil Redesign

Layar ini menentukan apakah pemain **belajar** atau sekadar melihat angka. Urutan informasinya: **headline → alasan → rincian → pelajaran → progresi → aksi.**

### 9.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                    🦈  RANK  S                                  │
│            Struktur & Atribut · Hiu Galak                        │
│  ─────────────────────────────────────────────────────────────   │
│  "Akurasi 98% + HP 82 + ritme 71 WPM.                            │
│   Satu garis sempurna, Overdrive dipakai 5.4 dtk."                │
│  ─────────────────────────────────────────────────────────────   │
│  SKOR 12.480     WPM 71     AKURASI 98.1%     COMBO 47           │
│  ▰▰▰▰▰▰▰▰▰▰▱▱▱  ▲ rekor 11.904 (+576)                          │
│                                                                  │
│  DARI MANA SKORNYA                                               │
│  Ketik karakter   6.240   ████████████████                       │
│  Baris selesai    1.200   ███                                      │
│  Milestone combo    750   ██                                       │
│  Garis sempurna      80   ▌                                       │
│  Overdrive (×2)   1.650   ████                                     │
│  Bonus HP (82)    1.230   ███                                     │
│  ─────────────────────────────────────────────────────────────   │
│  PETA KESALAHAN                                                  │
│  1 <div class="card">     ▰▰▰▰▰▰▰▰▰▰✓  sempurna                 │
│  2   display: grid;      ▰▰▰▰▰▰▰▰▰░  1 salah — " (kutip)        │
│  3   gap: 12px;          ▰▰▰▰▰▰▰▰▰▰✓  sempurna                 │
│  ─────────────────────────────────────────────────────────────   │
│  COACHING                                                       │
│  → 3 dari 5 salah terpusat di kutip  ". Latih Misi Kutip, atau    │
│    gunakan Mode Santai.                                          │
│  ─────────────────────────────────────────────────────────────   │
│  Lv.4 → Lv.5  ▰▰▰▰▰▰▰▰▰▱▱▱▱▱  1.850 / 2.250 XP  (+340)          │
│  ─────────────────────────────────────────────────────────────   │
│  [ ⟳ Ulangi ]  [ Misi Berikut ▸ ]  [ ◂ Briefing ]  [ Beranda ]   │
└──────────────────────────────────────────────────────────────────┘
```

### 9.2 Headline dan Alasan (perbaikan 4.3)

`getRankReason()` mengembalikan **satu kalimat** yang menjelaskan hasilnya:

```ts
// src/lib/rankReason.ts
export function getRankReason(r: {
  acc:number; hp:number; wpm:number; mode:{ dmg:number };
  perfectLines:number; odUsed:number;
}): string{
  const maxErrForS = Math.floor(30 / r.mode.dmg);          // HP 100 → butuh ≥70
  if (r.hp >= 70 && r.acc >= 0.97)
    return `Akurasi ${(r.acc*100).toFixed(0)}% + HP ${r.hp} + ritme ${Math.round(r.wpm)} WPM. ` +
           `${r.perfectLines} garis sempurna, Overdrive dipakai ${r.odUsed.toFixed(1)} dtk.`;
  if (r.hp < 70)
    return `Rata-rata, tapi HP habis — di mode ini S hanya toleran ${maxErrForS} salah, ` +
           `kamuermaid ${maxErrForS + 1} kali. Ketik lebih konservatif.`;
  return `Akurasi ${(r.acc*100).toFixed(0)}% — belum separuh. Lihat peta kesalahan di bawah.`;
}
```

Menyebutkan "3 salah dari batas 3" jauh lebih informatif daripada sekadar menampilkan huruf A.

### 9.3 Waterfall Skor

BUTUH dukungan mekanik kecil: game loop harus merekam event. Tambahkan tipe ini di `TypingGame.tsx`:

```ts
export type ScoreEvent =
  | { kind:'char';      at:number; pts:number; tier:number }
  | { kind:'enter';     at:number; pts:number }
  | { kind:'milestone'; at:number; pts:number; combo:number }
  | { kind:'perfect';   at:number; pts:number }
  | { kind:'od';        at:number; pts:number }     // sudah dihitung ×2
  | { kind:'hpbonus';   at:number; pts:number; hp:number };

// di dalam loop: skorEvents.push(...) setiap kali poin ditambahkan.
// saat finish: rangkum per jenis untuk waterfall.
function summarize(events: ScoreEvent[]){
  const by = new Map<ScoreEvent['kind'], number>();
  for (const e of events) by.set(e.kind, (by.get(e.kind) ?? 0) + e.pts);
  return by;
}
```

Render: bar horizontal terurut, positif hijau, negatif merah, label plus angka tabular. Arahkan kursor atau ketuk untuk melihat timestamp ("di detik 12"). Di mobile, waterfalldefault dalam keadaan tertutup lewat toggle "Rincian".

> Verifikasi yang harus dilakukan: jumlah waterObjective harus sama dengan skor final. Kalau ada selisih, berarti ada sumber poin yang belum tercatat — tambahkan push-nya, jangan adjusting tampilan.

### 9.4 Peta Kesalahan per Baris

Dari data yang sudah ada (`errSinceLine` dan posisi karakter per baris), bangun laporan:

```ts
export type LineReport = {
  idx:number; text:string; typed:string;
  errors:number; perfect:boolean;
  worstChars:string[];    // 1–2 karakter yang paling sering salah di baris ini
};
```

Tampilan: baris kode mono dengan penanda proporsional jumlah error, dan `✓` untuk garis sempurna. **Baris terakhir tetap dihitung perfect** bila `errSinceLine === 0` — ini sekaligus menutup celah ANALISIS 4.6 yang belum diimplementasikan.

### 9.5 Coaching — Rule Engine

Turunkan dari data attempt, pilih **maksimal tiga** dengan urutan: integritas → kecepatan → kekuatan → kilau.

| Kondisi | Tips |
|---|---|
| ≥60% error jatuh di `"` `'` `;` | "Mayoritas salah ketik di tanda baca. Latih Misi Kutip, atau Main Mode Santai dulu." |
| `hp < 70` dan rank bukan S | "Butuh maksimal X salah untuk S di mode ini; kamu salah Y kali." |
| `acc ≥ 92%` dan `wpm < 40` | "Akurasi bagus, ritme pelan. Tekan Enter secepat mungkin di baris pendek — itu sumber WPM paling aman." |
| Overdrive tidak terpakai | "Overdrive penuh tapi tidak dipakai. ×2 selama 8 detik adalah lompatan skor terbesar." |
| Semua baris sempurna | "Semua baris sempurna. Kalau begitu yang menahan rank adalah kecepatan — naikkan ritme." |
| Tidak pecah rekor | "Rekor masih X. Butuh +Y poin." |

Nada harus teknis dan konkret, tidak menyalahkan, dan setiap tips menyebut angka.

### 9.6 Progresi dan Rekor

- Bar XP menuju level berikutnya **dengan** delta sesi ini (`+340 XP`) dan nama level berikutnya ("Analis DOM"). Naik level ditampilkan sebagai banner kecil di atas bar, bukan layar penuh.
- Rekor: `▲ dari 11.904` plus badge `REKOR!` yang berkilau 1,2 detik.
- Bila ada misi yang baru terbuka, sebutkan: "Membuka: Misi 05" — selalu ada sesuatu untuk dituju.

### 9.7 Calls to Action

Hierarki: **Ulangi** (tombol utama, besar) · **Misi Berikut** (buka bila tersedia; bila belum, nonaktif dengan teks "Selesaikan Misi 03 dulu") · **Briefing** · **Beranda**. Di mobile: susunan vertikal, tinggi tombol minimal 48px, dan "Ulangi" selebar layar di bawah.

### 9.8 State Gagal

Gagal (HP habis atau waktu habis) **bukan** layar "Gagal" kosong. Perlakukan sebagai hasil parsial:

```
┌──────────────────────────────────────────┐
│        🦈 HIU TENGGELAM                  │
│        HP habis di baris 7 dari 12       │
│        Skor parsial 4.120 · Akurasi 74%  │
│        ──────────────────────────────    │
│        Sudah dikuasai: baris 1–6         │
│        Titik kamu bocor: baris 7 (tanda baca) │
│        [ Coba Lagi ]  [ Latihan Baris 7 ] │
└──────────────────────────────────────────┘
```

Menyebutkan progres parsial mengubah gagal dari rasa kalah menjadi informasi.

---

## 10. Dashboard dan Riwayat

### 10.1 Metrik yang Benar (perbaikan 4.7)

| Label UI | Sumber yang benar | Fallback offline |
|---|---|---|
| Akurasi rata-rata | `GET api?action=history&device=…` → `stats.avgAcc` (dari upaya `done`) | Badge "butuh DB" |
| Akurasi terbaik | maksimum `acc` dari riwayat | — |
| Rasio-what | totalUpaya ÷ totalSelesai | dari localStorage |
| Rekor skor | per misi dari localStorage | — |

**Aturan label:** setiap metrik menampilkan jumlah sampel di bawahnya, misalnya `97.2% · n=24 upaya selesai`. Menyebutkan `n` adalah cara termurah membuat statistik bisa dipercaya, sekaligus mencegah kebingungan definisi yang sama seperti sekarang.

### 10.2 Kartu Statistik

Grid 2×2 di mobile dan 4×1 di desktop. Tiap kartu memuat: label kecil `--fg-2`, angka `--fs-metric`, sparkline tujuh hari (bisa kolom CSS sederhana tanpa library), dan footer sumber ("dari riwayat perangkat ini"). Hover memunculkan tooltip definisi — contoh: "Rata-rata akurasi dari semua misi yang selesai, bukan rekor terbaik".

### 10.3 Riwayat

Tabel di desktop, kartu di mobile. Kolom: tanggal, misi, mode, rank, skor, akurasi, WPM, status. Filter: rentang waktu, mode, dan "hanya yang selesai". Baris gagal tidak disembunyikan — kegagalan adalah data — tetapi diberi penanda warna status. Ekspor CSV tetap P2 sesuai roadmap.

---

## 11. Mobile dan Touch

Ini batasan game yang jujur: game ini butuh keyboard. Jangan disamarkan. Tiga lapis solusi.

### 11.1 Lapis 1 — Hidden Input (MVP)

```tsx
// src/hooks/useSoftKeyboard.ts (baru)
import { useEffect, useRef } from 'react';

export function useSoftKeyboard(enabled: boolean){
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    // fokus saat state play; jangan rebut fokus saat pemain sedang scroll
    const id = setTimeout(() => el.focus({ preventScroll: true }), 120);
    return () => clearTimeout(id);
  }, [enabled]);
  return ref;
}
```

```tsx
// di akar layar play
<input ref={kbRef} className="soft-kb" aria-hidden tabIndex={-1}
       autoCapitalize="off" autoCorrect="off" autoComplete="off"
       inputMode="text" enterKeyHint="done"
       onChange={e => { onSoftKey(e.currentTarget.value.slice(-1)); e.currentTarget.value = ''; }}
       onKeyDown={e => { if (e.key === 'Enter') onSoftEnter(); }} />
```

```css
.soft-kb{ position:fixed; bottom:0; left:0; width:1px; height:1px;
          opacity:0; pointer-events:none; border:0; padding:0; }
```

Batasan yang harus jujur disampaikan lewat copy: keyboard virtual Android dan iOS sering gagal mengirim karakter khusus seperti `"` dan `;` karena butuh Shift. Karena itu perlu lapis kedua.

### 11.2 Lapis 2 — Banner Fallback (kejujuran)

Bila `matchMedia('(pointer: coarse)').matches`:

- Di **kartu misi** lebih dari lima baris: badge `⌨ Butuh keyboard fisik` dengan tooltip "Game ini butuh keyboard. Di ponsel, keyboard virtual sering tidak bisa mengetik tanda baca kode."
- Saat masuk ke play: banner sekali yang bisa ditutup — "Aplikasi ini dioptimalkan untuk keyboard fisik." Jangan pernah menjadi layar penuh.

### 11.3 Lapis 3 — Layout Portrait

```
┌─────────────────────┐
│ ‹ #03         01:12 │  ← top ringkas: timer + pause
├─────────────────────┤
│ HP 🦈85  OD ◔72%  x2.5│  ← rail menjadi strip horizontal
│ [✓ACC][✓HP][○WPM]   │
├─────────────────────┤
│                     │
│   const .card {     │  ← papan kode, min 15px, tidak boleh wrap
│     display: grid;  │
│   }                 │
│                     │
├─────────────────────┤
│ ▰▰▰▰▰▰▰▱▱▱ 7/12     │
│ ⌨ v  b  ,  .  ⏎      │  ← keycap hint (dapat dimatikan)
└─────────────────────┘
```

Breakpoint: di bawah 900px rail menyatu menjadi strip atas; di bawah 600px keycap hint default mati; `padding-bottom: env(safe-area-inset-bottom)` untuk>iPhone.

### 11.4 Gestur dan Polish

- `touch-action: manipulation` pada tombol; `user-select: none` pada papan kode.
- Jangan `preventDefault` scroll secara global — halaman hasil harus tetap bisa di-scroll.
- Mengetuk papan kode memunculkan keyboard virtual, tetapi fokus tidak diambil otomatis saat halaman dimuat, agar keyboard tidak muncul di tengah Briefing.

---

## 12. Aksesibilitas

| Area | Tindakan |
|---|---|
| Kontras | Warna semantik dinaikkan sedikit (§3.4); caption penting memakai `--fg-1` |
| Focus | `:focus-visible` dengan ring `--info` 2px, tidak pernah dihapus; semua kontrol dapat di-Tab |
| Screen reader | Papan kode diberi `aria-label="Kode target, baris 3 dari 12"`; karakter kursor `aria-live` **mati** (terlalu sering), hanya milestone dan rank-up yang `polite` |
| Gerak | `prefers-reduced-motion` sudah ada — pastikan vignette HP dan wiggle hiu ikut mati |
| Ukuran teks | Semua token memakai `clamp()`; zoom 200% tidak boleh memotong HUD (uji dengan device toolbar) |
| Tombol | Target minimal 44×44px di mobile |
| Aksi destruktif | Reset progres memakai konfirmasi dua langkah dengan label jelas, bukan `window.confirm` |

---

## 13. Microcopy Bahasa Indonesia

Nada: santai tapi jelas, seperti rekan ngobrol yang paham teknis. Hindari "Anda gagal!" — gunakan kondisi, bukanakosasi.

| Situasi | Copy |
|---|---|
| Kalimat ajakan | "Ketik ulang. Lihat hasilnya jalan." |
| Briefing baris 1 | "Ketik ulang baris di bawah ini persis. Kalau selesai, kode kamu benar-benar jalan di preview." |
| Briefing baris 2 | "Mode <mode>: satu salah = −<dmg> HP. Total HP 100." |
| Briefing baris 3 | "Rank S: akurasi ≥97% + HP ≥70 + ritme ≥60 WPM." |
| Syarat belum tercapai | "Belum S? Cek chip di sisi layar — itu yang sedang hilang." |
| Countdown batal | "Esc untuk batal." |
| Pause | "Dijeda. Sisa waktu <mm:ss>." |
| Resume | "Lanjut? 3… 2… 1… (tahan tombol untuk langsung gas)" |
| Gagal | "Hiu tenggelam di baris <n>. Skor parsial <x>." |
| Misi terkunci | "Selesaikan <misi> dulu." |
| DB offline | "Mode offline: progres tetap aman di perangkat ini." |
| Rekor | "Rekor baru! +<n>." |
| Latihan selesai | "Jari sudah panas. Coba Misi 01." |

> ⚠️ Catatan jujur: ANALISIS §6 menyatakan sinkronisasi ulang untuk upaya offline **belum diimplementasikan**. Karena itu copy "akan terkirim otomatis" tidak boleh muncul sebelum outbox (§14) benar-benar ada.

---

## 14. Instrumentasi dan Analytics

Karena `game_history` sudah ada, tambahkan beberapa kolom nullable kecil untuk mengukur **UI**, bukan hanya gameplay:

```sql
ALTER TABLE game_history
  ADD COLUMN pauses        TINYINT     NULL,  -- jumlah pause
  ADD COLUMN pauses_ms     INT         NULL,  -- total ms terpaused
  ADD COLUMN used_help     TINYINT     NULL,  -- memakai keycap hint / panel syarat
  ADD COLUMN top3_errors   VARCHAR(12) NULL,  -- " ; \""
  ADD COLUMN check_s_end   VARCHAR(24) NULL,  -- "acc:ok;hp:ok;wpm:no" saat selesai
  ADD COLUMN device         VARCHAR(8)  NULL;  -- 'desktop' | 'touch'
```

Tambahkan kolom ini ke whitelist validasi di `api/index.php`, sama seperti field yang sudah Anda tangani.

Dari sana, dasbor bisa menjawab beberapa pertanyaan nyata:

- Apakah rank chips membantu? Bandingkan seberapa sering `check_s_end` berisi `hp:no` pada pemain yang memakai panel syarat dengan yang tidak.
- Apakah pause lebih dari dua kali berkorelasi dengan kegagalan? Kalau ya, level itu mungkin terlalu berat secara emosional.
- Berapa persen pemain yang berhenti di layar countdown? Butuh event `abandoned` — cukup tulis attempt dengan `status='abandoned'` saat keluar dari state play tanpa finish.

Tidak perlu library analitik; `GROUP BY` di SQL sudah cukup untuk skala ini.

---

## 15. Roadmap Implementasi

Estimasi untuk satu developer; effort relatif.

### Fase 0 — Kebenaran Kecil (½ hari, tanpa risiko)

| Item | File | Detail |
|---|---|---|
| Perbaiki perfect line terakhir | `TypingGame.tsx` (`finish()` | `if (errSinceLine === 0 && lastLineLen > 0) perfects++` |
| WPM gagal di bawah 1 detik | sudah ada di v0.2 | verifikasi ulang |
| Esc di countdown | keydown handler | guard `phase === 'countdown'` |
| Token warna v3 | `index.css` | ganti nilai, cek kontras |

### Fase 1 — HUD (2–3 hari, dampak tertinggi)

1. `src/lib/rank.ts` dengan `rankChips()`.
2. Komponen: `OverdriveGauge`, `ComboMeter`, `HudMetrics`, `RankChips`, `DamageLog`, `KeycapHint`, `LineProgress`.
3. `useAutoPause` dan `PauseOverlay` (blur, Esc, resume countdown).
4. Telegraph overdrive 1,5 detik.
5. Re-layout: rail desktop menjadi strip mobile di bawah 900px.

*Acceptance:* pemain bisa menjawab "apakah saya masih bisa S?" dalam satu detik hanya dengan melihat chip; pause tidak mematikan sesi; tidak ada elemen yang menutupi papan kode di 390px.

### Fase 2 — Layar Hasil (2 hari)

1. `ScoreEvent[]` di loop dan fungsi `summarize()`.
2. `ResultScreen.tsx`: headline dan alasan rank → metrik → waterfall → peta baris → coaching → progresi → CTA.
3. `getRankReason()` dan rule engine coaching.
4. Layout mobile susun vertikal.

*Acceptance:* pemain bisa menyebutkan **kenapa** dia mendapat rank X dan **satu hal** yang harus diperbaiki, tanpa membuka dokumen apa pun.

### Fase 3 — Onboarding dan Briefing (1–2 hari)

1. Layar pembuka sekali jalan.
2. Ruang Latihan (`lessonId: 'practice'`, mode noFail).
3. Briefing tiga baris sebelum countdown.
4. Toast tips kontekstual (maksimal tiga per misi).

### Fase 4 — Mobile (1–2 hari)

1. `useSoftKeyboard` dan `.soft-kb`.
2. Badge "Butuh keyboard" dan banner sekali.
3. Layout portrait plus safe-area.

### Fase 5 — Dashboard dan Statistik Jujur (1 hari)

1. `stats.avgAcc` ke kartu metrik beserta label `n=`.
2. Tabel riwayat dan filter.
3. `ALTER TABLE` untuk kolom instrumentation dan validasi API.

### Fase 6 — Polish (berkalaon-demand)

- Sparkline tujuh hari.
- Progress rail menuju level berikutnya yang bisa diklik.
- Satu animasi transisi layar yang konsisten.

**Prioritas bila waktu mepet:** Fase 1 → Fase 2 → Fase 5 → Fase 3 → Fase 4.

---

## 16. QA dan Test Checklist

**HUD**

- [ ] Ketiga chip syarat rank terlihat di 1440p dan 390p.
- [ ] Overdrive: gauge → telegraph → aktif → reset, tidak ada state yang tersangkut.
- [ ] Combo: angka tier selalu sama dengan intensitas glow.
- [ ] Damage log: maksimal delapan, fade 2,5 detik, tidak menimpa baris baru.
- [ ] Blur tab saat HP 20 → overlay pause muncul dalam 200 ms; resume 3-2-1; tidak ada TIME Penalty dari waktu blur.

**Hasil**

- [ ] Rank S dengan akurasi 98% dan HP 82 → headline menyebut **ketiga** faktor.
- [ ] Waterfall berjumlah sama dengan skor final (selisih pembulatan overdrive diperbolehkan).
- [ ] Gagal di baris 7 → kalimat "sudah dikuasai 1–6" benar.
- [ ] Coaching: hanya satu tips, spesifik, dan menyebut angka.
- [ ] Rekor: delta skor dan badge muncul; tanpa rekor tidak ada badge.

**Mobile**

- [ ] iPhone SE (375px) dan Pixel 7: papan kode tidak wrap, HUD tidak bertumpuk.
- [ ] Gboard bisa mengirim `"` dan `;` lewat hidden input, atau banner fallback muncul.
- [ ] Keycap hint mati secara default di mobile, menyala di desktop untuk Lv.1–2.

**Aksesibilitas**

- [ ] `prefers-reduced-motion`: vignette, wiggle, confetti, dan pulse mati.
- [ ] Urutan Tab: Mulai → pause → menu pause → chip syarat.
- [ ] Caption `--fg-2` tetap di atas rasio 4.5:1 dan tidak dipakai untuk angka penting.
- [ ] Zoom 200% tidak memotong HUD.

**Regresi**

- [ ] Skor, rank, dan XP tidak berubah oleh Fase 0–2 (UI only) — bandingkan dengan ANALISIS §2.
- [ ] `game_history` tetap menerima payload lama; kolom baru nullable.

---

## 17. File yang Perlu Saya Lihat untuk Membuat Diff Persis

Kirim dalam zip atau tempel:

1. `src/components/TypingGame.tsx` — terutama loop, `getRank()`, `finish()`, state HUD, dan countdown. Paling penting.
2. `src/index.css` — blok token, warna, dan motion yang sekarang.
3. `src/App.tsx` (atau router) beserta komponen Home/Misi dan Dashboard.
4. `src/lib/api.ts` — bentuk `HistoryResponse` dan `stats`.
5. `api/index.php` — bagian validasi payload `attempt` (untuk kolom instrumentation).
6. `package.json` — versi React, apakah ada Tailwind atau clsx.
7. `tree -L 3 src` dan satu contoh data misi, agar saya tahu nama field yang dipakai.

Dengan itu saya bisa mengembalikan diff siap-paste per file beserta daftar penyesuaian nama variabel yang harus Anda lakukan manual.

---

*Dokumen ini adalah spesifikasi, bukan kode yang sudah dijalankan. Semua angka merujuk `ANALISIS.md` dan perlu diverifikasi terhadap sumber sebelum diimplementasikan — checklist ada di §16.*
