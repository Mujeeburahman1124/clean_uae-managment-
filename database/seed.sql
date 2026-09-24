-- Clean UAE (تنظيف الفخامة) — MySQL 8+ Initial Seed Data

USE `cleanuae_db`;

-- Seed System Settings
INSERT INTO `settings` (`key_name`, `val_value`) VALUES
('company_name', 'Clean UAE'),
('company_name_ar', 'تنظيف الفخامة'),
('vat_rate', '5'),
('referral_reward_amount', '50'),
('refund_sla_days', '14')
ON DUPLICATE KEY UPDATE `val_value` = VALUES(`val_value`);

-- Seed Emirates & Locations
INSERT INTO `locations` (`id`, `name_en`, `name_ar`, `active`, `delivery_fee`) VALUES
('ajman', 'Ajman', 'عجمان', 1, 0.00),
('dubai', 'Dubai', 'دبي', 0, 30.00),
('abu-dhabi', 'Abu Dhabi', 'أبوظبي', 0, 50.00),
('sharjah', 'Sharjah', 'الشارقة', 0, 15.00),
('uaq', 'Umm Al Quwain', 'أم القيوين', 0, 25.00),
('rak', 'Ras Al Khaimah', 'رأس الخيمة', 0, 40.00),
('fujairah', 'Fujairah', 'الفجيرة', 0, 45.00)
ON DUPLICATE KEY UPDATE `active` = VALUES(`active`);

-- Seed Ajman Neighborhood Areas
INSERT INTO `areas` (`id`, `emirate_id`, `name_en`, `name_ar`, `active`) VALUES
('al-nuaimia', 'ajman', 'Al Nuaimia', 'النعيمية', 1),
('al-rashidiya', 'ajman', 'Al Rashidiya', 'الراشدية', 1),
('al-mowaihat', 'ajman', 'Al Mowaihat', 'المويحات', 1),
('al-jurf', 'ajman', 'Al Jurf', 'الجرف', 1),
('al-rawda', 'ajman', 'Al Rawda', 'الروضة', 1),
('al-hamidiyah', 'ajman', 'Al Hamidiyah', 'الحميدية', 1)
ON DUPLICATE KEY UPDATE `active` = VALUES(`active`);

-- Seed Services Catalog
INSERT INTO `services` (`id`, `name_en`, `name_ar`, `category`, `price`, `duration_hours`, `description_en`, `description_ar`, `image_url`) VALUES
('residential-deep', 'Residential & Deep Cleaning', 'التنظيف السكني والشامل', 'residential', 180.00, 3, 'Comprehensive sanitization and deep cleaning for villas and apartments.', 'تنظيف وتعقيم شامل للشقق والفلل مع أحدث الأجهزة والمواد.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'),
('sofa-carpet-mattress', 'Sofa, Carpet & Mattress Cleaning', 'تنظيف الكنب والسجاد والمفارش', 'specialized', 150.00, 2, 'Steam extraction and stain removal for living room furniture and rugs.', 'تنظيف وغسيل بالبخار لإزالة البقع المستعصية والروائح من الكنب والسجاد.', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80'),
('move-in-out', 'Move-In / Move-Out Cleaning', 'تنظيف الانتقال والسكن الجديد', 'residential', 250.00, 4, 'Thorough vacant property sanitization, cabinet cleaning, and floor scrubbing.', 'تنظيف المنازل الفارغة قبل السكن أو بعد الانتقال لتكون جاهزة تماماً.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'),
('kitchen-bathroom', 'Kitchen & Bathroom Sanitization', 'تعقيم المطبخ والحمامات', 'specialized', 120.00, 2, 'High-temp steam treatment for tiles, ovens, grout, and sanitary fixtures.', 'تنظيف وتطهير الأسطح والأفران والأحواض والسيراميك بالبخار.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'),
('water-tank', 'Water Tank Cleaning', 'تنظيف وتعقيم خزان المياه', 'commercial', 300.00, 3, 'Municipality-approved eco-friendly water reservoir cleaning and testing.', 'تنظيف وغسيل خزانات المياه مع التعقيم واختبار النقاء المعتمد.', 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80'),
('pest-control', 'Pest Control Services', 'خدمات مكافحة الحشرات', 'specialized', 200.00, 2, 'Odorless and safe pest elimination for crawling insects, rodents, and bed bugs.', 'إبادة ومكافحة الحشرات والقوارض بمواد آمنة وبدون رائحة.', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=600&q=80'),
('maid-housekeeping', 'Hourly Maid & Housekeeping', 'خدمة العاملات بالساعة', 'maid', 35.00, 4, 'Trained, background-checked professional maids for daily home keeping.', 'عاملات تنظيف مدربات ومحترفات بالساعة للترتيب والتنظيف اليومي.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'),
('cleaning-contract', 'Monthly & Annual Cleaning Contracts', 'عقود التنظيف الشهرية والسنوية', 'contract', 600.00, 4, 'Custom recurring cleaning schedules (weekly/bi-weekly) with dedicated team.', 'عقود دورية منتظمة (أسبوعية أو شهرية) بأسعار خاصة وخطة زيارات المحددة.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

-- Seed Users
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `staff_role`, `referral_code`, `referral_balance`) VALUES
('usr-customer-1', 'Sara Al-Nuaimi', 'sara@example.ae', '+971501234567', 'customer', NULL, 'CUAE-SARA88', 100.00),
('usr-staff-1', 'Rashid Khan', 'rashid@cleanuae.ae', '+971559876543', 'staff', 'Cleaner', NULL, 0.00),
('usr-dispatcher-1', 'Tariq Al-Mansoori', 'tariq@cleanuae.ae', '+971523334455', 'dispatcher', 'Dispatcher', NULL, 0.00),
('usr-finance-1', 'Mariam Hassan', 'mariam@cleanuae.ae', '+971547778899', 'finance', 'Finance Officer', NULL, 0.00),
('usr-admin-1', 'Clean UAE Owner', 'owner@cleanuae.ae', '+971500000000', 'admin', 'HQ Admin', NULL, 0.00)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Chemical Inventory
INSERT INTO `inventory` (`id`, `name`, `category`, `stock`, `min_stock`, `unit`) VALUES
('inv-1', 'Eco Disinfectant Detergent 5L', 'Chemicals', 45, 10, 'Bottles'),
('inv-2', 'Steam Carpet Shampoo 2L', 'Chemicals', 8, 12, 'Bottles'),
('inv-3', 'Microfiber Cleaning Cloth Pack', 'Supplies', 120, 25, 'Packs'),
('inv-4', 'Heavy Duty Degreaser Spray', 'Chemicals', 30, 15, 'Cans'),
('inv-5', 'Commercial Steam Cleaner Machine', 'Equipment', 6, 2, 'Units')
ON DUPLICATE KEY UPDATE `stock` = VALUES(`stock`);

-- Seed Sample Booking
INSERT INTO `bookings` (`id`, `customer_name`, `customer_phone`, `service_id`, `service_name`, `emirate`, `area`, `address`, `booking_date`, `time_slot`, `cleaners_count`, `price`, `vat`, `total_amount`, `payment_method`, `payment_status`, `status`, `assigned_staff`) VALUES
('CUAE-8492', 'Sara Al-Nuaimi', '+971501234567', 'residential-deep', 'Residential & Deep Cleaning', 'Ajman', 'Al Nuaimia', 'Villa 14, Street 12', '2026-09-25', '09:00 AM - 12:00 PM', 2, 180.00, 9.00, 189.00, 'card', 'paid', 'assigned', 'Rashid Khan'),
('CUAE-9104', 'Mohammed Rashid', '+971569991122', 'sofa-carpet-mattress', 'Sofa, Carpet & Mattress Cleaning', 'Ajman', 'Al Rashidiya', 'Tower A, Apt 402', '2026-09-24', '02:00 PM - 04:00 PM', 1, 150.00, 7.50, 157.50, 'cash', 'outstanding_cash', 'in_progress', 'Rashid Khan')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);
