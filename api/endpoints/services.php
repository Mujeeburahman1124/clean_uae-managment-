<?php
/**
 * Services API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM services WHERE active = 1 ORDER BY price ASC");
    $services = $stmt->fetchAll();
    ApiResponse::send($services, 200, 'Services catalog fetched');
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['id']) || empty($input['name_en']) || empty($input['price'])) {
        ApiResponse::error('Missing required service fields', 400);
    }
    $stmt = $pdo->prepare("INSERT INTO services (id, name_en, name_ar, category, price, duration_hours, description_en, description_ar, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['id'],
        $input['name_en'],
        $input['name_ar'] ?? $input['name_en'],
        $input['category'] ?? 'general',
        $input['price'],
        $input['duration_hours'] ?? 2,
        $input['description_en'] ?? '',
        $input['description_ar'] ?? '',
        $input['image_url'] ?? ''
    ]);
    ApiResponse::send($input, 201, 'Service created successfully');
} else {
    ApiResponse::error('Method not allowed', 405);
}
