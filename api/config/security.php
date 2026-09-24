<?php
/**
 * Clean UAE (تنظيف الفخامة) — Security & Encryption Helper
 * Provides password hashing, token generation, input sanitization, and rate limiting.
 */

require_once __DIR__ . '/env.php';

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

    public static function validateCORS(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = array_map('trim', explode(',', Env::get('ALLOWED_ORIGINS', 'http://localhost:8080')));

        if (in_array($origin, $allowed, true) || Env::get('APP_ENV') === 'development') {
            header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Session-Token');
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
