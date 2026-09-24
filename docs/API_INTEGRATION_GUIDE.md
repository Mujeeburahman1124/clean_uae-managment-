# Clean UAE (تنظيف الفخامة) — PHP 8+ / MySQL 8+ API Integration Guide

## Backend Transition Overview

The Clean UAE frontend communicates with the central reactive store via `CLEAN_UAE_API` (`js/services/api.js`). 

To transition from the frontend `localStorage` simulation mode to a production PHP 8+ / MySQL 8+ backend:

1. Update `js/services/api.js` to replace local store proxies with standard `fetch()` or `XMLHttpRequest` calls pointing to your PHP API endpoints:
   - `GET /api/v1/services.php`
   - `POST /api/v1/bookings.php`
   - `POST /api/v1/cash_collections.php`
   - `GET /api/v1/locations.php`
   - `PUT /api/v1/complaints.php`

2. Database Schema Alignment:
   - `locations`: `id`, `name_en`, `name_ar`, `active`, `delivery_fee`.
   - `bookings`: `id`, `customer_id`, `service_id`, `emirate`, `area`, `address`, `date`, `time_slot`, `total_amount`, `payment_method`, `payment_status`, `status`, `assigned_staff_id`.
   - `cash_collections`: `id`, `booking_id`, `collector_id`, `amount_collected`, `receipt_ref`, `status`.
   - `complaints`: `id`, `customer_id`, `booking_id`, `status`, `priority`, `assigned_officer`, `deadline`.
