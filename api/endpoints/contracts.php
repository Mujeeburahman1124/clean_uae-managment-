<?php
/**
 * Clean UAE (تنظيف الفخامة) — Recurring Contracts & Scheduled Visits Engine
 * Manages periodic cleaning service subscriptions (weekly, bi-weekly, monthly)
 * and auto-generates scheduled visit intervals.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $contractId = $_GET['id'] ?? null;

    if ($contractId) {
        $stmt = $pdo->prepare("SELECT * FROM contracts WHERE id = ? LIMIT 1");
        $stmt->execute([$contractId]);
        $contract = $stmt->fetch();

        if (!$contract) {
            ApiResponse::error('Contract not found', 404);
        }

        // Check RBAC
        $user = Auth::user();
        if ($user && $user['role'] === 'customer') {
            if ($contract['customer_id'] && $contract['customer_id'] !== $user['id']) {
                ApiResponse::error('Forbidden', 403);
            }
        }

        // Fetch visits
        $vStmt = $pdo->prepare("
            SELECT cv.*, u.name as cleaner_name
            FROM contract_visits cv
            LEFT JOIN users u ON cv.cleaner_id = u.id
            WHERE cv.contract_id = ?
            ORDER BY cv.visit_number ASC
        ");
        $vStmt->execute([$contractId]);
        $contract['visits'] = $vStmt->fetchAll();

        ApiResponse::send($contract, 200, 'Contract details fetched');
    }

    // List contracts
    $user = Auth::requireAuth();
    $status = $_GET['status'] ?? '';

    $where = [];
    $params = [];

    if ($user['role'] === 'customer') {
        $where[] = "customer_id = ?";
        $params[] = $user['id'];
    }

    if (!empty($status)) {
        $where[] = "status = ?";
        $params[] = $status;
    }

    $whereSql = !empty($where) ? ('WHERE ' . implode(' AND ', $where)) : '';
    $stmt = $pdo->prepare("SELECT * FROM contracts $whereSql ORDER BY created_at DESC");
    $stmt->execute($params);
    $contracts = $stmt->fetchAll();

    ApiResponse::send($contracts, 200, 'Contracts list fetched');

} elseif ($method === 'POST') {
    $user = Auth::requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);

    $serviceName = $input['serviceName'] ?? $input['service_name'] ?? 'Villa Deep Cleaning Package';
    $frequency = $input['frequency'] ?? 'weekly'; // weekly, biweekly, monthly
    $totalVisits = max(1, (int)($input['totalVisits'] ?? $input['total_visits'] ?? 4));
    $startDate = $input['startDate'] ?? $input['start_date'] ?? date('Y-m-d', strtotime('+3 days'));
    $monthlyPrice = (float)($input['monthlyPrice'] ?? $input['monthly_price'] ?? 750.00);
    $timeSlot = $input['timeSlot'] ?? $input['time_slot'] ?? '09:00 AM - 12:00 PM';

    $customerId = $user['id'];
    $customerName = $input['customerName'] ?? $user['name'];

    // Calculate end date based on frequency and visits
    $daysInterval = 7;
    if ($frequency === 'biweekly') $daysInterval = 14;
    elseif ($frequency === 'monthly') $daysInterval = 30;

    $totalDays = ($totalVisits - 1) * $daysInterval;
    $endDate = date('Y-m-d', strtotime("+$totalDays days", strtotime($startDate)));

    $contractId = 'CNT-' . date('Y') . '-' . rand(1000, 9999);

    $pdo->beginTransaction();

    try {
        $cStmt = $pdo->prepare("
            INSERT INTO contracts (id, customer_id, customer_name, service_name, frequency, total_visits, completed_visits, remaining_visits, start_date, end_date, monthly_price, status)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'active')
        ");
        $cStmt->execute([
            $contractId,
            $customerId,
            $customerName,
            $serviceName,
            $frequency,
            $totalVisits,
            $totalVisits,
            $startDate,
            $endDate,
            $monthlyPrice
        ]);

        // Auto-generate visits
        $vInsert = $pdo->prepare("
            INSERT INTO contract_visits (id, contract_id, visit_number, scheduled_date, time_slot, status)
            VALUES (?, ?, ?, ?, ?, 'scheduled')
        ");

        for ($i = 1; $i <= $totalVisits; $i++) {
            $offsetDays = ($i - 1) * $daysInterval;
            $vDate = date('Y-m-d', strtotime("+$offsetDays days", strtotime($startDate)));
            $visitId = 'VISIT-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));

            $vInsert->execute([
                $visitId,
                $contractId,
                $i,
                $vDate,
                $timeSlot
            ]);
        }

        Security::auditLog($user['name'], $user['id'], "Created recurring contract #{$contractId} ({$frequency}, {$totalVisits} visits)");
        $pdo->commit();

        ApiResponse::send([
            'id'           => $contractId,
            'service_name' => $serviceName,
            'frequency'    => $frequency,
            'total_visits' => $totalVisits,
            'start_date'   => $startDate,
            'end_date'     => $endDate,
            'status'       => 'active'
        ], 201, 'Recurring contract and visit schedules created successfully');

    } catch (Exception $e) {
        $pdo->rollBack();
        ApiResponse::error('Failed to create contract: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    $user = Auth::requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);

    $contractId = $input['id'] ?? $_GET['id'] ?? null;
    $visitId = $input['visit_id'] ?? null;

    if ($visitId) {
        // Update specific visit status
        $vStatus = $input['status'] ?? 'completed';
        $vStmt = $pdo->prepare("UPDATE contract_visits SET status = ?, completed_at = NOW() WHERE id = ?");
        $vStmt->execute([$vStatus, $visitId]);

        if ($vStatus === 'completed') {
            // Update contract completed visits count
            $pdo->prepare("
                UPDATE contracts c 
                SET completed_visits = (SELECT COUNT(*) FROM contract_visits WHERE contract_id = c.id AND status = 'completed'),
                    remaining_visits = total_visits - (SELECT COUNT(*) FROM contract_visits WHERE contract_id = c.id AND status = 'completed')
                WHERE id = (SELECT contract_id FROM contract_visits WHERE id = ?)
            ")->execute([$visitId]);
        }

        ApiResponse::send(['visit_id' => $visitId, 'status' => $vStatus], 200, 'Visit updated');
    }

    if ($contractId) {
        // Update contract status
        $status = $input['status'] ?? 'active';
        $pdo->prepare("UPDATE contracts SET status = ? WHERE id = ?")->execute([$status, $contractId]);
        ApiResponse::send(['id' => $contractId, 'status' => $status], 200, 'Contract status updated');
    }

    ApiResponse::error('contract id or visit_id required', 400);

} else {
    ApiResponse::error('Method not allowed', 405);
}
