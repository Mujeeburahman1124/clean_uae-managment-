-- Clean UAE (تنظيف الفخامة) — MySQL 8+ Database Schema DDL
-- Authoritative database definition for production PHP 8+ backend integration

CREATE DATABASE IF NOT EXISTS `cleanuae_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cleanuae_db`;

-- 1. System Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) PRIMARY KEY,
  `val_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Emirates & Locations Table
CREATE TABLE IF NOT EXISTS `locations` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `active` TINYINT(1) DEFAULT 0,
  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Neighborhoods / Areas Table
CREATE TABLE IF NOT EXISTS `areas` (
  `id` VARCHAR(50) PRIMARY KEY,
  `emirate_id` VARCHAR(50) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`emirate_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Service Categories & Services Catalog
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `duration_hours` INT DEFAULT 2,
  `description_en` TEXT,
  `description_ar` TEXT,
  `image_url` TEXT,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Users & Staff Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `role` ENUM('admin', 'customer', 'staff', 'dispatcher', 'finance') NOT NULL DEFAULT 'customer',
  `staff_role` VARCHAR(50) DEFAULT NULL,
  `referral_code` VARCHAR(50) UNIQUE DEFAULT NULL,
  `referral_balance` DECIMAL(10,2) DEFAULT 0.00,
  `active_status` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Saved Addresses
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `emirate` VARCHAR(50) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `building` VARCHAR(150),
  `apartment` VARCHAR(50),
  `street` VARCHAR(150),
  `notes` TEXT,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `service_id` VARCHAR(50) NOT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `emirate` VARCHAR(50) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `booking_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `cleaners_count` INT DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL,
  `vat` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card', 'cash') NOT NULL DEFAULT 'card',
  `payment_status` ENUM('paid', 'outstanding_cash') NOT NULL DEFAULT 'paid',
  `status` ENUM('booked', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
  `assigned_staff` VARCHAR(150) DEFAULT NULL,
  `hold_expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Contracts Table
CREATE TABLE IF NOT EXISTS `contracts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `frequency` VARCHAR(50) NOT NULL,
  `total_visits` INT NOT NULL,
  `completed_visits` INT DEFAULT 0,
  `remaining_visits` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `monthly_price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Staff Attendance Logs
CREATE TABLE IF NOT EXISTS `staff_attendance` (
  `id` VARCHAR(50) PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL,
  `staff_name` VARCHAR(150) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `clock_in` VARCHAR(50),
  `clock_out` VARCHAR(50),
  `gps_verified` TINYINT(1) DEFAULT 1,
  `status` ENUM('on_duty', 'clocked_out', 'late', 'absent') DEFAULT 'on_duty',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Staff Leave Requests
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` VARCHAR(50) PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL,
  `staff_name` VARCHAR(150) NOT NULL,
  `leave_type` VARCHAR(50) NOT NULL,
  `dates` VARCHAR(100) NOT NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Task Before & After Photos
CREATE TABLE IF NOT EXISTS `task_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `stage` ENUM('before', 'after') NOT NULL,
  `photo_path` TEXT NOT NULL,
  `damage_notes` TEXT,
  `uploaded_by` VARCHAR(150),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Chemical Inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT NOT NULL DEFAULT 10,
  `unit` VARCHAR(50) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Customer Complaints SLA
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `booking_id` VARCHAR(50) NOT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `status` ENUM('open', 'under_review', 'action_scheduled', 'resolved', 'closed') DEFAULT 'open',
  `assigned_officer` VARCHAR(150),
  `deadline` DATE,
  `customer_message` TEXT,
  `internal_notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Cash Collection Handovers
CREATE TABLE IF NOT EXISTS `cash_collections` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `collector_name` VARCHAR(150) NOT NULL,
  `amount_collected` DECIMAL(10,2) NOT NULL,
  `collected_at` VARCHAR(100) NOT NULL,
  `receipt_ref` VARCHAR(50) NOT NULL,
  `status` ENUM('pending_handover', 'reconciled') DEFAULT 'pending_handover',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Refund SLA Tracker
CREATE TABLE IF NOT EXISTS `refunds` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `cancellation_date` DATE NOT NULL,
  `expected_deadline` DATE NOT NULL,
  `working_days_remaining` INT DEFAULT 14,
  `status` ENUM('processing', 'completed', 'rejected') DEFAULT 'processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Audit Trail Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(150) NOT NULL,
  `action_performed` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
