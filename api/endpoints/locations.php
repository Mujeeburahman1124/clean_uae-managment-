<?php
/**
 * Locations & Emirate Expansion API Endpoint Controller
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM locations");
    $locations = $stmt->fetchAll();

    foreach ($locations as &$loc) {
        $areaStmt = $pdo->prepare("SELECT * FROM areas WHERE emirate_id = ?");
        $areaStmt->execute([$loc['id']]);
        $loc['areas'] = $areaStmt->fetchAll();
    }

    ApiResponse::send($locations, 200, 'Locations and active Emirates fetched');
} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['id'])) {
        ApiResponse::error('Location ID required', 400);
    }
    $stmt = $pdo->prepare("UPDATE locations SET active = ? WHERE id = ?");
    $stmt->execute([$input['active'] ? 1 : 0, $input['id']]);
    ApiResponse::send(['id' => $input['id'], 'active' => $input['active']], 200, 'Emirate status updated');
} else {
    ApiResponse::error('Method not allowed', 405);
}
