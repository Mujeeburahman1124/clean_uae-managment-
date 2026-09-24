<?php
/**
 * Chemical Inventory API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM inventory");
    $items = $stmt->fetchAll();
    ApiResponse::send($items, 200, 'Chemical inventory items fetched');
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE inventory SET stock = ? WHERE id = ?");
    $stmt->execute([$input['stock'], $input['id']]);
    ApiResponse::send(['id' => $input['id'], 'stock' => $input['stock']], 200, 'Inventory stock updated');
} else {
    ApiResponse::error('Method not allowed', 405);
}
