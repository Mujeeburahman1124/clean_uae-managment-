<?php
/**
 * Complaints SLA Desk API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM complaints ORDER BY created_at DESC");
    $complaints = $stmt->fetchAll();
    ApiResponse::send($complaints, 200, 'Complaints fetched');
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE complaints SET status = ? WHERE id = ?");
    $stmt->execute([$input['status'], $input['id']]);
    ApiResponse::send(['id' => $input['id'], 'status' => $input['status']], 200, 'Complaint status updated');
} else {
    ApiResponse::error('Method not allowed', 405);
}
