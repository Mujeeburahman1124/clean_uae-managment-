<?php
/**
 * Clean UAE (تنظيف الفخامة) — Customer Feedback & Ratings Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bookingId = $_GET['booking_id'] ?? null;

    if ($bookingId) {
        $stmt = $pdo->prepare("SELECT * FROM feedback WHERE booking_id = ? LIMIT 1");
        $stmt->execute([$bookingId]);
        $fb = $stmt->fetch();
        ApiResponse::send($fb, 200, 'Booking feedback fetched');
    }

    // List verified published reviews for testimonials / quality metrics
    $stmt = $pdo->query("
        SELECT f.*, b.service_name 
        FROM feedback f
        LEFT JOIN bookings b ON f.booking_id = b.id
        WHERE f.is_published = 1 
        ORDER BY f.created_at DESC 
        LIMIT 20
    ");
    $feedbacks = $stmt->fetchAll();
    ApiResponse::send($feedbacks, 200, 'Published feedback fetched');

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $bookingId = $input['bookingId'] ?? $input['booking_id'] ?? '';
    $rating = (int)($input['rating'] ?? 5);
    $reviewText = trim($input['reviewText'] ?? $input['review_text'] ?? '');
    $customerName = trim($input['customerName'] ?? $input['customer_name'] ?? 'Verified Customer');

    if (empty($bookingId) || $rating < 1 || $rating > 5) {
        ApiResponse::error('Valid bookingId and rating (1-5) required', 400);
    }

    $bStmt = $pdo->prepare("SELECT id, customer_name FROM bookings WHERE id = ? LIMIT 1");
    $bStmt->execute([$bookingId]);
    $booking = $bStmt->fetch();

    if (!$booking) {
        ApiResponse::error('Booking not found', 404);
    }

    if (!empty($booking['customer_name'])) {
        $customerName = $booking['customer_name'];
    }

    $id = 'FB-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
    $stmt = $pdo->prepare("
        INSERT INTO feedback (id, booking_id, customer_name, rating, review_text, verified_booking, is_published)
        VALUES (?, ?, ?, ?, ?, 1, 1)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text)
    ");
    $stmt->execute([$id, $bookingId, $customerName, $rating, $reviewText]);

    ApiResponse::send([
        'id'            => $id,
        'booking_id'    => $bookingId,
        'rating'        => $rating,
        'review_text'   => $reviewText
    ], 201, 'Feedback submitted successfully');

} else {
    ApiResponse::error('Method not allowed', 405);
}
