<?php
/**
 * Clean UAE (تنظيف الفخامة) — Services & Dynamic Pricing Controller
 * Manages service catalog, add-ons, and pricing rules with RBAC.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $serviceId = $_GET['id'] ?? null;
    $includeAddons = true;

    if ($serviceId) {
        $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ? LIMIT 1");
        $stmt->execute([$serviceId]);
        $service = $stmt->fetch();

        if (!$service) {
            ApiResponse::error('Service not found', 404);
        }

        // Fetch pricing rules
        $rStmt = $pdo->prepare("SELECT * FROM service_pricing_rules WHERE service_id = ? ORDER BY cleaners_count ASC");
        $rStmt->execute([$serviceId]);
        $service['pricing_rules'] = $rStmt->fetchAll();

        // Fetch add-ons
        $aStmt = $pdo->prepare("SELECT * FROM service_addons WHERE service_id = ? OR service_id IS NULL");
        $aStmt->execute([$serviceId]);
        $service['addons'] = $aStmt->fetchAll();

        ApiResponse::send($service, 200, 'Service details fetched');
    }

    // List all active services
    $stmt = $pdo->query("SELECT * FROM services WHERE active = 1 ORDER BY display_order ASC, price ASC");
    $services = $stmt->fetchAll();

    // Fetch all active add-ons
    $addonsStmt = $pdo->query("SELECT * FROM service_addons WHERE active = 1");
    $allAddons = $addonsStmt->fetchAll();

    // Group addons by service
    $addonsByService = [];
    $globalAddons = [];
    foreach ($allAddons as $ad) {
        if (empty($ad['service_id'])) {
            $globalAddons[] = $ad;
        } else {
            $addonsByService[$ad['service_id']][] = $ad;
        }
    }

    foreach ($services as &$srv) {
        $sid = $srv['id'];
        $specific = $addonsByService[$sid] ?? [];
        $srv['addons'] = array_merge($specific, $globalAddons);
    }

    ApiResponse::send($services, 200, 'Services catalog fetched');

} elseif ($method === 'POST') {
    // Create new service — Admin / Owner only
    $user = Auth::requireRole(['admin', 'owner']);
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['id']) || empty($input['name_en']) || empty($input['price'])) {
        ApiResponse::error('Missing required service fields (id, name_en, price)', 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO services (id, name_en, name_ar, category, price, duration_hours, description_en, description_ar, image_url, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ");
    $stmt->execute([
        $input['id'],
        $input['name_en'],
        $input['name_ar'] ?? $input['name_en'],
        $input['category'] ?? 'general',
        $input['price'],
        $input['duration_hours'] ?? 2.00,
        $input['description_en'] ?? '',
        $input['description_ar'] ?? '',
        $input['image_url'] ?? ''
    ]);

    Security::auditLog($user['name'], $user['id'], "Created new service '{$input['name_en']}' (AED {$input['price']})");

    ApiResponse::send($input, 201, 'Service created successfully');

} elseif ($method === 'PUT') {
    // Update service / pricing — Admin / Owner only
    $user = Auth::requireRole(['admin', 'owner']);
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['id'])) {
        ApiResponse::error('Service ID required', 400);
    }

    $updates = [];
    $params = [];

    if (isset($input['price'])) {
        $updates[] = "price = ?";
        $params[] = (float)$input['price'];
    }
    if (isset($input['duration_hours'])) {
        $updates[] = "duration_hours = ?";
        $params[] = (float)$input['duration_hours'];
    }
    if (isset($input['active'])) {
        $updates[] = "active = ?";
        $params[] = $input['active'] ? 1 : 0;
    }
    if (isset($input['name_en'])) {
        $updates[] = "name_en = ?";
        $params[] = trim($input['name_en']);
    }
    if (isset($input['name_ar'])) {
        $updates[] = "name_ar = ?";
        $params[] = trim($input['name_ar']);
    }

    if (empty($updates)) {
        ApiResponse::error('No updates provided', 400);
    }

    $params[] = $input['id'];
    $sql = implode(', ', $updates);
    $pdo->prepare("UPDATE services SET $sql WHERE id = ?")->execute($params);

    Security::auditLog($user['name'], $user['id'], "Updated service {$input['id']} settings");

    ApiResponse::send(['id' => $input['id'], 'updated' => true], 200, 'Service updated successfully');

} else {
    ApiResponse::error('Method not allowed', 405);
}
