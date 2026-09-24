<?php
/**
 * Clean UAE (تنظيف الفخامة) — Offers & Promotional Discounts Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $code = trim($_GET['code'] ?? '');
    $subtotal = (float)($_GET['subtotal'] ?? 0);

    if (!empty($code)) {
        $stmt = $pdo->prepare("
            SELECT * FROM offers 
            WHERE code = ? AND active = 1 
              AND (usage_limit IS NULL OR used_count < usage_limit)
              AND (start_date IS NULL OR start_date <= CURDATE())
              AND (end_date IS NULL OR end_date >= CURDATE())
            LIMIT 1
        ");
        $stmt->execute([$code]);
        $offer = $stmt->fetch();

        if (!$offer) {
            ApiResponse::error('Invalid or expired promotional code', 404);
        }

        if ($subtotal < (float)$offer['min_booking_value']) {
            ApiResponse::error("This promo code requires a minimum booking amount of AED {$offer['min_booking_value']}", 400);
        }

        $discount = 0.00;
        if ($offer['discount_type'] === 'percentage') {
            $discount = round(($subtotal * (float)$offer['discount_value']) / 100.0, 2);
        } else {
            $discount = min($subtotal, (float)$offer['discount_value']);
        }

        ApiResponse::send([
            'valid'          => true,
            'code'           => $offer['code'],
            'discount_label' => $offer['discount_label'],
            'discount_type'  => $offer['discount_type'],
            'discount_value' => (float)$offer['discount_value'],
            'discount_calculated' => $discount
        ], 200, 'Promo code applied');
    }

    // List active public offers
    $stmt = $pdo->query("SELECT id, code, discount_label, description_en, description_ar, discount_type, discount_value, min_booking_value FROM offers WHERE active = 1 ORDER BY created_at DESC");
    $offers = $stmt->fetchAll();
    ApiResponse::send($offers, 200, 'Active offers fetched');

} else {
    ApiResponse::error('Method not allowed', 405);
}
