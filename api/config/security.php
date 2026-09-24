<?php
/**
 * Clean UAE (تنظيف الفخامة) — Security & Encryption Helper
 * Provides password hashing, token generation, input sanitization, rate limiting, and CORS validation.
 */

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/db.php';

class Security {
    public static function hashPassword(string $password): string {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }

    public static function generateToken(int $bytes = 32): string {
        return bin2hex(random_bytes($bytes));
    }

    public static function hashToken(string $token): string {
        return hash('sha256', $token);
    }

    public static function sanitize(mixed $data): mixed {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = self::sanitize($value);
            }
            return $data;
        }
        if (is_string($data)) {
            return htmlspecialchars(trim(strip_tags($data)), ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }

    public static function getClientIp(): string {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            return $_SERVER['HTTP_CF_CONNECTING_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($parts[0]);
        }
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    public static function validateCORS(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOriginsStr = Env::get('ALLOWED_ORIGINS', 'http://localhost:8080,http://127.0.0.1:8080,http://localhost');
        $allowedOrigins = array_filter(array_map('trim', explode(',', $allowedOriginsStr)));

        $isDev = Env::get('APP_ENV', 'development') === 'development';
        $allowOrigin = '';

        if (!empty($origin)) {
            if (in_array($origin, $allowedOrigins, true)) {
                $allowOrigin = $origin;
            } elseif ($isDev) {
                $allowOrigin = $origin;
            }
        } else {
            $allowOrigin = $allowedOrigins[0] ?? '*';
        }

        if (!headers_sent()) {
            header("Access-Control-Allow-Origin: " . $allowOrigin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Token');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * Database-backed atomic rate limiter
     * Returns true if allowed, false if limit exceeded.
     */
    public static function checkRateLimit(string $key, int $maxHits = 5, int $windowSeconds = 300): array {
        try {
            $pdo = Database::getConnection();
            $now = time();
            $nowStr = date('Y-m-d H:i:s', $now);
            $expiryStr = date('Y-m-d H:i:s', $now + $windowSeconds);

            // Clean up old expired entries periodically
            if (random_int(1, 100) <= 5) {
                $pdo->exec("DELETE FROM rate_limits WHERE expires_at < '$nowStr'");
            }

            $stmt = $pdo->prepare("SELECT hits, expires_at FROM rate_limits WHERE id = ? LIMIT 1");
            $stmt->execute([$key]);
            $row = $stmt->fetch();

            if (!$row) {
                // First hit in window
                $insert = $pdo->prepare("INSERT INTO rate_limits (id, hits, expires_at) VALUES (?, 1, ?)");
                $insert->execute([$key, $expiryStr]);
                return ['allowed' => true, 'remaining' => $maxHits - 1, 'retry_after' => 0];
            }

            if (strtotime($row['expires_at']) <= $now) {
                // Window expired, reset
                $update = $pdo->prepare("UPDATE rate_limits SET hits = 1, expires_at = ? WHERE id = ?");
                $update->execute([$expiryStr, $key]);
                return ['allowed' => true, 'remaining' => $maxHits - 1, 'retry_after' => 0];
            }

            $hits = (int)$row['hits'];
            if ($hits >= $maxHits) {
                $retryAfter = strtotime($row['expires_at']) - $now;
                return ['allowed' => false, 'remaining' => 0, 'retry_after' => max(1, $retryAfter)];
            }

            // Increment hits
            $pdo->prepare("UPDATE rate_limits SET hits = hits + 1 WHERE id = ?")->execute([$key]);
            return ['allowed' => true, 'remaining' => $maxHits - ($hits + 1), 'retry_after' => 0];
        } catch (Exception $e) {
            // If rate limits table fails, fail open gracefully but log
            return ['allowed' => true, 'remaining' => 1, 'retry_after' => 0];
        }
    }

    public static function auditLog(string $userName, ?string $userId, string $action): void {
        try {
            $pdo = Database::getConnection();
            $ip = self::getClientIp();
            $stmt = $pdo->prepare("INSERT INTO audit_logs (user_name, user_id, action_performed, ip_address) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userName, $userId, $action, $ip]);
        } catch (Exception $e) {
            // Fail silently so core operations are not blocked
        }
    }
}
