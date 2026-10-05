import kucingImg from "../assets/kucing.jpg";

export type ModuleId = "html" | "css" | "js";

export interface TheorySlide {
  kicker: string;
  title: string;
  body: string[];
  code?: string;
  caption?: string;
}

export interface Lesson {
  id: string;
  module: ModuleId;
  number: number; // nomor misi dalam modul (1-based)
  title: string;
  tagline: string;
  xp: number;
  difficulty: 1 | 2 | 3;
  theory: TheorySlide[];
  exercise: { instruction: string; code: string };
  buildPreview: (typed: string) => string;
}

export interface ModuleInfo {
  id: ModuleId;
  label: string;
  sub: string;
  color: string;
  icon: "tag" | "brush" | "bolt";
  watermark: string;
  blurb: string;
}

export const MODULES: ModuleInfo[] = [
  {
    id: "html",
    label: "HTML",
    sub: "Fondasi & Struktur",
    color: "#35e0ff",
    icon: "tag",
    watermark: "</>",
    blurb: "Kerangka dari semua halaman web: tag, elemen, dan atribut.",
  },
  {
    id: "css",
    label: "CSS",
    sub: "Gaya & Warna",
    color: "#ffc65c",
    icon: "brush",
    watermark: "{:}",
    blurb: "Kulit yang membuat halaman cantik: warna, box model, dan layout.",
  },
  {
    id: "js",
    label: "JavaScript",
    sub: "Logika & Aksi",
    color: "#ff5d73",
    icon: "bolt",
    watermark: "JS( )",
    blurb: "Otak yang membuat web hidup: variabel, fungsi, dan event.",
  },
];

/* ---------- perakit halaman preview ---------- */

const htmlPage = (inner: string, extraStyle = "") => `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: 'Trebuchet MS', 'Segoe UI', sans-serif; margin: 0; padding: 28px; background: #f4f9ff; color: #17324a; }
  ${extraStyle}
</style>
</head>
<body>
${inner}
</body>
</html>`;

const SCAFFOLD_KARTU = `<div class="kartu">
  <h2 class="judul">Kartu Keren</h2>
  <p class="deskripsi">CSS membuat halaman jadi indah.</p>
  <button class="tombol">Klik Aku</button>
</div>`;

const SCAFFOLD_FLEX = `<div class="baris">
  <div class="kotak">1</div>
  <div class="kotak">2</div>
  <div class="kotak">3</div>
</div>`;

const jsPage = (body: string, typed: string) => `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Trebuchet MS', sans-serif; margin: 0; padding: 28px; background: #101d2c; color: #e8f2ff; }
  #judul { color: #ffd479; }
  #tombol { font: 700 15px 'Trebuchet MS', sans-serif; padding: 10px 18px; border: none; border-radius: 10px; background: #35e0ff; color: #062033; cursor: pointer; }
  #tombol:hover { background: #7feaff; }
  #konsol { margin-top: 20px; background: #08111c; border: 1px solid #23425f; border-radius: 10px; padding: 12px 14px; min-height: 56px; }
  #konsol .label { font: 700 11px monospace; letter-spacing: 3px; color: #58809f; margin-bottom: 6px; }
</style>
</head>
<body>
${body}
<div id="konsol"><div class="label">K O N S O L</div></div>
<script>
  (function () {
    var k = document.getElementById("konsol");
    var asli = console.log;
    console.log = function () {
      var baris = document.createElement("div");
      baris.textContent = "> " + Array.prototype.join.call(arguments, " ");
      baris.style.cssText = "padding:3px 0;color:#3dffa8;font-family:monospace;font-size:14px";
      k.appendChild(baris);
      asli.apply(console, arguments);
    };
  })();
</script>
<script>
try {
${typed}
} catch (err) {
  var d = document.createElement("div");
  d.textContent = "Error: " + err.message;
  d.style.cssText = "color:#ff5d73;font-family:monospace;padding:3px 0";
  document.getElementById("konsol").appendChild(d);
}
</script>
</body>
</html>`;

/* ---------------- DUNIA 1 : HTML ---------------- */

const html1: Lesson = {
  id: "html-1",
  module: "html",
  number: 1,
  title: "Tag & Elemen Pertamamu",
  tagline: "Bicara dengan browser lewat tag pembuka dan penutup.",
  xp: 100,
  difficulty: 1,
  theory: [
    {
      kicker: "DASAR SEKALI",
      title: "Apa itu HTML?",
      body: [
        "HTML (HyperText Markup Language) adalah kerangka dari SEMUA halaman web. Dialah yang memberi tahu browser: “ini judul”, “ini paragraf”, “ini gambar”.",
        "Browser membaca HTML dari atas ke bawah, lalu menyusunnya menjadi halaman yang kamu lihat. Tanpa HTML, tidak ada web.",
      ],
    },
    {
      kicker: "ANATOMI",
      title: "Struktur sebuah Tag",
      body: [
        "Hampir semua elemen HTML punya tiga bagian: tag pembuka, isi, lalu tag penutup. Tag penutup selalu diawali garis miring ( / ).",
        "Salah menutup tag = browser bingung. Disiplin adalah skill nomor satu!",
      ],
      code: '<h1>Halo, Dunia!</h1>\n<p>Ini sebuah paragraf.</p>\n<b>Teks tebal</b>',
      caption: "h1 = judul besar • p = paragraf • b = bold (tebal)",
    },
    {
      kicker: "LEVEL UP",
      title: "Atribut: info tambahan",
      body: [
        "Atribut ditulis di dalam tag pembuka dengan format nama=\"nilai\". Dia memberi data ekstra pada elemen.",
        "Nanti atribut class jadi jembatan ke CSS, dan href jadi jembatan antar halaman. Satu pola, banyak kekuatan.",
      ],
      code: '<p class="peringatan">Awas panas!</p>',
      caption: "class akan kita pakai lagi di dunia CSS",
    },
  ],
  exercise: {
    instruction:
      "Ketik ulang struktur HTML pertamamu. Perhatikan tag pembuka, isi, dan penutupnya!",
    code: '<h1>Halo, Dunia!</h1>\n<p>Ini adalah website pertamaku.</p>\n<p>Aku sedang belajar <b>HTML</b>.</p>',
  },
  buildPreview: (t) => htmlPage(t),
};

const html2: Lesson = {
  id: "html-2",
  module: "html",
  number: 2,
  title: "Gambar & Link",
  tagline: "Dua tag yang membuat web terasa hidup dan terhubung.",
  xp: 120,
  difficulty: 2,
  theory: [
    {
      kicker: "TAG LEGENDARIS",
      title: "img dan a",
      body: [
        "img menampilkan gambar, a (anchor) membuat link. Dua tag ini alasan web disebut HYPERtext — semuanya saling terhubung.",
        "Keduanya termasuk tag mandiri: tidak butuh tag penutup.",
      ],
      code: '<img src="foto.jpg" alt="Seekor kucing">\n<a href="https://mdn.dev">Buka MDN</a>',
      caption: "img = image • a = anchor (jangkar link)",
    },
    {
      kicker: "ATRIBUT INTI",
      title: "src dan alt",
      body: [
        "src (source) = lokasi file gambar. alt (alternative) = teks pengganti yang muncul jika gambar gagal dimuat.",
        "alt juga dibacakan oleh screen reader — menulis alt yang baik = web yang ramah untuk semua orang.",
      ],
      code: '<img src="kucing.jpg" alt="Kucing oranye sedang melambaikan tangan">',
      caption: "alt bukan formalitas — dia pahlawan aksesibilitas",
    },
    {
      kicker: "JANTUNGNYA WEB",
      title: "href: tujuan link",
      body: [
        "href (hypertext reference) berisi alamat tujuan: bisa URL lengkap seperti https://…, atau halaman lain di website-mu.",
        "Klik link = browser pindah halaman. Sesederhana itu, sekuat itu.",
      ],
      code: '<a href="https://developer.mozilla.org">Dokumentasi web terbaik</a>',
      caption: "MDN Web Docs — buku suci para developer",
    },
  ],
  exercise: {
    instruction:
      'Rakit halaman tentang kucingmu: judul, gambar, dan link. (Saat preview, "kucing.jpg" otomatis diganti foto asli!)',
    code: '<h2>Kucingku</h2>\n<img src="kucing.jpg" alt="Kucing oranye">\n<a href="https://developer.mozilla.org">Baca docs MDN</a>',
  },
  buildPreview: (t) => htmlPage(t.replace("kucing.jpg", kucingImg)),
};

const html3: Lesson = {
  id: "html-3",
  module: "html",
  number: 3,
  title: "List & Navigasi",
  tagline: "Menyusun daftar dan menu — elemen bersarang pertama.",
  xp: 150,
  difficulty: 3,
  theory: [
    {
      kicker: "DAFTAR",
      title: "ul, ol, dan li",
      body: [
        "ul (unordered list) = daftar berpoin. ol (ordered list) = daftar bernomor. Keduanya berisi li (list item).",
        "Perhatikan indentasi: elemen di dalam elemen ditulis menjorok. Ini bukan sekadar gaya — ini cara berpikir.",
      ],
      code: "<ul>\n  <li>Nasi goreng</li>\n  <li>Sate ayam</li>\n</ul>",
      caption: "2 spasi per level sarang — kebiasaan pro",
    },
    {
      kicker: "SARANG TAG",
      title: "Elemen di dalam elemen",
      body: [
        "Kekuatan HTML ada di sarang-menyarang: list di dalam nav, paragraf di dalam div, link di dalam li.",
        "Pola menu website di seluruh dunia ya begini: nav → ul → li → a.",
      ],
      code: '<nav>\n  <ul>\n    <li><a href="/">Beranda</a></li>\n  </ul>\n</nav>',
      caption: "Tiga level sarang — kamu sudah siap!",
    },
    {
      kicker: "KEBIASAAN BAIK",
      title: "Tag semantik",
      body: [
        "Selain div yang serbaguna, HTML punya tag bermakna: nav untuk menu, header untuk kepala halaman, main untuk isi utama, footer untuk kaki.",
        "Tag semantik membantu mesin pencari dan screen reader memahami halamanmu. Gunakan sejak hari pertama!",
      ],
    },
  ],
  exercise: {
    instruction:
      "Bangun menu navigasi bersarang: nav membungkus ul, ul membungkus tiga li. Indentasi 2 spasi!",
    code: "<nav>\n  <ul>\n    <li>Beranda</li>\n    <li>Materi</li>\n    <li>Tentang</li>\n  </ul>\n</nav>",
  },
  buildPreview: (t) =>
    htmlPage(
      t,
      "nav { background: #17324a; border-radius: 12px; padding: 6px 18px; display: inline-block; } ul { list-style: none; display: flex; gap: 18px; margin: 8px 0; padding: 0; } li { color: #ffe3ad; font-weight: bold; }"
    ),
};

/* ---------------- DUNIA 2 : CSS ---------------- */

const css1: Lesson = {
  id: "css-1",
  module: "css",
  number: 1,
  title: "Selektor, Warna & Font",
  tagline: "Aturan pertamamu: pilih elemennya, hias propertinya.",
  xp: 100,
  difficulty: 1,
  theory: [
    {
      kicker: "ATURAN PERTAMA",
      title: "CSS = kulit & gaya",
      body: [
        "Jika HTML adalah kerangka, CSS adalah kulit, warna, dan bajunya. Satu aturan CSS ditulis begini: selektor { properti: nilai; }",
        "Selektor memilih elemen, properti menentukan apa yang diubah, nilai menentukan jadinya.",
      ],
      code: "h1 {\n  color: hotpink;\n}",
      caption: "Semua h1 di halaman jadi pink — satu aturan, efek massal",
    },
    {
      kicker: "SELEKTOR CLASS",
      title: "Titik di depan nama",
      body: [
        "Menulis class=\"judul\" di HTML? Di CSS dia dipanggil dengan titik: .judul. Satu class bisa dipakai banyak elemen sekaligus.",
        "Ini cara utama developer menata halaman — bukan per tag, tapi per class.",
      ],
      code: ".judul {\n  color: #ff5d73;\n  font-family: Georgia, serif;\n}",
      caption: "Warna hex diawali # — 6 digit kode warna",
    },
    {
      kicker: "NILAI WARNA",
      title: "Nama, hex, dan ukuran",
      body: [
        "Warna bisa ditulis dengan nama (hotpink), kode hex (#35e0ff), atau rgb(53, 224, 255). Semuanya valid!",
        "Ukuran teks pakai px: font-size: 18px. Kecil-besar, tebal-tipis — semua lewat CSS.",
      ],
      code: ".deskripsi {\n  color: #334455;\n  font-size: 18px;\n}",
    },
  ],
  exercise: {
    instruction:
      "Hias kartu demo: ganti warna latar halaman, judul, dan deskripsi. CSS-mu langsung diterapkan ke kartu di preview!",
    code: "body {\n  background: #eaf6ff;\n}\n.judul {\n  color: #ff5d73;\n  font-family: Georgia, serif;\n}\n.deskripsi {\n  color: #334455;\n  font-size: 18px;\n}",
  },
  buildPreview: (t) => htmlPage(SCAFFOLD_KARTU, t),
};

const css2: Lesson = {
  id: "css-2",
  module: "css",
  number: 2,
  title: "Box Model",
  tagline: "Padding, border, margin — rahasia setiap kartu cantik.",
  xp: 120,
  difficulty: 2,
  theory: [
    {
      kicker: "RAHASIA DESAIN",
      title: "Semua elemen = kotak",
      body: [
        "Setiap elemen HTML sejatinya adalah kotak. Dari dalam ke luar: isi (content) → bantalan (padding) → garis tepi (border) → jarak keluar (margin).",
        "90% masalah “kok tampilannya aneh” jawabannya ada di box model.",
      ],
    },
    {
      kicker: "KE DALAM",
      title: "Padding & border",
      body: [
        "padding memberi napas antara isi dan tepi kotak. border memberi garis tepi: tebalnya, gayanya, warnanya.",
        "border-radius melengkungkan sudut kotak — senjata rahasia UI modern.",
      ],
      code: ".kartu {\n  padding: 24px;\n  border: 4px solid #35e0ff;\n  border-radius: 16px;\n}",
      caption: "solid = garis penuh • ada juga dashed dan dotted",
    },
    {
      kicker: "KE LUAR",
      title: "Margin: jaga jarak",
      body: [
        "margin mendorong elemen lain menjauh. margin: 20px artinya jarak 20px ke segala arah.",
        "margin: 0 auto di kiri-kanan = trik klasik menengahkan blok elemen.",
      ],
      code: ".kartu {\n  margin: 20px auto;\n}",
      caption: "auto = bagi sisa ruang rata kiri-kanan",
    },
  ],
  exercise: {
    instruction:
      "Sulap kartu polos jadi kartu premium: latar putih, padding lega, border cyan, sudut melengkung, dan margin.",
    code: ".kartu {\n  background: white;\n  padding: 24px;\n  border: 4px solid #35e0ff;\n  border-radius: 16px;\n  margin: 20px;\n}",
  },
  buildPreview: (t) => htmlPage(SCAFFOLD_KARTU, t),
};

const css3: Lesson = {
  id: "css-3",
  module: "css",
  number: 3,
  title: "Flexbox",
  tagline: "Layout barisan rapi dengan satu baris sakti: display: flex.",
  xp: 150,
  difficulty: 3,
  theory: [
    {
      kicker: "SATU BARIS SAKTI",
      title: "display: flex",
      body: [
        "Beri sebuah wadah display: flex, dan semua anaknya otomatis berbaris rapi dalam satu baris. Selesai. Serius.",
        "Flexbox mengakhiri era hack layout aneh — sejak 2015, ini cara standar menata elemen.",
      ],
      code: ".baris {\n  display: flex;\n}",
      caption: "Anak-anak .baris langsung berbaris horizontal",
    },
    {
      kicker: "JARAK & ARAH",
      title: "gap dan flex-direction",
      body: [
        "gap: 12px memberi jarak antar anak — lebih rapi daripada margin manual. Tidak ada lagi jarak dobel di ujung!",
        "flex-direction: column menumpuk anak secara vertikal. Baris atau kolom, kamu yang pegang kendali.",
      ],
      code: ".baris {\n  display: flex;\n  gap: 12px;\n  flex-direction: column;\n}",
    },
    {
      kicker: "KENDALI PENUH",
      title: "justify-content",
      body: [
        "justify-content mengatur penyebaran anak di sepanjang baris: center (tengah), space-between (rata kiri-kanan), flex-end (ujung).",
        "Kombinasikan dengan align-items untuk kendali vertikal. Dua properti ini menjawab hampir semua kebutuhan layout.",
      ],
      code: ".baris {\n  justify-content: center;\n}",
      caption: "center = semua anak kumpul di tengah",
    },
  ],
  exercise: {
    instruction:
      "Tata tiga kotak jadi barisan rapi: aktifkan flex, beri jarak, tengahkan — lalu hias kotaknya.",
    code: ".baris {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n}\n.kotak {\n  background: #ffc65c;\n  padding: 20px;\n  border-radius: 12px;\n}",
  },
  buildPreview: (t) => htmlPage(SCAFFOLD_FLEX, t),
};

/* ---------------- DUNIA 3 : JAVASCRIPT ---------------- */

const js1: Lesson = {
  id: "js-1",
  module: "js",
  number: 1,
  title: "Variabel & console.log",
  tagline: "Wadah data pertama dan cara mengintip isi program.",
  xp: 100,
  difficulty: 1,
  theory: [
    {
      kicker: "OTAK WEB",
      title: "JavaScript menghidupkan web",
      body: [
        "HTML menyusun, CSS menghias, JavaScript BERTINDAK: bereaksi terhadap klik, berhitung, mengambil data, mengubah halaman.",
        "Semua dimulai dari variabel — wadah penyimpan data yang punya nama.",
      ],
      code: 'let nama = "Sinta";\nlet umur = 17;',
      caption: "Teks pakai tanda kutip, angka tidak",
    },
    {
      kicker: "ATURAN MAIN",
      title: "let, nama, dan nilai",
      body: [
        "Pola: let namaWadah = nilai; Nama wadah tidak boleh pakai spasi (pakai camelCase seperti skorTerbaik), dan setiap perintah diakhiri titik koma.",
        "Isi wadah bisa diganti kapan-kapan: nama = \"Budi\" — tanpa let lagi.",
      ],
      code: 'let kota = "Bandung";\nkota = "Surabaya";',
      caption: "let hanya saat pertama kali membuat wadah",
    },
    {
      kicker: "MATA-MATA",
      title: "console.log()",
      body: [
        "console.log() menampilkan nilai ke konsol — alat wajib untuk mengintip apakah program berjalan benar.",
        "Gabungkan teks dan variabel dengan tanda +. Di misi ini, hasil log-mu muncul di panel KONSOL preview!",
      ],
      code: 'console.log("Halo, " + nama);',
      caption: 'Tanda + menyambung teks — namanya concatenation',
    },
  ],
  exercise: {
    instruction:
      "Buat dua variabel, lalu tampilkan ke konsol dengan console.log. Cek panel KONSOL di preview!",
    code: 'let nama = "Sinta";\nlet umur = 17;\nconsole.log("Halo, " + nama);\nconsole.log("Umurku " + umur + " tahun");',
  },
  buildPreview: (t) =>
    jsPage('<h2 id="judul">Cek konsol di bawah!</h2>\n<button id="tombol">Tombol (untuk materi DOM)</button>', t),
};

const js2: Lesson = {
  id: "js-2",
  module: "js",
  number: 2,
  title: "Fungsi",
  tagline: "Bungkus kodemu jadi resep yang bisa dipakai berulang.",
  xp: 120,
  difficulty: 2,
  theory: [
    {
      kicker: "RESEP KODE",
      title: "function: tulis sekali, pakai selamanya",
      body: [
        "Fungsi adalah blok kode bernama. Tulis sekali, panggil berkali-kali — tanpa copy-paste.",
        "Pola: function namaFungsi(parameter) { …isi… }",
      ],
      code: 'function sapa(nama) {\n  return "Halo, " + nama;\n}',
      caption: "nama di dalam kurung = parameter (bahan masukan)",
    },
    {
      kicker: "MASUK & KELUAR",
      title: "Parameter dan return",
      body: [
        "Parameter adalah bahan yang masuk; return adalah hasil yang keluar. Tanpa return, fungsi tidak menghasilkan apa-apa.",
        "Analogi mesin jus: parameter = buah yang masuk, return = jus yang keluar.",
      ],
      code: 'function kaliDua(angka) {\n  return angka * 2;\n}',
      caption: "return juga langsung mengakhiri fungsi",
    },
    {
      kicker: "EKSEKUSI",
      title: "Memanggil fungsi",
      body: [
        "Fungsi hanya berjalan saat dipanggil: tulis namanya diikuti kurung berisi argumen. Hasil panggilannya bisa disimpan ke variabel.",
        'sapa("Budi") dan sapa("Sinta") — fungsi sama, hasil beda. Itulah kekuatannya.',
      ],
      code: 'let pesan = sapa("Budi");\nconsole.log(pesan);',
    },
  ],
  exercise: {
    instruction:
      "Buat fungsi sapa yang menerima nama dan mengembalikan sapaan, lalu panggil dua kali dengan nama berbeda.",
    code: 'function sapa(nama) {\n  return "Halo, " + nama + "!";\n}\nlet pesan = sapa("Budi");\nconsole.log(pesan);\nconsole.log(sapa("Sinta"));',
  },
  buildPreview: (t) =>
    jsPage('<h2 id="judul">Cek konsol di bawah!</h2>\n<button id="tombol">Tombol (untuk materi DOM)</button>', t),
};

const js3: Lesson = {
  id: "js-3",
  module: "js",
  number: 3,
  title: "DOM & Event",
  tagline: "Momen when JavaScript benar-benar memegang kendali halaman.",
  xp: 150,
  difficulty: 3,
  theory: [
    {
      kicker: "JEMBATAN",
      title: "DOM: HTML di mata JavaScript",
      body: [
        "DOM (Document Object Model) adalah wujud HTML yang bisa disentuh JavaScript. Ambil elemen dengan document.querySelector(\"...\").",
        "Setelah di tangan, elemennya bisa diubah seenaknya: teksnya, gayanya, bahkan dihapus.",
      ],
      code: 'let judul = document.querySelector("#judul");\njudul.textContent = "Diubah oleh JS!";',
      caption: "textContent = isi teks elemen",
    },
    {
      kicker: "ALAMAT ELEMEN",
      title: "# untuk id, titik untuk class",
      body: [
        "querySelector memakai bahasa selektor CSS: #judul memilih id=\"judul\", .kartu memilih class=\"kartu\".",
        "Satu ilmu CSS-mu terpakai lagi di sini — semua saling terhubung.",
      ],
      code: 'let tombol = document.querySelector("#tombol");',
      caption: "id ditulis unik — satu halaman satu #judul",
    },
    {
      kicker: "AKSI-REAKSI",
      title: "Event: merespons pengguna",
      body: [
        "Event adalah kejadian: klik, gerak mouse, tombol keyboard. Pasang \"pendengar\" dan fungsi akan jalan saat kejadian itu terjadi.",
        "tombol.onclick = function () { … } — inilah pola interaktivitas paling dasar di seluruh web.",
      ],
      code: 'tombol.onclick = function () {\n  console.log("Diklik!");\n};',
      caption: "Coba tebak: kapan pesan itu muncul?",
    },
  ],
  exercise: {
    instruction:
      "Misi pamungkas: buat tombol yang mengubah judul saat diklik. Klik tombolnya di preview — kodeMU yang bekerja!",
    code: 'let tombol = document.querySelector("#tombol");\ntombol.onclick = function () {\n  document.querySelector("#judul").textContent = "BOOM! Kamu hebat!";\n};',
  },
  buildPreview: (t) =>
    jsPage('<h2 id="judul">Belum ada yang berubah...</h2>\n<button id="tombol">Klik Aku!</button>', t),
};

export const LESSONS: Lesson[] = [html1, html2, html3, css1, css2, css3, js1, js2, js3];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

export const moduleLessons = (m: ModuleId) => LESSONS.filter((l) => l.module === m);

export const getModule = (m: ModuleId) => MODULES.find((x) => x.id === m)!;

/* ---------- Ruang Latihan (misi #0) — tidak masuk daftar LESSONS, tidak bisa gagal ---------- */

const PRACTICE_LINES = [
  'const hiu = "CodeShark";',
  "function sapa(nama) {",
  "  return `Halo, ${nama}!`;",
  "}",
  "const jurus = (x) => x * 2;",
  "if (hiu.length > 3) {",
  "  console.log(sapa(hiu));",
  "}",
];

/** Misi latihan 60 detik: melatih `;` `{}` `"` `=>` dan template literal — bukan skor. */
export function makePracticeLesson(): Lesson {
  return {
    id: "practice",
    module: "js",
    number: 0,
    title: "Ruang Latihan",
    tagline: "Pemanasan jari 60 detik — tidak ada HP, tidak bisa gagal.",
    xp: 0,
    difficulty: 1,
    theory: [
      {
        kicker: "PEMANASAN",
        title: "Jari sebelum kepala",
        body: [
          "Ketik ulang snippet mini di bawah. Tidak ada HP yang turun dan sesi berakhir otomatis setelah 60 detik — fokus pada ketepatan, bukan kecepatan.",
          "Perhatikan tanda baca: kutip \", kurung { }, dan panah => adalah ranjau paling umum.",
        ],
      },
    ],
    exercise: {
      instruction:
        "Latihan bebas: ketik ulang kode di bawah persis. Salah? Tidak apa-apa — HP tidak turun di ruang latihan.",
      code: PRACTICE_LINES.join("\n"),
    },
    buildPreview: (t) =>
      jsPage('<h2 id="judul">Ini kodemu — jalankan di konsol!</h2>', t),
  };
}
