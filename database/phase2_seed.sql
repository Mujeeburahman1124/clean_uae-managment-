-- Clean UAE (تنظيف الفخامة) — Phase 2 Seed Data Script
-- Populates roles, permissions, role mappings, UAE holidays, service pricing tiers, and material allowances.

USE `cleanuae_db`;

-- 1. Seed Roles
INSERT INTO `roles` (`id`, `name_en`, `name_ar`, `description`) VALUES
('owner', 'Business Owner', 'مالك الشركة', 'Full unrestricted ownership access across all modules and financial settings'),
('admin', 'Operations Admin', 'مدير العمليات', 'Operational management of services, locations, staff, and bookings'),
('customer_care', 'Customer Care Agent', 'خدمة العملاء', 'Handles customer booking rescheduling, alternative slot lookup, and cancellations'),
('dispatcher', 'Field Dispatcher', 'منسق المواعيد', 'Manages live schedules, cleaner routing, travel buffers, and task reassignments'),
('supervisor', 'Field Supervisor', 'مشرف الميدان', 'Reviews before/after photos, approves completion reports and extra chemical requests'),
('staff', 'Cleaner / Housekeeper', 'عامل تنظيف', 'Field cleaner with mobile access to assigned tasks, clock-in, photos, and chemical logs'),
('finance', 'Finance Officer', 'المسؤول المالي', 'Manages cash collection handovers, manager reconciliation, refunds, and VAT ledgers'),
('customer', 'Customer', 'عميل', 'Self-service booking, contract management, address book, and referral wallet')
ON DUPLICATE KEY UPDATE `name_en` = VALUES(`name_en`);

-- 2. Seed Core Permissions
INSERT INTO `permissions` (`id`, `name_en`, `name_ar`, `module`) VALUES
('bookings.view_all', 'View All Bookings', 'عرض كافة الحجوزات', 'bookings'),
('bookings.manage', 'Create & Edit Bookings', 'إدارة الحجوزات', 'bookings'),
('bookings.reschedule', 'Reschedule Bookings', 'تأجيل الحجوزات', 'bookings'),
('bookings.cancel', 'Cancel Bookings', 'إلغاء الحجوزات', 'bookings'),
('locations.manage', 'Manage Emirates & Areas', 'إدارة الإمارات والمناطق', 'locations'),
('cash.reconcile', 'Reconcile Cash Collections', 'تسوية النقد المحصل', 'finance'),
('refunds.manage', 'Process Refunds', 'معالجة الاسترداد المالي', 'finance'),
('inventory.manage', 'Manage Chemical Inventory', 'إدارة مخزون المواد', 'inventory'),
('inventory.approve_excess', 'Approve Excess Chemical', 'الموافقة على المواد الزائدة', 'inventory'),
('staff.approve_leave', 'Approve Staff Leave', 'اعتماد إجازات الموظفين', 'staff'),
('tasks.execute', 'Execute Cleaning Tasks', 'تنفيذ مهام التنظيف', 'tasks'),
('tasks.upload_photos', 'Upload Before/After Photos', 'رفع صور ما قبل وبعد', 'tasks'),
('settings.manage', 'Manage System Settings', 'إدارة إعدادات النظام', 'settings')
ON DUPLICATE KEY UPDATE `name_en` = VALUES(`name_en`);

-- 3. Map Owner & Admin Permissions
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'owner', `id` FROM `permissions`;

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 'admin', `id` FROM `permissions` WHERE `id` != 'settings.manage';

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) VALUES
('customer_care', 'bookings.view_all'),
('customer_care', 'bookings.reschedule'),
('customer_care', 'bookings.cancel'),
('dispatcher', 'bookings.view_all'),
('dispatcher', 'bookings.manage'),
('finance', 'cash.reconcile'),
('finance', 'refunds.manage'),
('supervisor', 'inventory.approve_excess'),
('supervisor', 'tasks.upload_photos'),
('staff', 'tasks.execute'),
('staff', 'tasks.upload_photos');

-- 4. Seed Official UAE Business Calendar Holidays (2026)
INSERT INTO `business_holidays` (`holiday_date`, `name_en`, `name_ar`, `is_recurring`) VALUES
('2026-01-01', 'New Year\'s Day', 'رأس السنة الميلادية', 1),
('2026-03-20', 'Eid Al Fitr (Day 1)', 'عيد الفطر المبارك', 0),
('2026-03-21', 'Eid Al Fitr (Day 2)', 'عيد الفطر المبارك', 0),
('2026-03-22', 'Eid Al Fitr (Day 3)', 'عيد الفطر المبارك', 0),
('2026-05-26', 'Arafat Day', 'يوم عرفة', 0),
('2026-05-27', 'Eid Al Adha (Day 1)', 'عيد الأضحى المبارك', 0),
('2026-05-28', 'Eid Al Adha (Day 2)', 'عيد الأضحى المبارك', 0),
('2026-05-29', 'Eid Al Adha (Day 3)', 'عيد الأضحى المبارك', 0),
('2026-06-16', 'Islamic New Year', 'رأس السنة الهجرية', 0),
('2026-08-25', 'Prophet\'s Birthday', 'المولد النبوي الشريف', 0),
('2026-12-02', 'UAE National Day', 'اليوم الوطني لدولة الإمارات', 1),
('2026-12-03', 'National Day Holiday', 'عطلة اليوم الوطني', 1)
ON DUPLICATE KEY UPDATE `name_en` = VALUES(`name_en`);

-- 5. Seed Service Pricing Rules (Tiers for Residential Deep Clean)
INSERT INTO `service_pricing_rules` (`id`, `service_id`, `property_size`, `bedrooms_count`, `hours`, `cleaners_count`, `base_price`) VALUES
('pr-res-studio', 'residential-deep', 'studio', 0, 2.50, 1, 140.00),
('pr-res-1bed', 'residential-deep', '1_bedroom', 1, 3.00, 2, 180.00),
('pr-res-2bed', 'residential-deep', '2_bedroom', 2, 4.00, 2, 240.00),
('pr-res-3bed', 'residential-deep', '3_bedroom', 3, 5.00, 3, 340.00),
('pr-res-4bed', 'residential-deep', '4_plus_bedroom', 4, 6.00, 4, 480.00)
ON DUPLICATE KEY UPDATE `base_price` = VALUES(`base_price`);

-- 6. Seed Standard Material Allowances per Service
INSERT INTO `service_material_allowances` (`id`, `service_id`, `inventory_id`, `standard_qty`, `unit`) VALUES
('allw-1', 'residential-deep', 'inv-1', 500.00, 'ml'),
('allw-2', 'residential-deep', 'inv-3', 4.00, 'cloths'),
('allw-3', 'sofa-carpet-mattress', 'inv-2', 300.00, 'ml'),
('allw-4', 'move-in-out', 'inv-4', 800.00, 'ml'),
('allw-5', 'kitchen-bathroom', 'inv-1', 400.00, 'ml')
ON DUPLICATE KEY UPDATE `standard_qty` = VALUES(`standard_qty`);
