<?php
/**
 * Clean UAE (تنظيف الفخامة) — Sequential UAE VAT Tax Invoices Engine
 * Generates and presents FTA-compliant Tax Invoices with TRN, line itemization, 5% UAE VAT, and printable view.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/auth.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Clean UAE Official FTA Tax Entity Data
define('COMPANY_NAME_EN', 'Clean UAE Luxury Cleaning Services LLC');
define('COMPANY_NAME_AR', 'شركة تنظيف الفخامة لخدمات التنظيف ذ.م.م');
define('COMPANY_TRN', '100482910400003');
define('COMPANY_ADDRESS_EN', 'Office 402, Al Nuaimia One Tower, Sheikh Khalifa Bin Zayed St, Ajman, UAE');
define('COMPANY_ADDRESS_AR', 'مكتب 402، برج النعيمية ون، شارع الشيخ خليفة بن زايد، عجمان، الإمارات العربية المتحدة');
define('COMPANY_PHONE', '+971 6 741 0000');
define('COMPANY_EMAIL', 'billing@cleanuae.ae');

if ($method === 'GET') {
    $invoiceId = $_GET['id'] ?? null;
    $invoiceNumber = $_GET['invoice_number'] ?? null;
    $bookingId = $_GET['booking_id'] ?? null;
    $format = strtolower($_GET['format'] ?? 'json');

    if ($invoiceId || $invoiceNumber || $bookingId) {
        $query = "SELECT * FROM invoices WHERE ";
        $param = '';
        if ($invoiceId) {
            $query .= "id = ?";
            $param = $invoiceId;
        } elseif ($invoiceNumber) {
            $query .= "invoice_number = ?";
            $param = $invoiceNumber;
        } else {
            $query .= "booking_id = ?";
            $param = $bookingId;
        }
        $query .= " LIMIT 1";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$param]);
        $invoice = $stmt->fetch();

        if (!$invoice) {
            ApiResponse::error('Invoice not found', 404);
        }

        // Fetch booking & booking items
        $bStmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $bStmt->execute([$invoice['booking_id']]);
        $booking = $bStmt->fetch();

        $itemsStmt = $pdo->prepare("SELECT * FROM booking_items WHERE booking_id = ?");
        $itemsStmt->execute([$invoice['booking_id']]);
        $items = $itemsStmt->fetchAll();

        // RBAC Check: If customer, can only view own invoices
        $currentUser = Auth::user();
        if ($currentUser && $currentUser['role'] === 'customer') {
            if ($invoice['customer_id'] && $invoice['customer_id'] !== $currentUser['id']) {
                ApiResponse::error('Forbidden. Cannot access invoices of another customer.', 403);
            }
        }

        // If printable HTML requested
        if ($format === 'html') {
            renderPrintableInvoice($invoice, $booking, $items);
            exit;
        }

        ApiResponse::send([
            'invoice'       => $invoice,
            'booking'       => $booking,
            'items'         => $items,
            'tax_authority' => [
                'trn'              => COMPANY_TRN,
                'company_name_en'  => COMPANY_NAME_EN,
                'company_name_ar'  => COMPANY_NAME_AR,
                'company_address'  => COMPANY_ADDRESS_EN,
                'vat_rate_percent' => 5.00
            ]
        ], 200, 'Invoice details fetched');
    }

    // List invoices
    $user = Auth::requireAuth();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    if ($user['role'] === 'customer') {
        $stmt = $pdo->prepare("SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $user['id'], PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        // Staff/Dispatcher/Admin/Owner
        $stmt = $pdo->prepare("SELECT * FROM invoices ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
    }

    $invoices = $stmt->fetchAll();
    ApiResponse::send($invoices, 200, 'Invoices list fetched');

} else {
    ApiResponse::error('Method not allowed', 405);
}

/**
 * Render FTA-compliant bilingual tax invoice HTML template
 */
function renderPrintableInvoice(array $inv, ?array $booking, array $items): void {
    header('Content-Type: text/html; charset=UTF-8');
    $subtotal = number_format((float)$inv['subtotal'], 2);
    $vat = number_format((float)$inv['vat_amount'], 2);
    $total = number_format((float)$inv['total_amount'], 2);
    $invNum = htmlspecialchars($inv['invoice_number']);
    $date = date('d M Y', strtotime($inv['created_at']));
    $customerName = htmlspecialchars($inv['customer_name']);
    $bookingId = htmlspecialchars($inv['booking_id']);
    $payMethod = strtoupper($inv['payment_method']);
    $payStatus = strtoupper($inv['payment_status']);
    $address = htmlspecialchars(($booking['address'] ?? '') . ', ' . ($booking['area'] ?? 'Ajman') . ', ' . ($booking['emirate'] ?? 'Ajman'));

    ?>
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
        <meta charset="UTF-8">
        <title>Tax Invoice - <?= $invNum ?> | Clean UAE</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Outfit', 'Noto Kufi Arabic', sans-serif; background: #0f172a; color: #1e293b; padding: 30px 15px; }
            .invoice-wrapper { max-width: 840px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); }
            .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px; }
            .brand-col h1 { font-size: 24px; color: #0284c7; font-weight: 700; letter-spacing: -0.5px; }
            .brand-col h2 { font-size: 16px; color: #0369a1; font-weight: 600; margin-top: 4px; }
            .brand-col p { font-size: 13px; color: #64748b; margin-top: 6px; line-height: 1.5; }
            .trn-badge { display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #166534; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin-top: 8px; }
            .inv-meta { text-align: right; }
            .inv-title { font-size: 22px; font-weight: 700; color: #0f172a; text-transform: uppercase; }
            .inv-title-ar { font-size: 15px; color: #475569; margin-top: 2px; }
            .meta-item { margin-top: 8px; font-size: 13px; color: #475569; }
            .meta-item strong { color: #0f172a; font-size: 14px; }
            .parties-row { display: flex; justify-content: space-between; gap: 20px; background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .party-col { flex: 1; font-size: 13px; line-height: 1.6; }
            .party-col h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
            .party-col strong { font-size: 15px; color: #0f172a; display: block; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            td { padding: 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-container { display: flex; justify-content: flex-end; margin-bottom: 32px; }
            .totals-table { width: 320px; }
            .totals-table td { padding: 8px 12px; font-size: 14px; }
            .totals-table tr.grand-total td { font-size: 18px; font-weight: 700; color: #0284c7; border-top: 2px solid #0284c7; border-bottom: none; }
            .status-pill { display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: 700; border-radius: 20px; text-transform: uppercase; }
            .status-paid { background: #dcfce7; color: #15803d; }
            .status-cash { background: #fef3c7; color: #b45309; }
            .footer-notes { border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.8; }
            .print-btn { background: #0284c7; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 20px; transition: 0.2s; }
            .print-btn:hover { background: #0369a1; }
            @media print {
                body { background: #fff; padding: 0; }
                .invoice-wrapper { box-shadow: none; border-radius: 0; padding: 0; }
                .print-bar { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="print-bar" style="max-width: 840px; margin: 0 auto 16px; text-align: right;">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF (طباعة الفاتورة)</button>
        </div>
        <div class="invoice-wrapper">
            <div class="header-row">
                <div class="brand-col">
                    <h1><?= COMPANY_NAME_EN ?></h1>
                    <h2><?= COMPANY_NAME_AR ?></h2>
                    <p><?= COMPANY_ADDRESS_EN ?><br><?= COMPANY_PHONE ?> | <?= COMPANY_EMAIL ?></p>
                    <div class="trn-badge">TRN: <?= COMPANY_TRN ?></div>
                </div>
                <div class="inv-meta">
                    <div class="inv-title">TAX INVOICE</div>
                    <div class="inv-title-ar">فاتورة ضريبية</div>
                    <div class="meta-item"><strong><?= $invNum ?></strong></div>
                    <div class="meta-item">Date: <?= $date ?></div>
                    <div class="meta-item">Booking Ref: #<?= $bookingId ?></div>
                </div>
            </div>

            <div class="parties-row">
                <div class="party-col">
                    <h4>Billed To / العميل</h4>
                    <strong><?= $customerName ?></strong>
                    <p>Phone: <?= htmlspecialchars($booking['customer_phone'] ?? 'N/A') ?></p>
                    <p>Location: <?= $address ?></p>
                </div>
                <div class="party-col" style="text-align: right;">
                    <h4>Payment Information / معلومات الدفع</h4>
                    <p>Method: <strong><?= $payMethod ?></strong></p>
                    <p style="margin-top: 6px;">Status: 
                        <span class="status-pill <?= $payStatus === 'PAID' ? 'status-paid' : 'status-cash' ?>">
                            <?= $payStatus === 'PAID' ? 'PAID / مدفوعة' : 'OUTSTANDING CASH' ?>
                        </span>
                    </p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Item & Description / الوصف</th>
                        <th class="text-center">Qty / الكمية</th>
                        <th class="text-right">Unit Price (AED)</th>
                        <th class="text-right">Tax (5% VAT)</th>
                        <th class="text-right">Total (AED)</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($items)): ?>
                        <?php foreach ($items as $item): ?>
                            <?php 
                                $iSubtotal = (float)$item['total_price'];
                                $iVat = $iSubtotal * 0.05;
                                $iGross = $iSubtotal + $iVat;
                            ?>
                            <tr>
                                <td>
                                    <strong><?= htmlspecialchars($item['name_en']) ?></strong>
                                    <div style="font-size: 12px; color: #64748b;"><?= htmlspecialchars($item['name_ar']) ?> (<?= htmlspecialchars($item['item_type']) ?>)</div>
                                </td>
                                <td class="text-center"><?= (int)$item['quantity'] ?></td>
                                <td class="text-right"><?= number_format((float)$item['unit_price'], 2) ?></td>
                                <td class="text-right"><?= number_format($iVat, 2) ?></td>
                                <td class="text-right"><strong><?= number_format($iGross, 2) ?></strong></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td>
                                <strong><?= htmlspecialchars($booking['service_name'] ?? 'Premium Cleaning Service') ?></strong>
                                <div style="font-size: 12px; color: #64748b;"><?= htmlspecialchars($booking['time_slot'] ?? '') ?> | <?= (int)($booking['cleaners_count'] ?? 1) ?> Cleaner(s)</div>
                            </td>
                            <td class="text-center">1</td>
                            <td class="text-right"><?= $subtotal ?></td>
                            <td class="text-right"><?= $vat ?></td>
                            <td class="text-right"><strong><?= $total ?></strong></td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>

            <div class="totals-container">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal (Excl. VAT):</td>
                        <td class="text-right">AED <?= $subtotal ?></td>
                    </tr>
                    <tr>
                        <td>UAE VAT (5.00%):</td>
                        <td class="text-right">AED <?= $vat ?></td>
                    </tr>
                    <tr class="grand-total">
                        <td>Total Amount Payable:</td>
                        <td class="text-right">AED <?= $total ?></td>
                    </tr>
                </table>
            </div>

            <div class="footer-notes">
                <p>This is a computer-generated Tax Invoice issued in compliance with UAE Federal Tax Authority (FTA) regulations.</p>
                <p>هذه فاتورة ضريبية رسمية صادرة إلكترونياً ومتوافقة مع متطلبات الهيئة الاتحادية للضرائب بدولة الإمارات العربية المتحدة.</p>
                <p style="margin-top: 8px; font-weight: 600; color: #0284c7;">Clean UAE — Ajman & UAE-wide Premium Cleaning Operations</p>
            </div>
        </div>
    </body>
    </html>
    <?php
}
