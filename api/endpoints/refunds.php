<?php
/**
 * 14-Working-Day Refund Tracker API Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM refunds ORDER BY created_at DESC");
    $refunds = $stmt->fetchAll();
    ApiResponse::send($refunds, 200, 'Refund SLA trackers fetched');
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = 'RFD-' . rand(100, 999);
    $stmt = $pdo->prepare("INSERT INTO refunds (id, booking_id, customer_name, amount, cancellation_date, expected_deadline, working_days_remaining, status) VALUES (?, ?, ?, ?, ?, ?, 14, 'processing')");
    $stmt->execute([
        $id,
        $input['bookingId'],
        $input['customerName'] ?? 'Customer',
        $input['amount'],
        date('Y-m-d'),
        date('Y-m-d', strtotime('+18 days')) // ~14 working days
    ]);
    ApiResponse::send(['id' => $id, 'status' => 'processing'], 201, 'Refund SLA tracker created');
} else {
    ApiResponse::error('Method not allowed', 405);
}
