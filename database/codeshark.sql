-- ============================================================
-- CodeShark — skema database riwayat permainan
-- Referensi/manual import (HeidiSQL / phpMyAdmin / mysql CLI).
-- Catatan: api/index.php juga mem-buat database & tabel ini
-- otomatis saat request pertama, jadi import manual opsional.
-- ============================================================

CREATE DATABASE IF NOT EXISTS codeshark
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codeshark;

-- Identitas pemain (satu baris per browser/perangkat)
CREATE TABLE IF NOT EXISTS players (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id  VARCHAR(64) NOT NULL UNIQUE,   -- uuid yang disimpan di localStorage
  name       VARCHAR(60) NULL,              -- untuk fitur nama pemain di masa depan
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Setiap upaya bermain (berhasil MAUPUN gagal) tercatat di sini
CREATE TABLE IF NOT EXISTS game_history (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id    INT UNSIGNED NOT NULL,
  client_uuid  CHAR(36) NOT NULL,           -- id unik dari client, menjamin idempoten
  lesson_id    VARCHAR(40) NOT NULL,        -- mis. "html-1", "js-3"
  module       VARCHAR(10) NOT NULL,        -- html | css | js
  mode         VARCHAR(10) NOT NULL DEFAULT 'standar', -- santai | standar | nitro
  status       ENUM('done','fail') NOT NULL DEFAULT 'done',
  rank         CHAR(1) NULL,                -- S | A | B | C (NULL saat gagal)
  score        INT NOT NULL DEFAULT 0,
  acc          FLOAT NOT NULL DEFAULT 0,    -- 0..1
  wpm          INT NOT NULL DEFAULT 0,
  max_combo    INT NOT NULL DEFAULT 0,
  errors       INT NOT NULL DEFAULT 0,      -- total salah ketik
  hp_left      SMALLINT NOT NULL DEFAULT 0,
  progress_pct FLOAT NOT NULL DEFAULT 100,  -- kemajuan ketik saat sesi berakhir
  time_sec     INT NOT NULL DEFAULT 0,
  xp_gained    INT NOT NULL DEFAULT 0,
  typed        MEDIUMTEXT NULL,             -- kode hasil ketikan (opsional, untuk fitur lanjutan)
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_uuid (client_uuid),
  KEY idx_player_time (player_id, created_at),
  CONSTRAINT fk_history_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Contoh: 10 upaya terbaru semua pemain
-- SELECT * FROM game_history ORDER BY created_at DESC LIMIT 10;
