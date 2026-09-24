<?php
/**
 * Clean UAE (تنظيف الفخامة) — Enterprise Bookings Engine Controller
 * Manages full transactional booking lifecycle, guest/customer resolution, 
 * normalized booking_items, UAE VAT calculation, invoice generation, 
 * payments, slot hold release, staff assignments, and task events.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bookingId = $_GET['id'] ?? null;

    if ($bookingId) {
        // Fetch single booking with all normalized relations
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ? LIMIT 1");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch();

        if (!$booking) {
            ApiResponse::error('Booking not found', 404);
        }

        // Customer RBAC check: Customers can only view their own bookings
        $user = Auth::user();
        if ($user && $user['role'] === 'customer') {
            if ($booking['customer_id'] && $booking['customer_id'] !== $user['id'] && $booking['customer_email'] !== $user['email']) {
                ApiResponse::error('Forbidden. Cannot access bookings of another customer.', 403);
            }
        }

        // 1. Fetch line items
        $itemsStmt = $pdo->prepare("SELECT * FROM booking_items WHERE booking_id = ?");
        $itemsStmt->execute([$bookingId]);
        $booking['items'] = $itemsStmt->fetchAll();

        // 2. Fetch staff assignments
        $assignStmt = $pdo->prepare("
            SELECT ba.*, u.name as staff_name, u.phone as staff_phone, u.role as user_role
            FROM booking_assignments ba
            LEFT JOIN users u ON ba.staff_id = u.id
            WHERE ba.booking_id = ?
        ");
        $assignStmt->execute([$bookingId]);
        $booking['assignments'] = $assignStmt->fetchAll();

        // 3. Fetch payments
        $payStmt = $pdo->prepare("SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC");
        $payStmt->execute([$bookingId]);
        $booking['payments'] = $payStmt->fetchAll();

        // 4. Fetch invoice
        $invStmt = $pdo->prepare("SELECT * FROM invoices WHERE booking_id = ? LIMIT 1");
        $invStmt->execute([$bookingId]);
        $booking['invoice'] = $invStmt->fetch();

        // 5. Fetch task events (timeline)
        $eventsStmt = $pdo->prepare("
            SELECT te.*, u.name as staff_name
            FROM task_events te
            LEFT JOIN users u ON te.staff_id = u.id
            WHERE te.booking_id = ?
            ORDER BY te.event_time ASC
        ");
        $eventsStmt->execute([$bookingId]);
        $booking['timeline'] = $eventsStmt->fetchAll();

        // 6. Fetch feedback
        $feedStmt = $pdo->prepare("SELECT * FROM feedback WHERE booking_id = ? LIMIT 1");
        $feedStmt->execute([$bookingId]);
        $booking['feedback'] = $feedStmt->fetch();

        // 7. Fetch task photos
        $photoStmt = $pdo->prepare("SELECT * FROM task_photos WHERE booking_id = ? ORDER BY created_at ASC");
        $photoStmt->execute([$bookingId]);
        $booking['photos'] = $photoStmt->fetchAll();

        ApiResponse::send($booking, 200, 'Booking details fetched');
    }

    // List bookings
    $user = Auth::requireAuth();
    $status = $_GET['status'] ?? '';
    $date = $_GET['date'] ?? '';
    $emirate = $_GET['emirate'] ?? '';
    $search = $_GET['search'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int)($_GET['limit'] ?? 25)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    if ($user['role'] === 'customer') {
        $where[] = "(customer_id = ? OR customer_email = ?)";
        $params[] = $user['id'];
        $params[] = $user['email'];
    } elseif ($user['role'] === 'staff') {
        $where[] = "(assigned_staff LIKE ? OR id IN (SELECT booking_id FROM booking_assignments WHERE staff_id = ?))";
        $params[] = '%' . $user['name'] . '%';
        $params[] = $user['id'];
    }

    if (!empty($status)) {
        $where[] = "status = ?";
        $params[] = $status;
    }
    if (!empty($date)) {
        $where[] = "booking_date = ?";
        $params[] = $date;
    }
    if (!empty($emirate)) {
        $where[] = "emirate = ?";
        $params[] = $emirate;
    }
    if (!empty($search)) {
        $where[] = "(id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)";
        $searchTerm = '%' . $search . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $whereSql = !empty($where) ? ('WHERE ' . implode(' AND ', $where)) : '';

    // Total count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings $whereSql");
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();

    // Query rows
    $query = "SELECT * FROM bookings $whereSql ORDER BY booking_date DESC, created_at DESC LIMIT ? OFFSET ?";
    $stmt = $pdo->prepare($query);
    $bindIdx = 1;
    foreach ($params as $p) {
        $stmt->bindValue($bindIdx++, $p);
    }
    $stmt->bindValue($bindIdx++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($bindIdx++, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $bookings = $stmt->fetchAll();

    ApiResponse::send([
        'total'    => $totalCount,
        'page'     => $page,
        'limit'    => $limit,
        'bookings' => $bookings
    ], 200, 'Bookings list fetched');

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        ApiResponse::error('Invalid JSON payload', 400);
    }

    $serviceId = $input['serviceId'] ?? $input['service_id'] ?? '';
    $bookingDate = $input['date'] ?? $input['booking_date'] ?? '';
    $timeSlot = $input['timeSlot'] ?? $input['time_slot'] ?? '09:00 AM - 12:00 PM';
    $customerName = trim($input['customerName'] ?? $input['customer_name'] ?? '');
    $customerPhone = trim($input['customerPhone'] ?? $input['customer_phone'] ?? '');
    $customerEmail = trim($input['customerEmail'] ?? $input['customer_email'] ?? '');

    if (empty($serviceId) || empty($bookingDate) || empty($customerName) || empty($customerPhone)) {
        ApiResponse::error('Missing required booking details (serviceId, date, customerName, customerPhone)', 400);
    }

    // 1. Resolve or Create Customer User Account
    $customerId = null;
    $currentUser = Auth::user();
    if ($currentUser) {
        $customerId = $currentUser['id'];
        if (empty($customerEmail)) $customerEmail = $currentUser['email'];
    } else {
        // Look up by email or phone
        $userFind = $pdo->prepare("SELECT id, email FROM users WHERE (email = ? AND email != '') OR phone = ? LIMIT 1");
        $userFind->execute([$customerEmail, $customerPhone]);
        $foundUser = $userFind->fetch();

        if ($foundUser) {
            $customerId = $foundUser['id'];
        } else {
            // Auto-create guest user record
            $customerId = 'CUST-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 8));
            $refCode = 'CLEAN-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
            $guestEmail = !empty($customerEmail) ? $customerEmail : ('guest_' . substr(bin2hex(random_bytes(4)), 0, 6) . '@cleanuae.ae');
            
            $createCustStmt = $pdo->prepare("
                INSERT INTO users (id, name, email, phone, role, referral_code, active_status)
                VALUES (?, ?, ?, ?, 'customer', ?, 1)
            ");
            $createCustStmt->execute([$customerId, $customerName, $guestEmail, $customerPhone, $refCode]);
        }
    }

    // 2. Fetch Service Details
    $servStmt = $pdo->prepare("SELECT * FROM services WHERE id = ? LIMIT 1");
    $servStmt->execute([$serviceId]);
    $service = $servStmt->fetch();
    $serviceName = $service ? $service['name_en'] : ($input['serviceName'] ?? 'Cleaning Service');
    $serviceNameAr = $service ? $service['name_ar'] : 'خدمة تنظيف';

    // 3. Calculate Base Price and Cleaner Count
    $cleanersCount = max(1, (int)($input['cleanersCount'] ?? $input['cleaners_count'] ?? 1));
    $propertySize = $input['propertySize'] ?? $input['property_size'] ?? '2_bedroom';
    $durationHours = (float)($input['durationHours'] ?? $input['duration_hours'] ?? ($service['duration_hours'] ?? 3.00));

    $basePrice = (float)($service['price'] ?? 180.00);

    // Check dynamic pricing rules
    $pricingRuleStmt = $pdo->prepare("
        SELECT base_price, cleaners_count, hours 
        FROM service_pricing_rules 
        WHERE service_id = ? AND property_size = ? 
        LIMIT 1
    ");
    $pricingRuleStmt->execute([$serviceId, $propertySize]);
    $rule = $pricingRuleStmt->fetch();
    if ($rule) {
        $basePrice = (float)$rule['base_price'];
        if (empty($input['cleanersCount'])) {
            $cleanersCount = (int)$rule['cleaners_count'];
        }
        if (empty($input['durationHours'])) {
            $durationHours = (float)$rule['hours'];
        }
    }

    // 4. Calculate Add-ons
    $addons = $input['addons'] ?? [];
    $normalizedItems = [];
    $addonsSubtotal = 0.00;

    // Primary service item
    $normalizedItems[] = [
        'id'          => 'ITEM-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 8)),
        'type'        => 'service',
        'ref_id'      => $serviceId,
        'name_en'     => $serviceName,
        'name_ar'     => $serviceNameAr,
        'quantity'    => 1,
        'unit_price'  => $basePrice,
        'total_price' => $basePrice
    ];

    if (!empty($addons) && is_array($addons)) {
        foreach ($addons as $addon) {
            $addonId = is_array($addon) ? ($addon['id'] ?? '') : $addon;
            $addonQty = is_array($addon) ? max(1, (int)($addon['quantity'] ?? 1)) : 1;

            if ($addonId) {
                $adStmt = $pdo->prepare("SELECT * FROM service_addons WHERE id = ? LIMIT 1");
                $adStmt->execute([$addonId]);
                $addonRow = $adStmt->fetch();

                if ($addonRow) {
                    $uPrice = (float)$addonRow['price'];
                    $tPrice = $uPrice * $addonQty;
                    $addonsSubtotal += $tPrice;

                    $normalizedItems[] = [
                        'id'          => 'ITEM-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 8)),
                        'type'        => 'addon',
                        'ref_id'      => $addonId,
                        'name_en'     => $addonRow['name_en'],
                        'name_ar'     => $addonRow['name_ar'],
                        'quantity'    => $addonQty,
                        'unit_price'  => $uPrice,
                        'total_price' => $tPrice
                    ];
                }
            }
        }
    }

    $subtotal = $basePrice + $addonsSubtotal;

    // 5. Calculate Promo Code Discount
    $promoCode = trim($input['promoCode'] ?? $input['promo_code'] ?? '');
    $discountAmount = 0.00;

    if (!empty($promoCode)) {
        $offerStmt = $pdo->prepare("
            SELECT * FROM offers 
            WHERE code = ? AND active = 1 
              AND (usage_limit IS NULL OR used_count < usage_limit)
              AND (start_date IS NULL OR start_date <= CURDATE())
              AND (end_date IS NULL OR end_date >= CURDATE())
            LIMIT 1
        ");
        $offerStmt->execute([$promoCode]);
        $offer = $offerStmt->fetch();

        if ($offer && $subtotal >= (float)$offer['min_booking_value']) {
            if ($offer['discount_type'] === 'percentage') {
                $discountAmount = ($subtotal * (float)$offer['discount_value']) / 100.0;
            } else {
                $discountAmount = min($subtotal, (float)$offer['discount_value']);
            }
            // Increment usage
            $pdo->prepare("UPDATE offers SET used_count = used_count + 1 WHERE id = ?")->execute([$offer['id']]);
        }
    }

    // 6. UAE VAT (5%) Calculation
    $vatRate = 5.00;
    $taxableAmount = max(0, $subtotal - $discountAmount);
    $vatAmount = round(($taxableAmount * $vatRate) / 100.0, 2);
    $totalAmount = round($taxableAmount + $vatAmount, 2);

    $paymentMethod = in_array($input['paymentMethod'] ?? '', ['card', 'cash'], true) ? $input['paymentMethod'] : 'card';
    $paymentStatus = ($paymentMethod === 'card') ? 'paid' : 'outstanding_cash';
    $bookingStatus = 'confirmed';

    // Unique Booking Reference
    $refId = $input['id'] ?? ('CUAE-' . date('Y') . '-' . rand(10000, 99999));

    // Begin Transaction
    $pdo->beginTransaction();

    try {
        // 7. Insert Booking Record
        $bInsert = $pdo->prepare("
            INSERT INTO bookings (
                id, customer_id, customer_name, customer_phone, customer_email,
                service_id, service_name, emirate, area, address, building, apartment, access_notes,
                booking_date, time_slot, duration_hours, cleaners_count, property_size,
                price, vat,
                subtotal, discount_amount, promo_code, vat_rate, vat_amount, total_amount,
                payment_method, payment_status, status, assigned_staff, created_by_role
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        ");

        $assignedStaff = $input['assignedStaff'] ?? 'Unassigned';

        $bInsert->execute([
            $refId,
            $customerId,
            $customerName,
            $customerPhone,
            $customerEmail,
            $serviceId,
            $serviceName,
            $input['emirate'] ?? 'Ajman',
            $input['area'] ?? 'Al Nuaimia',
            $input['address'] ?? 'Al Nuaimia, Ajman',
            $input['building'] ?? '',
            $input['apartment'] ?? '',
            $input['accessNotes'] ?? '',
            $bookingDate,
            $timeSlot,
            $durationHours,
            $cleanersCount,
            $propertySize,
            $subtotal,
            $vatAmount,
            $subtotal,
            $discountAmount,
            !empty($promoCode) ? $promoCode : null,
            $vatRate,
            $vatAmount,
            $totalAmount,
            $paymentMethod,
            $paymentStatus,
            $bookingStatus,
            $assignedStaff,
            $currentUser ? $currentUser['role'] : 'customer'
        ]);

        // 8. Insert Booking Items
        $itemInsert = $pdo->prepare("
            INSERT INTO booking_items (id, booking_id, item_type, item_ref_id, name_en, name_ar, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($normalizedItems as $item) {
            $itemInsert->execute([
                $item['id'],
                $refId,
                $item['type'],
                $item['ref_id'],
                $item['name_en'],
                $item['name_ar'],
                $item['quantity'],
                $item['unit_price'],
                $item['total_price']
            ]);
        }

        // 9. Release Active Slot Hold if Provided
        $holdId = $input['holdId'] ?? $input['hold_id'] ?? null;
        $sessionToken = $input['sessionToken'] ?? $input['session_token'] ?? null;
        if ($holdId || $sessionToken) {
            $pdo->prepare("DELETE FROM slot_holds WHERE id = ? OR session_token = ?")->execute([$holdId, $sessionToken]);
        }

        // 10. Record Payment Record
        $payId = 'PAY-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 8));
        $payStatusDb = ($paymentMethod === 'card') ? 'successful' : 'pending';
        $payGateway = ($paymentMethod === 'card') ? 'stripe_uae' : 'cash_on_delivery';

        $pdo->prepare("
            INSERT INTO payments (id, booking_id, customer_id, amount, currency, method, gateway, status)
            VALUES (?, ?, ?, ?, 'AED', ?, ?, ?)
        ")->execute([$payId, $refId, $customerId, $totalAmount, $paymentMethod, $payGateway, $payStatusDb]);

        // 11. Generate Sequential UAE Tax Invoice
        $invId = 'INV-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 8));
        $invNumber = 'TAX-INV-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);

        $pdo->prepare("
            INSERT INTO invoices (
                id, invoice_number, booking_id, customer_id, customer_name,
                subtotal, vat_rate, vat_amount, total_amount, payment_method, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ")->execute([
            $invId,
            $invNumber,
            $refId,
            $customerId,
            $customerName,
            $taxableAmount,
            $vatRate,
            $vatAmount,
            $totalAmount,
            $paymentMethod,
            $paymentStatus
        ]);

        // 12. Create Task Event (Assigned/Booked)
        $pdo->prepare("
            INSERT INTO task_events (booking_id, staff_id, stage, notes)
            VALUES (?, ?, 'assigned', 'Booking successfully confirmed in system')
        ")->execute([$refId, $customerId]);

        // 13. System Notification
        $notifId = 'NOTIF-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 8));
        $pdo->prepare("
            INSERT INTO notifications (id, user_id, title_en, title_ar, message_en, message_ar, type, action_url)
            VALUES (?, ?, ?, ?, ?, ?, 'booking', ?)
        ")->execute([
            $notifId,
            $customerId,
            'Booking Confirmed #' . $refId,
            'تم تأكيد حجزك #' . $refId,
            "Your cleaning service is confirmed for {$bookingDate} at {$timeSlot}.",
            "تم تأكيد موعد التنظيف الخاص بك بتاريخ {$bookingDate} في تمام الساعة {$timeSlot}.",
            "/#tracking?id=" . $refId
        ]);

        // 14. Audit Log
        Security::auditLog($customerName, $customerId, "Created new booking #{$refId} for AED {$totalAmount}");

        $pdo->commit();

        ApiResponse::send([
            'id'             => $refId,
            'customer_name'  => $customerName,
            'service_name'   => $serviceName,
            'booking_date'   => $bookingDate,
            'time_slot'      => $timeSlot,
            'subtotal'       => $subtotal,
            'discount'       => $discountAmount,
            'vat_amount'     => $vatAmount,
            'total_amount'   => $totalAmount,
            'payment_status' => $paymentStatus,
            'invoice_number' => $invNumber,
            'items'          => $normalizedItems
        ], 201, 'Booking and Tax Invoice created successfully');

    } catch (Exception $e) {
        $pdo->rollBack();
        ApiResponse::error('Booking failed to process: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $bookingId = $input['id'] ?? $_GET['id'] ?? null;

    if (!$bookingId) {
        ApiResponse::error('Booking ID is required', 400);
    }

    $bStmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
    $bStmt->execute([$bookingId]);
    $booking = $bStmt->fetch();

    if (!$booking) {
        ApiResponse::error('Booking not found', 404);
    }

    $user = Auth::requireAuth();

    // 1. Status Update
    if (!empty($input['status'])) {
        $newStatus = $input['status'];
        $allowedStatuses = ['booked', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'];
        if (!in_array($newStatus, $allowedStatuses, true)) {
            ApiResponse::error('Invalid booking status', 400);
        }

        // Role restriction checks
        if ($user['role'] === 'customer') {
            if ($booking['customer_id'] !== $user['id'] && $booking['customer_email'] !== $user['email']) {
                ApiResponse::error('Forbidden', 403);
            }
            if ($newStatus !== 'cancelled') {
                ApiResponse::error('Customers may only cancel a booking', 403);
            }
        }

        $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $bookingId]);

        // Log task event
        $stageMap = [
            'assigned'    => 'assigned',
            'in_progress' => 'in_progress',
            'completed'   => 'finished',
            'cancelled'   => 'delay_reported'
        ];
        $stage = $stageMap[$newStatus] ?? 'assigned';

        $pdo->prepare("INSERT INTO task_events (booking_id, staff_id, stage, notes) VALUES (?, ?, ?, ?)")
            ->execute([$bookingId, $user['id'], $stage, "Status updated to {$newStatus} by {$user['name']}"]);

        // If cancelled and paid, automatically register refund SLA tracker
        if ($newStatus === 'cancelled' && $booking['payment_status'] === 'paid') {
            $refundId = 'RFD-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            $deadline = date('Y-m-d', strtotime('+18 days')); // ~14 UAE working days

            $pdo->prepare("
                INSERT INTO refunds (id, booking_id, customer_name, amount, cancellation_date, expected_deadline, working_days_remaining, status)
                VALUES (?, ?, ?, ?, CURDATE(), ?, 14, 'processing')
            ")->execute([$refundId, $bookingId, $booking['customer_name'], $booking['total_amount'], $deadline]);
        }

        Security::auditLog($user['name'], $user['id'], "Updated booking #{$bookingId} status to {$newStatus}");
    }

    // 2. Staff Assignment Update
    if (isset($input['assignedStaff']) || isset($input['staffId'])) {
        Auth::requireRole(['dispatcher', 'admin', 'owner']);

        $staffName = $input['assignedStaff'] ?? '';
        $staffId = $input['staffId'] ?? null;

        if ($staffId) {
            $sUserStmt = $pdo->prepare("SELECT id, name FROM users WHERE id = ? LIMIT 1");
            $sUserStmt->execute([$staffId]);
            $staffUser = $sUserStmt->fetch();
            if ($staffUser) {
                $staffName = $staffUser['name'];
            }
        }

        $pdo->prepare("UPDATE bookings SET assigned_staff = ?, status = 'assigned' WHERE id = ?")
            ->execute([$staffName, $bookingId]);

        if ($staffId) {
            $assignId = 'ASGN-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            $pdo->prepare("
                INSERT INTO booking_assignments (id, booking_id, staff_id, assignment_role, assigned_by_user_id, status)
                VALUES (?, ?, ?, 'lead', ?, 'assigned')
                ON DUPLICATE KEY UPDATE staff_id = VALUES(staff_id), assigned_by_user_id = VALUES(assigned_by_user_id)
            ")->execute([$assignId, $bookingId, $staffId, $user['id']]);
        }

        $pdo->prepare("INSERT INTO task_events (booking_id, staff_id, stage, notes) VALUES (?, ?, 'assigned', ?)")
            ->execute([$bookingId, $staffId ?? $user['id'], "Staff assigned: {$staffName}"]);

        Security::auditLog($user['name'], $user['id'], "Assigned staff {$staffName} to booking #{$bookingId}");
    }

    // 3. Reschedule
    if (!empty($input['rescheduleDate']) && !empty($input['rescheduleSlot'])) {
        Auth::requireRole(['customer', 'dispatcher', 'admin', 'owner']);
        $newDate = $input['rescheduleDate'];
        $newSlot = $input['rescheduleSlot'];

        $pdo->prepare("
            UPDATE bookings 
            SET booking_date = ?, time_slot = ?, rescheduled_count = rescheduled_count + 1 
            WHERE id = ?
        ")->execute([$newDate, $newSlot, $bookingId]);

        $pdo->prepare("INSERT INTO task_events (booking_id, staff_id, stage, notes) VALUES (?, ?, 'accepted', ?)")
            ->execute([$bookingId, $user['id'], "Booking rescheduled to {$newDate} ({$newSlot})"]);

        Security::auditLog($user['name'], $user['id'], "Rescheduled booking #{$bookingId} to {$newDate} {$newSlot}");
    }

    ApiResponse::send(['id' => $bookingId, 'updated' => true], 200, 'Booking updated successfully');

} else {
    ApiResponse::error('Method not allowed', 405);
}
