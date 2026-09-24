<?php
/**
 * Clean UAE (تنظيف الفخامة) — Phase 4 Safe Non-Destructive Schema Synchronizer
 */

require_once __DIR__ . '/../api/config/db.php';

$pdo = Database::getConnection();

function addColumnIfNotExists(PDO $pdo, string $table, string $column, string $colDef): void {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
    ");
    $stmt->execute([$table, $column]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $colDef");
        echo "Added column $column to $table\n";
    } else {
        echo "Column $column already exists in $table\n";
    }
}

// 1. Synchronize `services`
addColumnIfNotExists($pdo, 'services', 'display_order', "INT DEFAULT 0");

// 2. Synchronize `locations`
addColumnIfNotExists($pdo, 'locations', 'display_order', "INT DEFAULT 0");

// 3. Synchronize `invoices`
addColumnIfNotExists($pdo, 'invoices', 'customer_id', "VARCHAR(50) NULL");
addColumnIfNotExists($pdo, 'invoices', 'pdf_path', "VARCHAR(255) NULL");

// 4. Synchronize `bookings`
addColumnIfNotExists($pdo, 'bookings', 'customer_id', "VARCHAR(50) NULL");
addColumnIfNotExists($pdo, 'bookings', 'customer_email', "VARCHAR(150) NULL");
addColumnIfNotExists($pdo, 'bookings', 'building', "VARCHAR(150) NULL");
addColumnIfNotExists($pdo, 'bookings', 'apartment', "VARCHAR(50) NULL");
addColumnIfNotExists($pdo, 'bookings', 'access_notes', "TEXT NULL");
addColumnIfNotExists($pdo, 'bookings', 'duration_hours', "DECIMAL(4,2) DEFAULT 3.00");
addColumnIfNotExists($pdo, 'bookings', 'property_size', "VARCHAR(50) DEFAULT '2_bedroom'");
addColumnIfNotExists($pdo, 'bookings', 'subtotal', "DECIMAL(10,2) DEFAULT 0.00");
addColumnIfNotExists($pdo, 'bookings', 'discount_amount', "DECIMAL(10,2) DEFAULT 0.00");
addColumnIfNotExists($pdo, 'bookings', 'promo_code', "VARCHAR(50) NULL");
addColumnIfNotExists($pdo, 'bookings', 'vat_rate', "DECIMAL(5,2) DEFAULT 5.00");
addColumnIfNotExists($pdo, 'bookings', 'vat_amount', "DECIMAL(10,2) DEFAULT 0.00");
addColumnIfNotExists($pdo, 'bookings', 'created_by_role', "VARCHAR(50) DEFAULT 'customer'");
addColumnIfNotExists($pdo, 'bookings', 'rescheduled_count', "INT DEFAULT 0");
addColumnIfNotExists($pdo, 'bookings', 'cancellation_reason', "TEXT NULL");

// Sync legacy price and vat in bookings to subtotal and vat_amount if 0
$pdo->exec("UPDATE bookings SET subtotal = price WHERE (subtotal IS NULL OR subtotal = 0) AND price > 0");
$pdo->exec("UPDATE bookings SET vat_amount = vat WHERE (vat_amount IS NULL OR vat_amount = 0) AND vat > 0");

echo "Database synchronization completed successfully!\n";
