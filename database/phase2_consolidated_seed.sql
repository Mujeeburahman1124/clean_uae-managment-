-- =====================================================================
-- Clean UAE (تنظيف الفخامة) — Phase 2 Consolidated Seed Data Script
-- Populates initial reference data for all normalized tables:
-- - Equipment catalog & service equipment requirements
-- - Service addons (oven, balcony, fridge, mattress steam)
-- - Sample booking items & payments
-- - Staff skills & availability matrix
-- - Feedback & reviews
-- - Operational expenses
-- =====================================================================

USE `cleanuae_db`;

-- 1. Seed Sample Completed Booking if not exists (for feedback linking)
INSERT INTO `bookings` (`id`, `customer_name`, `customer_phone`, `service_id`, `service_name`, `emirate`, `area`, `address`, `booking_date`, `time_slot`, `cleaners_count`, `price`, `vat`, `total_amount`, `payment_method`, `payment_status`, `status`, `assigned_staff`) VALUES
('CUAE-7721', 'Fatima Al-Ali', '+971504445566', 'move-in-out', 'Move-In / Move-Out Cleaning', 'Ajman', 'Al Mowaihat', 'Villa 88', '2026-09-20', '10:00 AM - 02:00 PM', 3, 250.00, 12.50, 262.50, 'card', 'paid', 'completed', 'Rashid Khan')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 2. Seed Equipment
INSERT INTO `equipment` (`id`, `name`, `serial_number`, `type`, `condition_status`) VALUES
('eq-1', 'Kärcher Commercial Steam Extractor SG 4/4', 'KRC-2026-001', 'Steam Machine', 'operational'),
('eq-2', 'Kärcher Professional Wet & Dry Vacuum NT 30/1', 'KRC-2026-002', 'Vacuum', 'operational'),
('eq-3', 'Rotary Floor Scrubber Machine 17-inch', 'RFS-2026-003', 'Scrubber', 'operational'),
('eq-4', 'High-Pressure Water Jet Reservoir Cleaner', 'HPW-2026-004', 'Pressure Washer', 'operational'),
('eq-5', 'ULV Cold Fogger Pest Control Machine', 'ULV-2026-005', 'Fogger', 'operational')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Seed Service Equipment Requirements
INSERT INTO `service_equipment_requirements` (`id`, `service_id`, `equipment_type`, `quantity`) VALUES
('ser-1', 'sofa-carpet-mattress', 'Steam Machine', 1),
('ser-2', 'move-in-out', 'Scrubber', 1),
('ser-3', 'water-tank', 'Pressure Washer', 1),
('ser-4', 'pest-control', 'Fogger', 1)
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- 4. Seed Service Add-ons
INSERT INTO `service_addons` (`id`, `service_id`, `name_en`, `name_ar`, `price`, `duration_minutes`) VALUES
('add-oven', 'residential-deep', 'Interior Oven Steam Degreasing', 'تنظيف الفرن من الداخل بالبخار', 45.00, 30),
('add-fridge', 'residential-deep', 'Refrigerator Sanitization & Defrost', 'تنظيف وتعقيم الثلاجة بالكامل', 50.00, 30),
('add-balcony', 'residential-deep', 'Balcony Pressure Wash & Glass', 'غسيل وتلميع البلكونة والزجاج', 60.00, 45),
('add-mattress', 'sofa-carpet-mattress', 'Single Mattress Steam Extraction', 'تعقيم وغسيل مرتبة سرير مفرد بالبخار', 80.00, 30)
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

-- 5. Seed Staff Skills
INSERT INTO `staff_skills` (`staff_id`, `service_id`, `certified_date`) VALUES
('usr-staff-1', 'residential-deep', '2026-01-15'),
('usr-staff-1', 'sofa-carpet-mattress', '2026-01-20'),
('usr-staff-1', 'kitchen-bathroom', '2026-02-01')
ON DUPLICATE KEY UPDATE `certified_date` = VALUES(`certified_date`);

-- 6. Seed Staff Weekly Availability Matrix (Ajman Team)
INSERT INTO `staff_availability_schedule` (`id`, `staff_id`, `day_of_week`, `start_time`, `end_time`) VALUES
('avail-1', 'usr-staff-1', 1, '08:00:00', '17:00:00'), -- Monday
('avail-2', 'usr-staff-1', 2, '08:00:00', '17:00:00'), -- Tuesday
('avail-3', 'usr-staff-1', 3, '08:00:00', '17:00:00'), -- Wednesday
('avail-4', 'usr-staff-1', 4, '08:00:00', '17:00:00'), -- Thursday
('avail-5', 'usr-staff-1', 5, '08:00:00', '17:00:00'), -- Friday
('avail-6', 'usr-staff-1', 6, '08:00:00', '17:00:00')  -- Saturday
ON DUPLICATE KEY UPDATE `start_time` = VALUES(`start_time`);

-- 7. Seed Sample Booking Items
INSERT INTO `booking_items` (`id`, `booking_id`, `item_type`, `item_ref_id`, `name_en`, `name_ar`, `quantity`, `unit_price`, `total_price`) VALUES
('bitem-1', 'CUAE-8492', 'service', 'residential-deep', 'Residential & Deep Cleaning (2 Bedroom)', 'التنظيف السكني والشامل (غرفتين وصالة)', 1, 180.00, 180.00),
('bitem-2', 'CUAE-9104', 'service', 'sofa-carpet-mattress', 'Sofa, Carpet & Mattress Cleaning', 'تنظيف الكنب والسجاد والمفارش', 1, 150.00, 150.00),
('bitem-3', 'CUAE-7721', 'service', 'move-in-out', 'Move-In / Move-Out Cleaning', 'تنظيف الانتقال والسكن الجديد', 1, 250.00, 250.00)
ON DUPLICATE KEY UPDATE `total_price` = VALUES(`total_price`);

-- 8. Seed Payments
INSERT INTO `payments` (`id`, `booking_id`, `customer_id`, `amount`, `currency`, `method`, `gateway`, `gateway_tx_id`, `status`) VALUES
('pay-8492', 'CUAE-8492', 'usr-customer-1', 189.00, 'AED', 'card', 'stripe_uae', 'ch_simulated_8492_ae', 'successful'),
('pay-7721', 'CUAE-7721', 'usr-customer-1', 262.50, 'AED', 'card', 'stripe_uae', 'ch_simulated_7721_ae', 'successful')
ON DUPLICATE KEY UPDATE `amount` = VALUES(`amount`);

-- 9. Seed Verified Customer Feedback / Reviews
INSERT INTO `feedback` (`id`, `booking_id`, `customer_name`, `rating`, `review_text`, `verified_booking`, `is_published`) VALUES
('fb-1', 'CUAE-7721', 'Fatima Al-Ali', 5, 'Exceptional deep cleaning service in Al Mowaihat, Ajman! Cleaner Rashid was punctual, polite, and very meticulous.', 1, 1),
('fb-2', 'CUAE-8492', 'Sara Al-Nuaimi', 5, 'Professional team, effortless booking and online payment. Our villa smells fresh and looks pristine!', 1, 1)
ON DUPLICATE KEY UPDATE `rating` = VALUES(`rating`);

-- 10. Seed Operational Expenses (Consumables & Equipment Maintenance)
INSERT INTO `expenses` (`id`, `category`, `amount`, `description`, `receipt_ref`, `spent_at`, `recorded_by_user_id`) VALUES
('exp-1', 'Chemicals', 450.00, 'Restock 10x 5L Eco Disinfectant from Ajman Chemical Supplies LLC', 'RCP-EXP-9901', '2026-09-20', 'usr-finance-1'),
('exp-2', 'Equipment', 220.00, 'Replacement high-pressure hose for Kärcher Steam Extractor', 'RCP-EXP-9902', '2026-09-22', 'usr-finance-1')
ON DUPLICATE KEY UPDATE `amount` = VALUES(`amount`);
