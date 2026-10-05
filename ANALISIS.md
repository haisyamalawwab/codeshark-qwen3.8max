# ANALISIS MENDALAM — CodeShark v0.2

> Ditulis 2026-10-05. Mencakup: analisis kritis gameplay/mekanisme/tantangan, improvement grafis yang diimplementasikan, dan arsitektur database riwayat permainan.

---

## 1. Ringkasan Produk

CodeShark adalah *typing game* edukasi front-end (HTML/CSS/JS) dengan loop: **baca teori (slide) → ketik ulang kode persis → lihat preview hidup**. Progres (XP, skor, rank, lencana) tersimpan di localStorage; riwayat upaya kini juga tersimpan ke MySQL.

Loop intinya sehat dan jelas: setiap sesi pendek (30–120 detik), feedback instan berlapis (suara WebAudio, warna karakter, damage float, banner milestone), dan hadiah nyata di akhir (preview halaman yang benar-benar menjalankan kode ketikan pemain — motivator terkuat game ini).

## 2. Anatomi Mekanisme (angka aktual dari kode)

| Sistem | Rumus / Nilai | Catatan |
|---|---|---|
| Skor per karakter | `10 × (1 + 0.5 × min(4, floor(combo/12)))` | Tier pengali x1 → x3.0 di combo 12/24/36/48 |
| Baris baru | +40 skor | — |
| Milestone combo | 25/50/75/100/150 → +100/+250/+400/+600/+800 | Banner + sfx bertingkat |
| Garis sempurna | +80 skor, +2 HP | Dihitung saat Enter, butuh 0 salah sejak baris sebelumnya |
| Overdrive | Isi 1.7/karakter, 6/Enter, drain 12/salah; penuh = skor ×2 selama 8 dtk, +5 HP | Reset saat selesai; tercatat untuk lencana |
| HP | 100; damage per salah = 5 (Santai) / 9 (Standar) / 14 (Hiu Galak) | Tidak ada backspace; salah tidak memajukan kursor |
| Rank | S: acc ≥ 97% **dan** HP ≥ 70 · A: ≥ 92% · B: ≥ 84% · C: sisanya | acc = len/(len+salah) |
| XP | `lesson.xp × multRank (1–1.5) × multMode (0.8/1/1.6)` | Anti-farm: hanya delta terhadap XP terbaik yang masuk |
| Bonus HP akhir | `hp × 15` skor | Mendorong main bersih |
| Level | Naik tiap `150 × level` XP (kumulatif 150/450/900/1500/2250/3150/4200) | 7 nama level |

## 3. Kekuatan Desain

1. **Loop belajar→bukti.** Preview iframe (`sandbox="allow-scripts"` tanpa `allow-same-origin`, aman) menjalankan kode hasil ketikan — pemain *melihat* konsekuensi ketelitiannya. Ini diferensiator utama dibanding typing trainer biasa.
2. **Risk-reward berlapis.** Overdrive menghakimi main aman-vs-greed (drain 12/salah saat salah), bonus HP mendorong akurasi, mode memberi pilihan profil risiko (XP ×0.8 s/d ×1.6).
3. **Umpan balik yang mengajari.** Peta "ranjau terkuat" di akhir (karakter tersulit × frekuensi) mengubah kegagalan jadi data; damage float, sfx combo, dan banner milestone memberi rasa arcade.
4. **Anti-farm XP.** Mengulang misi tanpa memecah rekor tidak memberi XP — mencegah grinding passif.
5. **Progresi terkunci per dunia** (misi n+1 terbuka setelah n selesai) — struktur jelas tanpa membebani eksplorasi antar-dunia.

## 4. Temuan Kritis

Diurutkan dari yang paling berdampak. **[D]** = sudah diperbaiki/dimitigasi pada update ini.

### 4.1 Skor hampir buta terhadap kecepatan — P0
Skor per karakter hanya fungsi combo. Pemain lambat-tapi-akurat menghasilkan skor lebih tinggi daripada pemain cepat-akurat; rank pun tak melihat waktu. Di game ber-tagline "arcade", ini anomali.
**Rekomendasi:** tambahkan komponen kecepatan, mis. bonus +5/karakter saat live-WPM ≥ 40, atau jadikan WPM tie-breaker rank (dua pemain acc sama → WPM menentukan). Data sudah tersedia (`wpmLive`).

### 4.2 Kurva level: puncaknya mustahil dijangkau — P0
Total XP maksimum teoretis: semua misi Rank S di mode Hiu Galak ≈ 2.664 XP → Lv.5 nyaris, Lv.6 (3.150) hanya jika sempurna, **Lv.7 "Master Front-End" (4.200) mustahil**. Dua nama level adalah konten mati.
**Rekomendasi:** (a) XP ulangan kecil saat memecah rekor skor sendiri (mis. `+10% lesson.xp`, tetap anti-farm karena harus naik rekor), atau (b) turunkan kurva menjadi `120 × level`, atau (c) tambah konten. Database riwayat yang baru juga membuka jalur XP dari statistik (mis. lencana "100 upaya").

### 4.3 Syarat Rank S ganda & tersembunyi — P1
S butuh acc ≥ 97% **dan** HP ≥ 70 (≈ maksimal 3 salah di misi terpanjang). Tidak ada UI yang menjelaskan komponen HP ini; pemain bingung kenapa acc 98% hanya dapat A. (Kasus nyata saat pengujian: acc 97%, HP 80 → S; tanpa heal OD/garis sempurna akan gagal S.)
**Rekomendasi:** tampilkan checklist syarat rank di layar selesai atau tooltip HUD ("S: akurasi ≥97% + HP ≥70").

### 4.4 Tidak ada koreksi diri (tanpa Backspace) — P1 (pilihan desain)
Salah ketik permanen + HP -9 membuat belajar tanda baca kode (`"`, `{`, `;`) menyakitkan untuk pemula. Mode Santai (dmg 5) sebagian menjawab, tapi filosofi "salah tidak maju" tetap memaksa restart-through-failure.
**Rekomendasi:** di mode Santai saja, izinkan Backspace mundur tanpa skor (combo reset) — jembatan pedagogis sebelum standar ketat.

### 4.5 Konten & tantangan tipis; pemahaman tidak diuji — P0 (jangka menengah)
9 misi × 3–5 baris; "kesulitan" naik via panjang kode, bukan kompleksitas konsep. Tidak ada satupun mekanisme yang menguji apakah pemain *paham* — mengetik ulang bisa dilakukan tanpa membaca teori (nilai edukasi bergantung pada kejujuran pemain).
**Rekomendasi berurutan:**
- **Misi isian** (fill-in-the-blank): kode dengan lubang `[___]` yang harus diisi jawaban dari teori (mis. isi `gap` pada soal flexbox) — menguji ingatan, tetap memakai mesin ketik yang sama.
- **Misi perbaikan bug**: kode rusak ditampilkan, pemain mengetik versi benar — menguji pemahaman error.
- **Kuis gerbang antar-dunia**: 3 soal pilihan ganda sebelum Dunia 2/3 terbuka.
- **Misi build-bebas**: target visual (screenshot kartu), pemain menulis kode dari nol, diverifikasi via checklist string di preview.

### 4.6 Baris sempurna terakhir tidak pernah terhitung — P2 [D-dokumen]
`perfects` bertambah saat karakter Enter diketik; baris terakhir (tanpa Enter di ujung) tidak pernah masuk hitungan. Kecil, tapi tidak adil untuk run sempurna.
**Rekomendasi:** saat `finish()`, jika `errSinceLine === 0` dan baris terakhir punya ≥1 karakter, hitung sebagai garis sempurna.

### 4.7 Statistik dashboard kabur — P2
"AKURASI RATA-RATA" mengambil acc dari hasil **best-by-score** per misi (bukan akurasi terbaik, bukan rata-rata upaya). Definisi tidak konsisten dengan labelnya.
**Rekomendasi:** dengan database riwayat, hitung akurasi rata-rata dari seluruh upaya `done` (endpoint `stats.avgAcc` sudah menyediakan).

### 4.8 Mobile tidak bisa main — P1
Handler `window.keydown` + kebutuhan karakter khusus membuat game tidak bisa dimainkan di layar sentuh; baru terasa saat sudah di layar countdown.
**Rekomendasi:** trik input tersembunyi (hidden `<input>` yang memicu fokus keyboard virtual) sebagai minimum viable mobile, atau badge eksplisit "Butuh keyboard fisik" di kartu misi saat perangkat touch terdeteksi.

### 4.9 Lain-lain — P2
- Tidak ada auto-pause saat tab kehilangan fokus; timer jalan terus (menghukum pemain yang diselping notifikasi).
- Esc tidak berfungsi saat countdown; tombol keyboard yang ditekan saat countdown terbuang (seharusnya dibuffer atau diabaikan secara eksplisit dengan hint).
- Font dari Google Fonts — di offline, fallback system cukup baik (sudah ada), tapi selera huruf display berubah drastis.
- Reset progres hanya membersihkan localStorage; riwayat di MySQL sengaja tetap (audit trail) — perlu dijelaskan di UI bila nanti ada leaderboard.

## 5. Improvement Grafis — Diimplementasikan pada Update Ini

Semua di `src/components/TypingGame.tsx` + `src/index.css`:

1. **Ghost char salah ketik.** Kelas `.ch-wrong` sebelumnya *didefinisikan tapi tidak pernah dipakai*. Kini karakter yang salah ditekan tampil sesaat (300 ms) merah di posisi kursor, menggantikan karakter target — pemain tahu *apa yang dia tekan* vs *apa yang diminta*. Ini perbaikan feedback-loop belajar terpenting.
2. **Maskot hiu di sel HP.** Ikon hiu miring + "tenggelam" seiring HP turun (rotasi/translasi proporsional), bergetar saat kena damage, dan panik (wiggle cepat) saat HP ≤ 30 — game bernama Code*Shark* tapi sebelumnya tidak ada hiu yang bereaksi.
3. **Vignette bahaya.** Tepi layar berdenyut merah saat HP ≤ 30 selama permainan — sinyal darurat tanpa mengganggu area baca kode.
4. **Aura combo.** Papan kode memancarkan glow merah yang menguat dengan tier pengali (x1.5 → x3.0), via `filter: drop-shadow` sehingga mengikuti bentuk clip-path panel.
5. **Nomor baris selesai.** Berubah hijau bercahaya saat baris tuntas — progress terasa per baris, bukan hanya persen.
6. **`prefers-reduced-motion`.** Semua animasi dekoratif (bubble, ticker, confetti, pulse, dll.) dinonaktifkan/disederhanakan untuk pengguna sensitif gerak.
7. **Perbaikan WPM jalur gagal.** Upaya gagal instan tidak lagi menghasilkan WPM absurd (kasus uji: "582 wpm" pada gagal 2 detik) — WPM gagal kini dihitung tanpa lantai 2 detik dan 0 bila < 1 detik.

## 6. Database Riwayat Permainan — Arsitektur

```
Browser (React)                Laragon Apache+PHP              MySQL
┌──────────────┐   fetch /api  ┌──────────────┐   PDO    ┌──────────────┐
│ src/lib/api  │ ────────────► │ api/index.php│ ───────► │ codeshark    │
│ localStorage │  (proxy Vite  │  (1 file)    │ prepared │ players      │
│  = progres   │   di dev)     │ health /     │ statements│ game_history │
└──────────────┘               │ history /    │          └──────────────┘
   offline tetap main          │ attempt      │
```

- **Skema** (`database/codeshark.sql`, dibuat otomatis oleh PHP saat request pertama):
  - `players` — satu baris per browser (`device_id` UUID dari localStorage; kolom `name` siap untuk fitur nama pemain).
  - `game_history` — **setiap upaya, menang maupun gagal**: lesson, module, mode, status, rank, skor, akurasi, wpm, combo, error, HP sisa, progres %, waktu, XP didapat, kode ketikan, timestamp. `client_uuid` unik → idempoten (klik ganda/retry jaringan tidak menduplikasi baris).
- **Endpoint** `api/index.php`: `?action=health` (cek DB), `?action=history&device=…&limit=…` (riwayat + agregat), `POST ?action=attempt` (simpan; validasi whitelist module/mode/rank, batas numerik, prepared statements).
- **Offline-first:** bila Apache/MySQL mati, game tetap berjalan penuh; indikator footer menampilkan `● riwayat tersambung` / `● database offline`, dan panel riwayat menampilkan pesan pemulihan. Sinkronisasi ulang otomatis untuk upaya yang gagal terkirim *belum* diimplementasikan (outbox di localStorage adalah langkah lanjutan yang wajar).
- **Dev:** `vite.config.ts` mem-proxy `/api/*` → `http://localhost/CODESHARK/qwen3.8max/api/` (Apache). **Prod:** build single-file diletakkan di folder proyek; path relatif `api/index.php` langsung jalan.
- **Kredensial** di konstanta atas `api/index.php` (`root`/`password` — sesuai Laragon di mesin ini; ubah di satu tempat bila berbeda).

## 7. Prioritas Roadmap

| Prioritas | Item |
|---|---|
| **P0** | Skor berbasis kecepatan (4.1) · perbaiki kurva level / XP rekor (4.2) · misi isian & kuis gerbang (4.5) |
| **P1** | Tampilkan syarat Rank S di UI (4.3) · dukungan keyboard virtual mobile (4.8) · outbox sinkronisasi riwayat offline · leaderboard lokal dari `game_history` |
| **P2** | Perfect-line terakhir (4.6) · statistik akurasi dari DB (4.7) · auto-pause on blur · nama pemain (kolom `players.name` sudah siap) · ekspor riwayat CSV |

---

### Lampiran: cara uji cepat
```
# 1. Start Apache + MySQL di Laragon
# 2. cd D:\laragon\www\CODESHARK\qwen3.8max && npm run dev  → buka http://localhost:5174/
# 3. Cek API:  http://localhost/CODESHARK/qwen3.8max/api/index.php?action=health
# 4. Riwayat via MySQL: SELECT * FROM codeshark.game_history ORDER BY id DESC;
```
