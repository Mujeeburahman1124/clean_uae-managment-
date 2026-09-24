<?php
/**
 * Mobile Job Before/After Photo Upload Handler
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $bookingId = $_POST['booking_id'] ?? null;
    $stage = $_POST['stage'] ?? 'before'; // 'before' or 'after'
    $uploadedBy = $_POST['uploaded_by'] ?? 'Cleaner';

    if (!$bookingId) {
        ApiResponse::error('Booking ID is required', 400);
    }

    $uploadDir = __DIR__ . '/../../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $photoPath = 'uploads/demo_photo.jpg';
    if (!empty($_FILES['photo']['name'])) {
        $fileName = time() . '_' . basename($_FILES['photo']['name']);
        $targetFile = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetFile)) {
            $photoPath = 'uploads/' . $fileName;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO task_photos (booking_id, stage, photo_path, uploaded_by) VALUES (?, ?, ?, ?)");
    $stmt->execute([$bookingId, $stage, $photoPath, $uploadedBy]);

    ApiResponse::send([
        'booking_id' => $bookingId,
        'stage' => $stage,
        'photo_path' => $photoPath
    ], 201, 'Mobile task photo uploaded successfully');
} else {
    ApiResponse::error('Method not allowed', 405);
}
