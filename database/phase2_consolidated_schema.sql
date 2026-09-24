-- =====================================================================
-- Clean UAE (تنظيف الفخامة) — Phase 2 Consolidated & Normalized Schema
-- Authoritative Schema DDL covering all Enterprise Requirements:
-- - Full normalized RBAC (users, roles, permissions, role_permissions)
-- - Geographical Hierarchy (locations/emirates, areas)
-- - Service Catalog & Dynamic Pricing (services, service_pricing_rules, service_addons, service_requirements)
-- - Inventory, Equipment & Materials (inventory, equipment, material_allowances, material_transactions)
-- - Bookings & Dynamic Slot Management (bookings, booking_items, slot_holds, availability)
-- - Payments, Invoices & Financials (payments, invoices, cash_collections, refunds, expenses)
-- - Recurring Contracts (contracts, contract_visits)
-- - Staff Field Operations (staff_profiles, staff_skills, staff_shifts, staff_attendance, leave_requests)
-- - Field Execution Lifecycle (booking_assignments, task_events, task_photos, completion_reports)
-- - Quality & Customer Care (complaints, feedback, quotations, customer care notes)
-- - Marketing & Loyalty (offers, subscribers, referral_transactions)
-- - Governance & Core Engines (business_holidays, notifications, audit_logs, settings)
-- 
-- STRICT CONSTRAINT: Zero payroll or salary calculation tables.
-- =====================================================================

USE `cleanuae_db`;

-- ---------------------------------------------------------------------
-- 1. SYSTEM SETTINGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) PRIMARY KEY,
  `val_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. RBAC: ROLES & PERMISSIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` VARCHAR(50) NOT NULL,
  `permission_id` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. USERS & AUTHENTICATION
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NULL,
  `auth_token` VARCHAR(255) NULL,
  `otp_code_hash` VARCHAR(255) NULL,
  `otp_expires_at` TIMESTAMP NULL DEFAULT NULL,
  `failed_attempts` INT DEFAULT 0,
  `locked_until` TIMESTAMP NULL DEFAULT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'customer',
  `staff_role` VARCHAR(50) DEFAULT NULL,
  `referral_code` VARCHAR(50) UNIQUE DEFAULT NULL,
  `referral_balance` DECIMAL(10,2) DEFAULT 0.00,
  `preferred_lang` ENUM('en', 'ar') DEFAULT 'en',
  `active_status` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `emirate` VARCHAR(50) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `building` VARCHAR(150),
  `apartment` VARCHAR(50),
  `street` VARCHAR(150),
  `landmark` VARCHAR(150),
  `notes` TEXT,
  `is_default` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. GEOGRAPHICAL HIERARCHY: LOCATIONS & AREAS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `locations` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `active` TINYINT(1) DEFAULT 0,
  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `areas` (
  `id` VARCHAR(50) PRIMARY KEY,
  `emirate_id` VARCHAR(50) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `delivery_fee_override` DECIMAL(10,2) DEFAULT NULL,
  `travel_buffer_minutes` INT DEFAULT 30,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`emirate_id`) REFERENCES `locations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. SERVICES, DYNAMIC PRICING & ADD-ONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `duration_hours` DECIMAL(4,2) DEFAULT 2.00,
  `description_en` TEXT,
  `description_ar` TEXT,
  `image_url` TEXT,
  `active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS `service_addons` (
  `id` VARCHAR(50) PRIMARY KEY,
  `service_id` VARCHAR(50) NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `duration_minutes` INT DEFAULT 30,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. INVENTORY, EQUIPMENT & MATERIALS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('Chemicals', 'Supplies', 'Equipment', 'Consumables') NOT NULL DEFAULT 'Chemicals',
  `stock` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `min_stock` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  `unit` VARCHAR(50) NOT NULL,
  `unit_cost` DECIMAL(10,2) DEFAULT 0.00,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `equipment` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `serial_number` VARCHAR(100) UNIQUE NULL,
  `type` VARCHAR(100) NOT NULL,
  `condition_status` ENUM('operational', 'needs_maintenance', 'under_repair', 'retired') DEFAULT 'operational',
  `last_serviced_at` DATE NULL,
  `next_service_due` DATE NULL,
  `assigned_to_staff_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`assigned_to_staff_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_material_allowances` (
  `id` VARCHAR(50) PRIMARY KEY,
  `service_id` VARCHAR(50) NOT NULL,
  `inventory_id` VARCHAR(50) NOT NULL,
  `standard_qty` DECIMAL(8,2) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_equipment_requirements` (
  `id` VARCHAR(50) PRIMARY KEY,
  `service_id` VARCHAR(50) NOT NULL,
  `equipment_type` VARCHAR(100) NOT NULL,
  `quantity` INT DEFAULT 1,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `material_transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NULL,
  `staff_id` VARCHAR(50) NOT NULL,
  `inventory_id` VARCHAR(50) NOT NULL,
  `issued_qty` DECIMAL(8,2) NOT NULL,
  `used_qty` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `returned_qty` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `excess_reason` TEXT NULL,
  `approved_by` VARCHAR(150) NULL,
  `status` ENUM('approved', 'pending_approval', 'rejected') DEFAULT 'approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. SLOT HOLDS & CAPACITY AVAILABILITY
-- ---------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS `staff_availability_schedule` (
  `id` VARCHAR(50) PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL,
  `day_of_week` TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday... 6=Saturday',
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. BOOKINGS & NORMALIZED BOOKING ITEMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_id` VARCHAR(50) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_email` VARCHAR(150) NULL,
  `service_id` VARCHAR(50) NOT NULL,
  `service_name` VARCHAR(150) NOT NULL,
  `emirate` VARCHAR(50) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `building` VARCHAR(150) NULL,
  `apartment` VARCHAR(50) NULL,
  `access_notes` TEXT NULL,
  `booking_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `duration_hours` DECIMAL(4,2) DEFAULT 3.00,
  `cleaners_count` INT DEFAULT 1,
  `property_size` VARCHAR(50) DEFAULT '2_bedroom',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00,
  `promo_code` VARCHAR(50) NULL,
  `vat_rate` DECIMAL(5,2) DEFAULT 5.00,
  `vat_amount` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card', 'cash') NOT NULL DEFAULT 'card',
  `payment_status` ENUM('paid', 'outstanding_cash', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'paid',
  `status` ENUM('booked', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
  `assigned_staff` VARCHAR(150) DEFAULT NULL,
  `hold_expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by_role` VARCHAR(50) DEFAULT 'customer',
  `rescheduled_count` INT DEFAULT 0,
  `cancellation_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_date_slot` (`booking_date`, `time_slot`),
  INDEX `idx_customer` (`customer_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_items` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `item_type` ENUM('service', 'addon', 'custom') NOT NULL DEFAULT 'service',
  `item_ref_id` VARCHAR(50) NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. PAYMENTS, CASH COLLECTIONS, INVOICES & REFUNDS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'AED',
  `method` ENUM('card', 'cash', 'apple_pay', 'wallet_credit') NOT NULL,
  `gateway` VARCHAR(50) DEFAULT 'manual',
  `gateway_tx_id` VARCHAR(150) NULL,
  `status` ENUM('pending', 'successful', 'failed', 'refunded') DEFAULT 'successful',
  `collected_by_staff_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`collected_by_staff_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(50) PRIMARY KEY,
  `invoice_number` VARCHAR(100) UNIQUE NOT NULL,
  `booking_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `vat_rate` DECIMAL(5,2) DEFAULT 5.00,
  `vat_amount` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('card', 'cash') NOT NULL,
  `payment_status` ENUM('paid', 'outstanding_cash') NOT NULL,
  `pdf_path` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cash_collections` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `collector_id` VARCHAR(50) NULL,
  `collector_name` VARCHAR(150) NOT NULL,
  `amount_collected` DECIMAL(10,2) NOT NULL,
  `collected_at` VARCHAR(100) NOT NULL,
  `receipt_ref` VARCHAR(50) NOT NULL,
  `status` ENUM('pending_handover', 'reconciled') DEFAULT 'pending_handover',
  `reconciled_by_user_id` VARCHAR(50) NULL,
  `reconciled_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`),
  FOREIGN KEY (`collector_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`reconciled_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refunds` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `cancellation_date` DATE NOT NULL,
  `expected_deadline` DATE NOT NULL,
  `working_days_remaining` INT DEFAULT 14,
  `processed_by_user_id` VARCHAR(50) NULL,
  `gateway_refund_ref` VARCHAR(150) NULL,
  `status` ENUM('processing', 'completed', 'rejected') DEFAULT 'processing',
  `rejection_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`),
  FOREIGN KEY (`processed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('Chemicals', 'Equipment', 'Fuel_Transport', 'Uniforms', 'Marketing', 'Office', 'Other') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `receipt_ref` VARCHAR(100) NULL,
  `spent_at` DATE NOT NULL,
  `recorded_by_user_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. RECURRING CONTRACTS & VISITS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contracts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_id` VARCHAR(50) NULL,
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contract_visits` (
  `id` VARCHAR(50) PRIMARY KEY,
  `contract_id` VARCHAR(50) NOT NULL,
  `visit_number` INT NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `time_slot` VARCHAR(50) NOT NULL,
  `booking_id` VARCHAR(50) NULL,
  `cleaner_id` VARCHAR(50) NULL,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'rescheduled', 'cancelled') DEFAULT 'scheduled',
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cleaner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. STAFF PROFILES, SKILLS, SHIFTS, ATTENDANCE & LEAVE
-- ---------------------------------------------------------------------
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
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `staff_skills` (
  `staff_id` VARCHAR(50) NOT NULL,
  `service_id` VARCHAR(50) NOT NULL,
  `certified_date` DATE NULL,
  PRIMARY KEY (`staff_id`, `service_id`),
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `staff_shifts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL,
  `shift_date` DATE NOT NULL,
  `scheduled_start` TIME NOT NULL,
  `scheduled_end` TIME NOT NULL,
  `actual_hours` DECIMAL(5,2) DEFAULT 0.00,
  `recorded_overtime` DECIMAL(5,2) DEFAULT 0.00,
  `approved_overtime` DECIMAL(5,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `staff_attendance` (
  `id` VARCHAR(50) PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL,
  `staff_name` VARCHAR(150) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `clock_in` VARCHAR(50),
  `clock_out` VARCHAR(50),
  `clock_in_latitude` DECIMAL(10,7) NULL,
  `clock_in_longitude` DECIMAL(10,7) NULL,
  `gps_verified` TINYINT(1) DEFAULT 1,
  `status` ENUM('on_duty', 'clocked_out', 'late', 'absent') DEFAULT 'on_duty',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` VARCHAR(50) PRIMARY KEY,
  `staff_id` VARCHAR(50) NOT NULL,
  `staff_name` VARCHAR(150) NOT NULL,
  `leave_type` VARCHAR(50) NOT NULL,
  `dates` VARCHAR(100) NOT NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `approved_by_user_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. DISPATCH ASSIGNMENTS, TASK EVENTS, PHOTOS & COMPLETION
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `booking_assignments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `staff_id` VARCHAR(50) NOT NULL,
  `assignment_role` ENUM('lead', 'assistant') DEFAULT 'lead',
  `assigned_by_user_id` VARCHAR(50) NULL,
  `status` ENUM('assigned', 'accepted', 'rejected', 'reassigned') DEFAULT 'assigned',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `task_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `staff_id` VARCHAR(50) NOT NULL,
  `stage` ENUM('assigned', 'accepted', 'departed', 'arrived', 'in_progress', 'delay_reported', 'finished') NOT NULL,
  `event_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(10,7) NULL,
  `notes` TEXT NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `task_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `stage` ENUM('before', 'after') NOT NULL,
  `photo_path` TEXT NOT NULL,
  `damage_notes` TEXT,
  `uploaded_by` VARCHAR(150),
  `is_private` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `completion_reports` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) UNIQUE NOT NULL,
  `completed_by_staff_id` VARCHAR(50) NOT NULL,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `customer_present` TINYINT(1) DEFAULT 1,
  `customer_signature_confirmed` TINYINT(1) DEFAULT 1,
  `before_photos_count` INT DEFAULT 0,
  `after_photos_count` INT DEFAULT 0,
  `supervisor_approved` TINYINT(1) DEFAULT 0,
  `notes` TEXT NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`completed_by_staff_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. COMPLAINTS, FEEDBACK & QUOTATIONS
-- ---------------------------------------------------------------------
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
  `resolution_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` VARCHAR(50) PRIMARY KEY,
  `booking_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `review_text` TEXT NULL,
  `verified_booking` TINYINT(1) DEFAULT 1,
  `is_published` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quotations` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `service_type` VARCHAR(100) NOT NULL,
  `property_type` VARCHAR(100) NOT NULL,
  `estimated_hours` DECIMAL(4,2) DEFAULT 4.00,
  `cleaners_needed` INT DEFAULT 2,
  `estimated_price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('draft', 'sent', 'accepted', 'expired') DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. MARKETING & LOYALTY (OFFERS, SUBSCRIBERS, REFERRALS)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `offers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `discount_label` VARCHAR(100) NOT NULL,
  `description_en` TEXT,
  `description_ar` TEXT,
  `discount_type` ENUM('percentage', 'fixed') DEFAULT 'fixed',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_booking_value` DECIMAL(10,2) DEFAULT 0.00,
  `start_date` DATE,
  `end_date` DATE,
  `usage_limit` INT DEFAULT 100,
  `used_count` INT DEFAULT 0,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `status` ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed',
  `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `referral_transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `referrer_user_id` VARCHAR(50) NOT NULL,
  `referred_user_id` VARCHAR(50) NOT NULL,
  `booking_id` VARCHAR(50) NOT NULL,
  `credit_amount` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  `status` ENUM('pending', 'awarded', 'cancelled') DEFAULT 'awarded',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`referrer_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. BUSINESS HOLIDAYS, NOTIFICATIONS & AUDIT LOGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `business_holidays` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `holiday_date` DATE NOT NULL UNIQUE,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `is_recurring` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(150) NOT NULL,
  `user_id` VARCHAR(50) NULL,
  `action_performed` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
