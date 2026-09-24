<?php
/**
 * Cash Collections & Manager Reconciliation API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM cash_collections ORDER BY created_at DESC");
    $collections = $stmt->fetchAll();
    ApiResponse::send($collections, 200, 'Cash collection records fetched');
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = 'CASH-' . rand(100, 999);
    $stmt = $pdo->prepare("INSERT INTO cash_collections (id, booking_id, collector_name, amount_collected, collected_at, receipt_ref, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $input['bookingId'],
        $input['collectorName'] ?? 'Rashid Khan',
        $input['amountCollected'],
        $input['collectedAt'] ?? date('Y-m-d H:i:s'),
        $input['receiptRef'] ?? ('RCP-' . rand(10000, 99999)),
        'pending_handover'
    ]);
    $input['id'] = $id;
    ApiResponse::send($input, 201, 'Cash collection logged');
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE cash_collections SET status = 'reconciled' WHERE id = ?");
    $stmt->execute([$input['id']]);
    ApiResponse::send(['id' => $input['id'], 'status' => 'reconciled'], 200, 'Cash collection reconciled');
} else {
    ApiResponse::error('Method not allowed', 405);
}
