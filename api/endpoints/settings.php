<?php
/**
 * System Settings API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM settings");
    $raw = $stmt->fetchAll();
    $settings = [];
    foreach ($raw as $row) {
        $settings[$row['key_name']] = $row['val_value'];
    }
    ApiResponse::send($settings, 200, 'System settings fetched');
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO settings (key_name, val_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE val_value = VALUES(val_value)");
    foreach ($input as $key => $val) {
        $stmt->execute([$key, is_array($val) ? json_encode($val) : $val]);
    }
    ApiResponse::send($input, 200, 'Settings updated');
} else {
    ApiResponse::error('Method not allowed', 405);
}
