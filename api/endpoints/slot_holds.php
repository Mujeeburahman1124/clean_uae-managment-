<?php
/**
 * Clean UAE (تنظيف الفخامة) — Dynamic Slot Holds & Capacity Engine
 * Manages real-time cleaner capacity calculation and 10-minute temporary checkout reservation locks.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Auto-cleanup expired holds
try {
    $pdo->exec("DELETE FROM slot_holds WHERE expires_at < NOW()");
} catch (Exception $e) {
    // Non-blocking
}

$standardSlots = [
    '08:00 AM - 11:00 AM',
    '11:30 AM - 02:30 PM',
    '03:00 PM - 06:00 PM',
    '06:30 PM - 09:30 PM'
];

if ($method === 'GET' || $action === 'available_slots') {
    $date = $_GET['date'] ?? date('Y-m-d', strtotime('+1 day'));
    $emirate = $_GET['emirate'] ?? 'Ajman';
    $area = $_GET['area'] ?? '';
    $serviceId = $_GET['service_id'] ?? '';
    $cleanersRequested = max(1, (int)($_GET['cleaners_count'] ?? 1));

    // Verify date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        ApiResponse::error('Invalid date format. Expected YYYY-MM-DD', 400);
    }

    // 1. Get total active cleaners pool
    $staffStmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'staff' AND active_status = 1");
    $totalCleaners = (int)$staffStmt->fetchColumn();
    if ($totalCleaners < 5) {
        $totalCleaners = 8; // Baseline operational pool in Ajman
    }

    // 2. Query bookings per slot on this date
    $bookingStmt = $pdo->prepare("
        SELECT time_slot, COALESCE(SUM(cleaners_count), 0) AS booked_cleaners
        FROM bookings
        WHERE booking_date = ? AND status NOT IN ('cancelled')
        GROUP BY time_slot
    ");
    $bookingStmt->execute([$date]);
    $bookedMap = [];
    while ($row = $bookingStmt->fetch()) {
        $bookedMap[$row['time_slot']] = (int)$row['booked_cleaners'];
    }

    // 3. Query active holds per slot on this date
    $holdStmt = $pdo->prepare("
        SELECT time_slot, COALESCE(SUM(cleaners_count), 0) AS held_cleaners
        FROM slot_holds
        WHERE slot_date = ? AND expires_at > NOW()
        GROUP BY time_slot
    ");
    $holdStmt->execute([$date]);
    $heldMap = [];
    while ($row = $holdStmt->fetch()) {
        $heldMap[$row['time_slot']] = (int)$row['held_cleaners'];
    }

    // 4. Calculate slot availability
    $slotsAvailability = [];
    $isToday = ($date === date('Y-m-d'));
    $currentTime = date('H:i');

    foreach ($standardSlots as $slot) {
        $booked = $bookedMap[$slot] ?? 0;
        $held = $heldMap[$slot] ?? 0;
        $remaining = max(0, $totalCleaners - ($booked + $held));

        // If today, check if slot start time has already passed
        $isPast = false;
        if ($isToday) {
            $slotStart = explode(' - ', $slot)[0];
            $slotTime24 = date('H:i', strtotime($slotStart));
            if ($currentTime >= $slotTime24) {
                $isPast = true;
            }
        }

        $available = (!$isPast) && ($remaining >= $cleanersRequested);

        $slotsAvailability[] = [
            'time_slot'          => $slot,
            'available'          => $available,
            'is_past'            => $isPast,
            'remaining_cleaners' => $remaining,
            'cleaners_requested' => $cleanersRequested,
            'total_cleaners'     => $totalCleaners
        ];
    }

    ApiResponse::send([
        'date'               => $date,
        'emirate'            => $emirate,
        'area'               => $area,
        'cleaners_requested' => $cleanersRequested,
        'slots'              => $slotsAvailability
    ], 200, 'Available slots calculated');

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $subAction = $input['action'] ?? $action;

    if ($subAction === 'release') {
        $holdId = $input['hold_id'] ?? $_GET['hold_id'] ?? '';
        $sessionToken = $input['session_token'] ?? $_GET['session_token'] ?? '';

        if (empty($holdId) && empty($sessionToken)) {
            ApiResponse::error('hold_id or session_token required for release', 400);
        }

        $delStmt = $pdo->prepare("DELETE FROM slot_holds WHERE id = ? OR session_token = ?");
        $delStmt->execute([$holdId, $sessionToken]);

        ApiResponse::send(['released' => true], 200, 'Slot hold released successfully');
    }

    // Action: HOLD
    $slotDate = $input['slot_date'] ?? $input['date'] ?? '';
    $timeSlot = $input['time_slot'] ?? $input['timeSlot'] ?? '';
    $serviceId = $input['service_id'] ?? $input['serviceId'] ?? 'general-cleaning';
    $emirate = $input['emirate'] ?? 'Ajman';
    $area = $input['area'] ?? 'Al Nuaimia';
    $cleanersCount = max(1, (int)($input['cleaners_count'] ?? $input['cleanersCount'] ?? 1));

    if (empty($slotDate) || empty($timeSlot)) {
        ApiResponse::error('slot_date and time_slot are required', 400);
    }

    if (!in_array($timeSlot, $standardSlots, true)) {
        ApiResponse::error('Invalid time slot specified', 400);
    }

    // Check pool capacity
    $staffStmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'staff' AND active_status = 1");
    $totalCleaners = (int)$staffStmt->fetchColumn();
    if ($totalCleaners < 5) $totalCleaners = 8;

    $bookingStmt = $pdo->prepare("
        SELECT COALESCE(SUM(cleaners_count), 0) 
        FROM bookings 
        WHERE booking_date = ? AND time_slot = ? AND status NOT IN ('cancelled')
    ");
    $bookingStmt->execute([$slotDate, $timeSlot]);
    $bookedCount = (int)$bookingStmt->fetchColumn();

    $holdStmt = $pdo->prepare("
        SELECT COALESCE(SUM(cleaners_count), 0) 
        FROM slot_holds 
        WHERE slot_date = ? AND time_slot = ? AND expires_at > NOW()
    ");
    $holdStmt->execute([$slotDate, $timeSlot]);
    $heldCount = (int)$holdStmt->fetchColumn();

    $remainingCapacity = $totalCleaners - ($bookedCount + $heldCount);

    if ($remainingCapacity < $cleanersCount) {
        ApiResponse::error('The selected time slot is no longer available. Please select another slot.', 409);
    }

    $holdId = 'HOLD-' . strtoupper(substr(bin2hex(random_bytes(6)), 0, 8));
    $sessionToken = Security::generateToken(24);
    $expiresAt = date('Y-m-d H:i:s', time() + 600); // 10 minutes from now

    $insertStmt = $pdo->prepare("
        INSERT INTO slot_holds (id, slot_date, time_slot, service_id, emirate, area, cleaners_count, session_token, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insertStmt->execute([
        $holdId,
        $slotDate,
        $timeSlot,
        $serviceId,
        $emirate,
        $area,
        $cleanersCount,
        $sessionToken,
        $expiresAt
    ]);

    ApiResponse::send([
        'hold_id'           => $holdId,
        'session_token'     => $sessionToken,
        'slot_date'         => $slotDate,
        'time_slot'         => $timeSlot,
        'cleaners_count'    => $cleanersCount,
        'expires_at'        => $expiresAt,
        'remaining_seconds' => 600
    ], 201, 'Slot reserved successfully for 10 minutes');

} elseif ($method === 'DELETE') {
    $holdId = $_GET['hold_id'] ?? '';
    $sessionToken = $_GET['session_token'] ?? '';

    if (empty($holdId) && empty($sessionToken)) {
        ApiResponse::error('hold_id or session_token required', 400);
    }

    $delStmt = $pdo->prepare("DELETE FROM slot_holds WHERE id = ? OR session_token = ?");
    $delStmt->execute([$holdId, $sessionToken]);

    ApiResponse::send(['released' => true], 200, 'Slot hold released');
} else {
    ApiResponse::error('Method not allowed', 405);
}
