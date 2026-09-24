-- Clean UAE (تنظيف الفخامة) — Supplemental Database Schema Update
-- Adds missing specialized tables: offers, subscribers, referral_transactions, quotations, invoices, staff_shifts, staff_requests, service_addons

USE `cleanuae_db`;

-- 17. Promotional Offers & Coupons
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

-- Seed Additional Tables
INSERT INTO `offers` (`id`, `code`, `discount_label`, `description_en`, `description_ar`, `discount_type`, `discount_value`, `min_booking_value`, `end_date`) VALUES
('off-1', 'WELCOME10', '10% OFF', '10% discount on first residential cleaning', 'خصم 10% على أول خدمة تنظيف سكني', 'percentage', 10.00, 100.00, '2026-12-31'),
('off-2', 'AJMAN50', '50 AED OFF', 'Flat AED 50 discount for Ajman residents on bookings over 200 AED', 'خصم 50 درهم لسكان عجمان للحجوزات أكثر من 200 درهم', 'fixed', 50.00, 200.00, '2026-10-31')
ON DUPLICATE KEY UPDATE `discount_value` = VALUES(`discount_value`);

INSERT INTO `subscribers` (`email`, `status`) VALUES
('client@dubai.ae', 'subscribed')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

INSERT INTO `invoices` (`id`, `invoice_number`, `booking_id`, `customer_name`, `subtotal`, `vat_rate`, `vat_amount`, `total_amount`, `payment_method`, `payment_status`) VALUES
('INV-8492', 'TAX-INV-2026-008492', 'CUAE-8492', 'Sara Al-Nuaimi', 180.00, 5.00, 9.00, 189.00, 'card', 'paid'),
('INV-9104', 'TAX-INV-2026-009104', 'CUAE-9104', 'Mohammed Rashid', 150.00, 5.00, 7.50, 157.50, 'cash', 'outstanding_cash')
ON DUPLICATE KEY UPDATE `total_amount` = VALUES(`total_amount`);
