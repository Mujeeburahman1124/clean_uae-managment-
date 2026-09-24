<?php
/**
 * Bookings Engine API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
    $bookings = $stmt->fetchAll();
    ApiResponse::send($bookings, 200, 'Bookings list fetched');
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['serviceId']) || empty($input['date'])) {
        ApiResponse::error('Missing booking information', 400);
    }

    $refId = $input['id'] ?? ('CUAE-' . rand(1000, 9999));
    $stmt = $pdo->prepare("INSERT INTO bookings (id, customer_name, customer_phone, service_id, service_name, emirate, area, address, booking_date, time_slot, cleaners_count, price, vat, total_amount, payment_method, payment_status, status, assigned_staff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $refId,
        $input['customerName'] ?? 'Sara Al-Nuaimi',
        $input['customerPhone'] ?? '+971501234567',
        $input['serviceId'],
        $input['serviceName'] ?? 'Cleaning Service',
        $input['emirate'] ?? 'Ajman',
        $input['area'] ?? 'Al Nuaimia',
        $input['address'] ?? '',
        $input['date'],
        $input['timeSlot'] ?? '09:00 AM - 12:00 PM',
        $input['cleanersCount'] ?? 2,
        $input['price'] ?? 180,
        $input['vat'] ?? 9,
        $input['totalAmount'] ?? 189,
        $input['paymentMethod'] ?? 'card',
        $input['paymentStatus'] ?? 'paid',
        $input['status'] ?? 'assigned',
        $input['assignedStaff'] ?? 'Rashid Khan'
    ]);

    $input['id'] = $refId;
    ApiResponse::send($input, 201, 'Booking created successfully');
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['id']) || empty($input['status'])) {
        ApiResponse::error('Booking ID and Status required', 400);
    }
    $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->execute([$input['status'], $input['id']]);
    ApiResponse::send(['id' => $input['id'], 'status' => $input['status']], 200, 'Booking status updated');
} else {
    ApiResponse::error('Method not allowed', 405);
}
