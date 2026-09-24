<?php
/**
 * Clean UAE (تنظيف الفخامة) — Secure Task Photos & Private Customer Media Controller
 * Implements strict MIME verification, extension whitelisting, randomized storage, and RBAC streaming.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/response.php';

Security::validateCORS();

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Ensure private uploads directory exists and is protected from direct execution
$privateUploadDir = __DIR__ . '/../../uploads/private_photos/';
if (!is_dir($privateUploadDir)) {
    @mkdir($privateUploadDir, 0750, true);
}
$htaccessFile = $privateUploadDir . '.htaccess';
if (!file_exists($htaccessFile)) {
    @file_put_contents($htaccessFile, "# Prevent direct web execution of uploaded scripts\n<FilesMatch \"\.(php|phtml|php3|php4|php5|pl|py|cgi)$\">\nOrder Deny,Allow\nDeny from all\n</FilesMatch>\nOptions -Indexes\n");
}

switch ($method) {

    // 1. View / Stream Private Customer Photo (Protected Gateway)
    case 'GET':
        $user = Auth::requireAuth();

        if ($action === 'view') {
            $photoId = (int)($_GET['id'] ?? 0);
            if ($photoId <= 0) {
                ApiResponse::error('Invalid photo ID', 400);
            }

            $stmt = $pdo->prepare("
                SELECT tp.*, b.customer_id, b.assigned_staff 
                FROM task_photos tp
                INNER JOIN bookings b ON tp.booking_id = b.id
                WHERE tp.id = ? LIMIT 1
            ");
            $stmt->execute([$photoId]);
            $photo = $stmt->fetch();

            if (!$photo) {
                ApiResponse::error('Photo not found', 404);
            }

            // RBAC Access Control Check
            $isAuthorized = false;
            if (in_array($user['role'], ['owner', 'admin', 'supervisor', 'dispatcher', 'customer_care'], true)) {
                $isAuthorized = true;
            } elseif ($user['role'] === 'customer' && !empty($photo['customer_id']) && $photo['customer_id'] === $user['id']) {
                $isAuthorized = true;
            } elseif ($user['role'] === 'staff') {
                if ($photo['assigned_staff'] === $user['name'] || $photo['uploaded_by'] === $user['name']) {
                    $isAuthorized = true;
                } else {
                    // Check booking_assignments
                    $assignStmt = $pdo->prepare("SELECT id FROM booking_assignments WHERE booking_id = ? AND staff_id = ? LIMIT 1");
                    $assignStmt->execute([$photo['booking_id'], $user['id']]);
                    if ($assignStmt->fetch()) {
                        $isAuthorized = true;
                    }
                }
            }

            if (!$isAuthorized) {
                ApiResponse::error('Forbidden: You are not authorized to view this customer job photo.', 403);
            }

            $realFilePath = __DIR__ . '/../../' . $photo['photo_path'];
            if (!file_exists($realFilePath)) {
                ApiResponse::error('Photo file missing from storage', 404);
            }

            $mime = mime_content_type($realFilePath) ?: 'image/jpeg';
            if (!headers_sent()) {
                header('Content-Type: ' . $mime);
                header('Content-Length: ' . filesize($realFilePath));
                header('Cache-Control: private, max-age=86400');
                header('Content-Disposition: inline; filename="' . basename($realFilePath) . '"');
            }
            readfile($realFilePath);
            exit;
        }

        // List photos for a booking
        $bookingId = trim($_GET['booking_id'] ?? '');
        if (empty($bookingId)) {
            ApiResponse::error('Booking ID is required to fetch photos', 400);
        }

        // Verify booking access
        $bStmt = $pdo->prepare("SELECT id, customer_id, assigned_staff FROM bookings WHERE id = ? LIMIT 1");
        $bStmt->execute([$bookingId]);
        $booking = $bStmt->fetch();

        if (!$booking) {
            ApiResponse::error('Booking not found', 404);
        }

        if ($user['role'] === 'customer' && $booking['customer_id'] !== $user['id']) {
            ApiResponse::error('Forbidden: Access denied to booking photos.', 403);
        }

        $listStmt = $pdo->prepare("SELECT id, booking_id, stage, damage_notes, uploaded_by, created_at FROM task_photos WHERE booking_id = ? ORDER BY id ASC");
        $listStmt->execute([$bookingId]);
        $photos = $listStmt->fetchAll();

        foreach ($photos as &$p) {
            $p['stream_url'] = "api/index.php?route=photos&action=view&id=" . $p['id'];
        }

        ApiResponse::send($photos, 200, 'Booking task photos fetched');
        break;

    // 2. Upload Task Before / After Photo (Strict Validation)
    case 'POST':
        $user = Auth::requireAuth();
        if (!in_array($user['role'], ['staff', 'supervisor', 'admin', 'owner'], true)) {
            ApiResponse::error('Forbidden: Only field cleaners, supervisors, or administrators can upload task photos.', 403);
        }

        $bookingId = trim($_POST['booking_id'] ?? '');
        $stage = trim($_POST['stage'] ?? 'before');
        $damageNotes = Security::sanitize($_POST['damage_notes'] ?? '');

        if (empty($bookingId)) {
            ApiResponse::error('Booking ID is required', 422);
        }
        if (!in_array($stage, ['before', 'after'], true)) {
            ApiResponse::error('Photo stage must be "before" or "after"', 422);
        }

        // Validate booking exists
        $bCheck = $pdo->prepare("SELECT id FROM bookings WHERE id = ? LIMIT 1");
        $bCheck->execute([$bookingId]);
        if (!$bCheck->fetch()) {
            ApiResponse::error('Booking record not found', 404);
        }

        // Validate file presence
        if (empty($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            ApiResponse::error('No valid photo file uploaded or upload error occurred.', 400);
        }

        $fileTmp = $_FILES['photo']['tmp_name'];
        $fileSize = $_FILES['photo']['size'];
        $origName = $_FILES['photo']['name'];

        // Size check: Max 10MB
        if ($fileSize > 10 * 1024 * 1024) {
            ApiResponse::error('Photo size exceeds maximum allowed limit (10MB).', 422);
        }

        // Real MIME check using fileinfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMime = finfo_file($finfo, $fileTmp);
        finfo_close($finfo);

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];

        if (!array_key_exists($realMime, $allowedMimes)) {
            ApiResponse::error('Invalid file format. Only JPEG, PNG, and WebP images are permitted.', 422);
        }

        $extension = $allowedMimes[$realMime];

        // Verify original extension matches allowed types
        $clientExt = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        if (!in_array($clientExt, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            ApiResponse::error('Suspicious file extension. Upload rejected.', 422);
        }

        // Generate non-guessable random file name
        $secureFileName = bin2hex(random_bytes(16)) . '_' . time() . '.' . $extension;
        $targetPath = $privateUploadDir . $secureFileName;
        $dbRelativePath = 'uploads/private_photos/' . $secureFileName;

        $moved = false;
        if (is_uploaded_file($fileTmp)) {
            $moved = move_uploaded_file($fileTmp, $targetPath);
        } elseif (Env::get('APP_ENV', 'development') === 'development' && file_exists($fileTmp)) {
            $moved = copy($fileTmp, $targetPath);
        }

        if (!$moved) {
            ApiResponse::error('Failed to securely store uploaded image.', 500);
        }

        // Insert database record
        $insert = $pdo->prepare("
            INSERT INTO task_photos (booking_id, stage, photo_path, damage_notes, uploaded_by, is_private) 
            VALUES (?, ?, ?, ?, ?, 1)
        ");
        $insert->execute([$bookingId, $stage, $dbRelativePath, $damageNotes, $user['name']]);
        $newPhotoId = (int)$pdo->lastInsertId();

        Security::auditLog($user['name'], $user['id'], "Uploaded $stage cleaning photo #$newPhotoId for booking $bookingId");

        ApiResponse::send([
            'id' => $newPhotoId,
            'booking_id' => $bookingId,
            'stage' => $stage,
            'stream_url' => "api/index.php?route=photos&action=view&id=$newPhotoId"
        ], 201, 'Task photo uploaded and secured successfully');
        break;

    default:
        ApiResponse::error('Method not allowed', 405);
        break;
}
