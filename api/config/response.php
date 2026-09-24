<?php
/**
 * Clean UAE (تنظيف الفخامة) — Standardized JSON API Response Helper
 */

require_once __DIR__ . '/security.php';

class ApiResponse {
    public static function send($data = null, int $statusCode = 200, string $message = 'Success'): void {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
        Security::validateCORS();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        http_response_code($statusCode);
        echo json_encode([
            'status'  => $statusCode,
            'success' => $statusCode >= 200 && $statusCode < 300,
            'message' => $message,
            'data'    => $data
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public static function error(string $message = 'Error', int $statusCode = 400, $data = null): void {
        self::send($data, $statusCode, $message);
    }
}
