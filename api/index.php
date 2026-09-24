<?php
/**
 * Clean UAE (تنظيف الفخامة) — Central API Dispatcher Router
 */

require_once __DIR__ . '/config/response.php';

$route = $_GET['route'] ?? $_GET['endpoint'] ?? '';

switch ($route) {
    case 'auth':
        require_once __DIR__ . '/endpoints/auth.php';
        break;
    case 'services':
        require_once __DIR__ . '/endpoints/services.php';
        break;
    case 'locations':
        require_once __DIR__ . '/endpoints/locations.php';
        break;
    case 'bookings':
        require_once __DIR__ . '/endpoints/bookings.php';
        break;
    case 'cash_collections':
        require_once __DIR__ . '/endpoints/cash_collections.php';
        break;
    case 'inventory':
        require_once __DIR__ . '/endpoints/inventory.php';
        break;
    case 'complaints':
        require_once __DIR__ . '/endpoints/complaints.php';
        break;
    case 'photos':
        require_once __DIR__ . '/endpoints/photos.php';
        break;
    case 'attendance':
        require_once __DIR__ . '/endpoints/attendance.php';
        break;
    case 'refunds':
        require_once __DIR__ . '/endpoints/refunds.php';
        break;
    case 'settings':
        require_once __DIR__ . '/endpoints/settings.php';
        break;
    case 'slot_holds':
        require_once __DIR__ . '/endpoints/slot_holds.php';
        break;
    case 'invoices':
        require_once __DIR__ . '/endpoints/invoices.php';
        break;
    case 'contracts':
        require_once __DIR__ . '/endpoints/contracts.php';
        break;
    case 'offers':
        require_once __DIR__ . '/endpoints/offers.php';
        break;
    case 'feedback':
        require_once __DIR__ . '/endpoints/feedback.php';
        break;
    default:
        ApiResponse::send([
            'api_name' => 'Clean UAE (تنظيف الفخامة) REST API',
            'version'  => '1.0.0',
            'status'   => 'Operational',
            'time'     => date('c')
        ], 200, 'Welcome to Clean UAE API Engine');
        break;
}
