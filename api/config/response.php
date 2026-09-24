<?php
/**
 * Clean UAE (تنظيف الفخامة) — Standardized JSON API Response Helper
 */

class ApiResponse {
    public static function send($data = null, int $statusCode = 200, string $message = 'Success'): void {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

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

    public static function error(string $message = 'Error', int $statusCode = 400): void {
        self::send(null, $statusCode, $message);
    }
}
