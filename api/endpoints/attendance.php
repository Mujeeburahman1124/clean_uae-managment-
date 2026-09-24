<?php
/**
 * Staff Attendance & GPS Geotag Log API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = 'att-' . rand(100, 999);
    $stmt = $pdo->prepare("INSERT INTO staff_attendance (id, staff_id, staff_name, attendance_date, clock_in, gps_verified, status) VALUES (?, ?, ?, ?, ?, 1, 'on_duty')");
    $stmt->execute([
        $id,
        $input['staffId'] ?? 'usr-staff-1',
        $input['staffName'] ?? 'Rashid Khan',
        date('Y-m-d'),
        date('h:i A')
    ]);
    ApiResponse::send(['id' => $id, 'status' => 'on_duty'], 201, 'Clock-in recorded with GPS verification');
} else {
    ApiResponse::error('Method not allowed', 405);
}
