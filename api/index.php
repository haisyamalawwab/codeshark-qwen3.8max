<?php
/**
 * CodeShark API — riwayat permainan (MySQL via PDO).
 *
 * Endpoint (semua lewat file ini):
 *   GET  ?action=health                       → cek API + koneksi DB
 *   GET  ?action=history&device=<uuid>&limit=12 → riwayat upaya terbaru + agregat
 *   POST ?action=attempt  (JSON body)         → simpan satu upaya (idempoten via client_uuid)
 *
 * Konfigurasi MySQL di bawah — sesuaikan bila kredensial Laragon berbeda.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const DB_HOST = '127.0.0.1';
const DB_USER = 'root';
const DB_PASS = 'password';
const DB_NAME = 'codeshark';

function fail(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $opt = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    try {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';charset=utf8mb4', DB_USER, DB_PASS, $opt);
    } catch (PDOException) {
        fail(503, 'MySQL tidak terjangkau. Pastikan MySQL sudah Start di Laragon.');
    }
    try {
        $pdo->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $pdo->exec('USE `' . DB_NAME . '`');
        $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS players (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id  VARCHAR(64) NOT NULL UNIQUE,
  name       VARCHAR(60) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
SQL);
        $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS game_history (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  player_id    INT UNSIGNED NOT NULL,
  client_uuid  CHAR(36) NOT NULL,
  lesson_id    VARCHAR(40) NOT NULL,
  module       VARCHAR(10) NOT NULL,
  mode         VARCHAR(10) NOT NULL DEFAULT 'standar',
  status       ENUM('done','fail') NOT NULL DEFAULT 'done',
  rank         CHAR(1) NULL,
  score        INT NOT NULL DEFAULT 0,
  acc          FLOAT NOT NULL DEFAULT 0,
  wpm          INT NOT NULL DEFAULT 0,
  max_combo    INT NOT NULL DEFAULT 0,
  errors       INT NOT NULL DEFAULT 0,
  hp_left      SMALLINT NOT NULL DEFAULT 0,
  progress_pct FLOAT NOT NULL DEFAULT 100,
  time_sec     INT NOT NULL DEFAULT 0,
  xp_gained    INT NOT NULL DEFAULT 0,
  typed        MEDIUMTEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_uuid (client_uuid),
  KEY idx_player_time (player_id, created_at),
  CONSTRAINT fk_history_player FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
) ENGINE=InnoDB
SQL);
    } catch (PDOException $e) {
        fail(500, 'Gagal menyiapkan database: ' . $e->getMessage());
    }
    return $pdo;
}

/** Validasi identifier (uuid/uuid-style): huruf, angka, dash, 8–64 karakter. */
function validId(mixed $v): bool {
    return is_string($v) && preg_match('/^[A-Za-z0-9-]{8,64}$/', $v) === 1;
}

function toInt(mixed $v, int $min, int $max): int {
    $n = (int) round((float) $v);
    return max($min, min($max, $n));
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET' && $action === 'health') {
        $pdo = db();
        $ver = $pdo->query('SELECT VERSION()')->fetchColumn();
        echo json_encode(['ok' => true, 'db' => true, 'mysql' => $ver, 'time' => date('c')], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'GET' && $action === 'history') {
        $device = $_GET['device'] ?? '';
        if (!validId($device)) {
            fail(422, 'Parameter device tidak valid.');
        }
        $limit = toInt($_GET['limit'] ?? 20, 1, 100);
        $pdo   = db();

        $st = $pdo->prepare('SELECT id FROM players WHERE device_id = ?');
        $st->execute([$device]);
        $player = $st->fetch();
        if (!$player) {
            echo json_encode(['ok' => true, 'total' => 0, 'items' => [], 'stats' => [
                'done' => 0, 'fail' => 0, 'xpTotal' => 0, 'bestWpm' => 0, 'avgAcc' => 0,
            ]], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $items = $pdo->prepare(<<<SQL
SELECT h.client_uuid, h.lesson_id AS lessonId, h.module, h.mode, h.status, h.rank, h.score,
       h.acc, h.wpm, h.max_combo AS maxCombo, h.errors, h.hp_left AS hpLeft,
       h.progress_pct AS progressPct, h.time_sec AS timeSec, h.xp_gained AS xpGained,
       DATE_FORMAT(h.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
FROM game_history h
WHERE h.player_id = ?
ORDER BY h.created_at DESC, h.id DESC
LIMIT {$limit}
SQL);
        $items->execute([(int) $player['id']]);

        $agg = $pdo->prepare(<<<'SQL'
SELECT COUNT(*)                                                   AS total,
       SUM(status = 'done')                                       AS done,
       SUM(status = 'fail')                                       AS fail,
       COALESCE(SUM(xp_gained), 0)                                AS xpTotal,
       COALESCE(MAX(CASE WHEN status = 'done' THEN wpm END), 0)   AS bestWpm,
       COALESCE(AVG(CASE WHEN status = 'done' THEN acc END), 0)   AS avgAcc
FROM game_history WHERE player_id = ?
SQL);
        $agg->execute([(int) $player['id']]);
        $a    = $agg->fetch();
        $stat = [
            'done'    => (int) $a['done'],
            'fail'    => (int) $a['fail'],
            'xpTotal' => (int) $a['xpTotal'],
            'bestWpm' => (int) $a['bestWpm'],
            'avgAcc'  => round((float) $a['avgAcc'] * 100, 1),
        ];

        echo json_encode([
            'ok'    => true,
            'total' => (int) $a['total'],
            'items' => $items->fetchAll(),
            'stats' => $stat,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST' && $action === 'attempt') {
        $body = json_decode(file_get_contents('php://input') ?: '', true);
        if (!is_array($body)) {
            fail(400, 'Body JSON tidak valid.');
        }
        if (!validId($body['deviceId'] ?? null) || !validId($body['clientUuid'] ?? null)) {
            fail(422, 'deviceId / clientUuid tidak valid.');
        }
        $lessonId = (string) ($body['lessonId'] ?? '');
        $module   = (string) ($body['module'] ?? '');
        $mode     = (string) ($body['mode'] ?? 'standar');
        $status   = (string) ($body['status'] ?? '');
        if ($lessonId === '' || strlen($lessonId) > 40) {
            fail(422, 'lessonId tidak valid.');
        }
        if (!in_array($module, ['html', 'css', 'js'], true)) {
            fail(422, 'module tidak valid.');
        }
        if (!in_array($mode, ['santai', 'standar', 'nitro'], true)) {
            fail(422, 'mode tidak valid.');
        }
        if (!in_array($status, ['done', 'fail'], true)) {
            fail(422, 'status tidak valid.');
        }
        $rank = $body['rank'] ?? null;
        if ($status === 'done') {
            if (!is_string($rank) || !in_array($rank, ['S', 'A', 'B', 'C'], true)) {
                fail(422, 'rank tidak valid.');
            }
        } else {
            $rank = null;
        }
        $typed = $body['typed'] ?? null;
        if (is_string($typed)) {
            $typed = mb_substr($typed, 0, 10000);
        } else {
            $typed = null;
        }

        $pdo = db();
        $pdo->prepare('INSERT INTO players (device_id) VALUES (?) ON DUPLICATE KEY UPDATE id = id')
            ->execute([$body['deviceId']]);
        $st = $pdo->prepare('SELECT id FROM players WHERE device_id = ?');
        $st->execute([$body['deviceId']]);
        $playerId = (int) $st->fetchColumn();

        $ins = $pdo->prepare(<<<'SQL'
INSERT INTO game_history
  (player_id, client_uuid, lesson_id, module, mode, status, rank, score, acc, wpm,
   max_combo, errors, hp_left, progress_pct, time_sec, xp_gained, typed)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE id = id
SQL);
        $ins->execute([
            $playerId,
            $body['clientUuid'],
            $lessonId,
            $module,
            $mode,
            $status,
            $rank,
            toInt($body['score'] ?? 0, 0, 10_000_000),
            max(0.0, min(1.0, (float) ($body['acc'] ?? 0))),
            toInt($body['wpm'] ?? 0, 0, 999),
            toInt($body['maxCombo'] ?? 0, 0, 100_000),
            toInt($body['errors'] ?? 0, 0, 100_000),
            toInt($body['hpLeft'] ?? 0, 0, 100),
            max(0.0, min(100.0, (float) ($body['progressPct'] ?? 0))),
            toInt($body['timeSec'] ?? 0, 0, 86_400),
            toInt($body['xpGained'] ?? 0, 0, 10_000),
            $typed,
        ]);
        $duplicate = $ins->rowCount() === 0;

        $tot = $pdo->prepare('SELECT COUNT(*) FROM game_history WHERE player_id = ?');
        $tot->execute([$playerId]);

        echo json_encode([
            'ok'            => true,
            'saved'         => !$duplicate,
            'duplicate'     => $duplicate,
            'totalAttempts' => (int) $tot->fetchColumn(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    fail(404, 'Action tidak dikenal. Gunakan action=health | history | attempt.');
} catch (Throwable $e) {
    fail(500, 'Kesalahan server: ' . $e->getMessage());
}
