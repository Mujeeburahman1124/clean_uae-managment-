<?php
/**
 * Clean UAE (تنظيف الفخامة) — 14-Working-Day Refund SLA Engine
 * Accurately tracks refund deadlines by taking UAE weekend days (Saturday-Sunday)
 * and official UAE holidays (from business_holidays table) into account.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Calculate the number of UAE business/working days between two dates.
 * Excludes Saturdays (6), Sundays (0), and official public holidays from business_holidays.
 */
function getUAEWorkingDaysRemaining(string $fromDate, string $toDate, PDO $pdo): int {
    $from = strtotime($fromDate);
    $to = strtotime($toDate);

    if ($from >= $to) {
        return 0;
    }

    // Fetch official holidays in range
    $stmt = $pdo->prepare("SELECT holiday_date FROM business_holidays WHERE holiday_date BETWEEN ? AND ?");
    $stmt->execute([$fromDate, $toDate]);
    $holidays = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
    $holidayMap = array_flip($holidays);

    $workingDays = 0;
    $current = strtotime('+1 day', $from); // Start counting from next day

    while ($current <= $to) {
        $dayOfWeek = (int)date('w', $current); // 0=Sunday, 6=Saturday
        $dateStr = date('Y-m-d', $current);

        // Skip Saturday and Sunday
        if ($dayOfWeek !== 0 && $dayOfWeek !== 6) {
            // Skip official holidays
            if (!isset($holidayMap[$dateStr])) {
                $workingDays++;
            }
        }
        $current = strtotime('+1 day', $current);
    }

    return $workingDays;
}

/**
 * Add N UAE working days to a start date, skipping weekends and official holidays.
 */
function addUAEWorkingDays(string $startDate, int $daysToAdd, PDO $pdo): string {
    // Fetch upcoming holidays
    $futureLimit = date('Y-m-d', strtotime('+60 days', strtotime($startDate)));
    $stmt = $pdo->prepare("SELECT holiday_date FROM business_holidays WHERE holiday_date BETWEEN ? AND ?");
    $stmt->execute([$startDate, $futureLimit]);
    $holidays = $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
    $holidayMap = array_flip($holidays);

    $current = strtotime($startDate);
    $added = 0;

    while ($added < $daysToAdd) {
        $current = strtotime('+1 day', $current);
        $dayOfWeek = (int)date('w', $current);
        $dateStr = date('Y-m-d', $current);

        if ($dayOfWeek !== 0 && $dayOfWeek !== 6) {
            if (!isset($holidayMap[$dateStr])) {
                $added++;
            }
        }
    }

    return date('Y-m-d', $current);
}

if ($method === 'GET') {
    $user = Auth::requireAuth();

    $where = "";
    $params = [];

    if ($user['role'] === 'customer') {
        $where = "WHERE r.booking_id IN (SELECT id FROM bookings WHERE customer_id = ? OR customer_email = ?)";
        $params = [$user['id'], $user['email']];
    }

    $stmt = $pdo->prepare("
        SELECT r.*, b.service_name, b.booking_date, b.payment_method
        FROM refunds r
        LEFT JOIN bookings b ON r.booking_id = b.id
        $where
        ORDER BY r.created_at DESC
    ");
    $stmt->execute($params);
    $refunds = $stmt->fetchAll();

    $today = date('Y-m-d');
    foreach ($refunds as &$r) {
        if ($r['status'] === 'completed') {
            $r['working_days_remaining'] = 0;
        } else {
            $r['working_days_remaining'] = getUAEWorkingDaysRemaining($today, $r['expected_deadline'], $pdo);
        }
    }

    ApiResponse::send($refunds, 200, 'Refund SLA trackers fetched');

} elseif ($method === 'POST') {
    $user = Auth::requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);

    $bookingId = $input['bookingId'] ?? $input['booking_id'] ?? null;
    $amount = (float)($input['amount'] ?? 0);
    $reason = $input['reason'] ?? 'Customer cancellation';

    if (!$bookingId || $amount <= 0) {
        ApiResponse::error('Valid bookingId and amount are required', 400);
    }

    $bStmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
    $bStmt->execute([$bookingId]);
    $booking = $bStmt->fetch();

    if (!$booking) {
        ApiResponse::error('Booking not found', 404);
    }

    // Role check
    if ($user['role'] === 'customer') {
        if ($booking['customer_id'] !== $user['id'] && $booking['customer_email'] !== $user['email']) {
            ApiResponse::error('Forbidden', 403);
        }
    }

    $id = 'RFD-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
    $cancelDate = date('Y-m-d');
    $expectedDeadline = addUAEWorkingDays($cancelDate, 14, $pdo);

    $stmt = $pdo->prepare("
        INSERT INTO refunds (id, booking_id, customer_name, amount, cancellation_date, expected_deadline, working_days_remaining, status)
        VALUES (?, ?, ?, ?, ?, ?, 14, 'processing')
    ");
    $stmt->execute([
        $id,
        $bookingId,
        $booking['customer_name'],
        $amount,
        $cancelDate,
        $expectedDeadline
    ]);

    // Update booking payment_status to 'refund_pending'
    $pdo->prepare("UPDATE bookings SET payment_status = 'refund_pending' WHERE id = ?")->execute([$bookingId]);

    Security::auditLog($user['name'], $user['id'], "Initiated refund request #{$id} for booking #{$bookingId} (AED {$amount})");

    ApiResponse::send([
        'id'                     => $id,
        'booking_id'             => $bookingId,
        'amount'                 => $amount,
        'expected_deadline'      => $expectedDeadline,
        'working_days_remaining' => 14,
        'status'                 => 'processing'
    ], 201, 'Refund request logged with 14-working-day UAE SLA');

} elseif ($method === 'PUT') {
    // Only Admin, Owner, Finance can process or reject refunds
    $user = Auth::requireRole(['admin', 'owner', 'dispatcher']);
    $input = json_decode(file_get_contents('php://input'), true);

    $refundId = $input['id'] ?? null;
    $status = $input['status'] ?? 'completed'; // completed, rejected
    $ref = $input['gateway_refund_ref'] ?? ('TX-RFD-' . rand(10000, 99999));
    $rejectionReason = $input['rejection_reason'] ?? null;

    if (!$refundId || !in_array($status, ['completed', 'rejected', 'processing'], true)) {
        ApiResponse::error('Refund ID and valid status required', 400);
    }

    $stmt = $pdo->prepare("
        UPDATE refunds 
        SET status = ?, gateway_refund_ref = ?, rejection_reason = ?, processed_by_user_id = ?
        WHERE id = ?
    ");
    $stmt->execute([$status, $ref, $rejectionReason, $user['id'], $refundId]);

    if ($status === 'completed') {
        $pdo->prepare("
            UPDATE bookings 
            SET payment_status = 'refunded' 
            WHERE id = (SELECT booking_id FROM refunds WHERE id = ?)
        ")->execute([$refundId]);
    }

    Security::auditLog($user['name'], $user['id'], "Updated refund #{$refundId} status to {$status}");

    ApiResponse::send(['id' => $refundId, 'status' => $status], 200, 'Refund status updated');

} else {
    ApiResponse::error('Method not allowed', 405);
}
