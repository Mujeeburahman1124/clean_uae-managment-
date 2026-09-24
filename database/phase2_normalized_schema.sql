-- Clean UAE (تنظيف الفخامة) — Phase 2 Normalized Schema & Security Core DDL
-- Implements enterprise RBAC, secure user fields, slot hold locking, contract visits, material allowances, and business holidays.

USE `cleanuae_db`;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Role Permissions Mapping
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` VARCHAR(50) NOT NULL,
  `permission_id` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Update Users Table with Security Columns
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `password_hash` VARCHAR(255) NULL AFTER `phone`,
  ADD COLUMN IF NOT EXISTS `auth_token` VARCHAR(255) NULL AFTER `password_hash`,
  ADD COLUMN IF NOT EXISTS `otp_code_hash` VARCHAR(255) NULL AFTER `auth_token`,
  ADD COLUMN IF NOT EXISTS `otp_expires_at` TIMESTAMP NULL AFTER `otp_code_hash`,
  ADD COLUMN IF NOT EXISTS `failed_attempts` INT DEFAULT 0 AFTER `otp_expires_at`,
  ADD COLUMN IF NOT EXISTS `locked_until` TIMESTAMP NULL AFTER `failed_attempts`;

-- 5. Staff Detailed Profiles
CREATE TABLE IF NOT EXISTS `staff_profiles` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) UNIQUE NOT NULL,
  `supervisor_id` VARCHAR(50) NULL,
  `skills` TEXT NULL,
  `joining_date` DATE NOT NULL,
  `shift_id` VARCHAR(50) NULL,
  `photo_url` TEXT NULL,
  `emergency_contact` VARCHAR(50) NULL,
  `active_status` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Slot Holds (Atomic Locking Engine)
CREATE TABLE IF NOT EXISTS `slot_holds` (
  `id` VARCHAR(50) PRIMARY KEY,
  `slot_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `service_id` VARCHAR(50) NOT NULL,
  `emirate` VARCHAR(50) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `cleaners_count` INT DEFAULT 1,
  `session_token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_slot_lookup` (`slot_date`, `time_slot`),
  INDEX `idx_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Contract Individual Scheduled Visits
CREATE TABLE IF NOT EXISTS `contract_visits` (
  `id` VARCHAR(50) PRIMARY KEY,
  `contract_id` VARCHAR(50) NOT NULL,
  `visit_number` INT NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `booking_id` VARCHAR(50) NULL,
  `cleaner_id` VARCHAR(50) NULL,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'rescheduled', 'cancelled') DEFAULT 'scheduled',
  `completed_at` TIMESTAMP NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Service Dynamic Pricing Rules
CREATE TABLE IF NOT EXISTS `service_pricing_rules` (
  `id` VARCHAR(50) PRIMARY KEY,
  `service_id` VARCHAR(50) NOT NULL,
  `property_size` VARCHAR(50) NOT NULL,
  `bedrooms_count` INT DEFAULT 1,
  `hours` DECIMAL(4,2) NOT NULL,
  `cleaners_count` INT NOT NULL,
  `base_price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Service Standard Material & Chemical Allowances
CREATE TABLE IF NOT EXISTS `service_material_allowances` (
  `id` VARCHAR(50) PRIMARY KEY,
  `service_id` VARCHAR(50) NOT NULL,
  `inventory_id` VARCHAR(50) NOT NULL,
  `standard_qty` DECIMAL(8,2) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Material Issue, Usage & Return Exception Ledger
CREATE TABLE IF NOT EXISTS `material_transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `staff_id` VARCHAR(50) NOT NULL,
  `inventory_id` VARCHAR(50) NOT NULL,
  `issued_qty` DECIMAL(8,2) NOT NULL,
  `used_qty` DECIMAL(8,2) NOT NULL,
  `returned_qty` DECIMAL(8,2) NOT NULL,
  `excess_reason` TEXT NULL,
  `approved_by` VARCHAR(150) NULL,
  `status` ENUM('approved', 'pending_approval', 'rejected') DEFAULT 'approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Official UAE Business Holidays Calendar (for 14 Working Days Refund SLA)
CREATE TABLE IF NOT EXISTS `business_holidays` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `holiday_date` DATE NOT NULL UNIQUE,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `is_recurring` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. System Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `title_en` VARCHAR(200) NOT NULL,
  `title_ar` VARCHAR(200) NOT NULL,
  `message_en` TEXT NOT NULL,
  `message_ar` TEXT NOT NULL,
  `type` ENUM('booking', 'payment', 'refund', 'delay', 'leave', 'complaint', 'system') NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `action_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
