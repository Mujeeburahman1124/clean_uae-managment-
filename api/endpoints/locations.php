<?php
/**
 * Clean UAE (تنظيف الفخامة) — Locations & Emirates Expansion Controller
 * Manages geographical activation (initially Ajman, expandable to all 7 UAE Emirates)
 * with strict RBAC on administrative updates.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $activeOnly = isset($_GET['active_only']) && $_GET['active_only'] == '1';
    $where = $activeOnly ? "WHERE active = 1" : "";

    $stmt = $pdo->query("SELECT * FROM locations $where ORDER BY display_order ASC, name_en ASC");
    $locations = $stmt->fetchAll();

    foreach ($locations as &$loc) {
        $areaStmt = $pdo->prepare("SELECT * FROM areas WHERE emirate_id = ? ORDER BY name_en ASC");
        $areaStmt->execute([$loc['id']]);
        $loc['areas'] = $areaStmt->fetchAll();
    }

    ApiResponse::send($locations, 200, 'Locations and active Emirates fetched');

} elseif ($method === 'PUT') {
    // Only Admin or Owner can toggle emirates or edit delivery fees
    $user = Auth::requireRole(['admin', 'owner']);
    $input = json_decode(file_get_contents('php://input'), true);

    $locationId = $input['id'] ?? null;
    if (empty($locationId)) {
        ApiResponse::error('Location ID required', 400);
    }

    $active = isset($input['active']) ? ($input['active'] ? 1 : 0) : null;
    $deliveryFee = isset($input['delivery_fee']) ? (float)$input['delivery_fee'] : null;

    $updates = [];
    $params = [];

    if ($active !== null) {
        $updates[] = "active = ?";
        $params[] = $active;
    }
    if ($deliveryFee !== null) {
        $updates[] = "delivery_fee = ?";
        $params[] = $deliveryFee;
    }

    if (empty($updates)) {
        ApiResponse::error('No update fields provided', 400);
    }

    $params[] = $locationId;
    $updateSql = implode(', ', $updates);
    $stmt = $pdo->prepare("UPDATE locations SET $updateSql WHERE id = ?");
    $stmt->execute($params);

    $actionDesc = "Updated emirate {$locationId}: active=" . ($active ?? 'unchanged') . ", fee=" . ($deliveryFee ?? 'unchanged');
    Security::auditLog($user['name'], $user['id'], $actionDesc);

    ApiResponse::send([
        'id'           => $locationId,
        'active'       => $active,
        'delivery_fee' => $deliveryFee
    ], 200, 'Emirate configuration updated successfully');

} elseif ($method === 'POST') {
    // Add new Area to an Emirate
    $user = Auth::requireRole(['admin', 'owner']);
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['emirate_id']) || empty($input['name_en'])) {
        ApiResponse::error('emirate_id and name_en required', 400);
    }

    $areaId = $input['id'] ?? ('AREA-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8)));
    $nameEn = trim($input['name_en']);
    $nameAr = trim($input['name_ar'] ?? $nameEn);
    $emirateId = trim($input['emirate_id']);
    $travelBuffer = (int)($input['travel_buffer_minutes'] ?? 30);

    $stmt = $pdo->prepare("
        INSERT INTO areas (id, emirate_id, name_en, name_ar, active, travel_buffer_minutes)
        VALUES (?, ?, ?, ?, 1, ?)
    ");
    $stmt->execute([$areaId, $emirateId, $nameEn, $nameAr, $travelBuffer]);

    Security::auditLog($user['name'], $user['id'], "Added new service area '{$nameEn}' to emirate '{$emirateId}'");

    ApiResponse::send([
        'id'         => $areaId,
        'emirate_id' => $emirateId,
        'name_en'    => $nameEn,
        'name_ar'    => $nameAr
    ], 201, 'Area added successfully');

} else {
    ApiResponse::error('Method not allowed', 405);
}
