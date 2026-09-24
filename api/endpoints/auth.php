<?php
/**
 * Clean UAE (تنظيف الفخامة) — Authentication REST API Controller
 * Supports Email OTP login/verification, Password authentication, Customer registration, and Session checks with IP rate limiting and audit logging.
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../config/env.php';

Security::validateCORS();

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$clientIp = Security::getClientIp();

// Read JSON input body
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

switch ($action) {

    // 1. Send Email OTP (6-Digit Code)
    case 'send_email_otp':
        if ($method !== 'POST') {
            ApiResponse::error('POST method required', 405);
        }

        // IP Rate Limiting: Max 5 OTP requests per 5 minutes
        $rateCheck = Security::checkRateLimit("otp_send:$clientIp", 5, 300);
        if (!$rateCheck['allowed']) {
            ApiResponse::error("Too many OTP requests from your IP. Please try again in {$rateCheck['retry_after']} seconds.", 429);
        }

        $email = strtolower(trim($input['email'] ?? ''));
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ApiResponse::error('Please provide a valid email address.', 422);
        }

        // Check if user exists or initialize new customer
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Rate limiting check: check if account locked
        if ($user && !empty($user['locked_until']) && strtotime($user['locked_until']) > time()) {
            $remaining = ceil((strtotime($user['locked_until']) - time()) / 60);
            ApiResponse::error("Account temporarily locked due to failed attempts. Try again in $remaining minutes.", 429);
        }

        // Generate cryptographically secure 6-digit numeric OTP
        $otp = (string) random_int(100000, 999999);
        $otpHash = Security::hashToken($otp);
        $expiryMinutes = (int) Env::get('OTP_EXPIRY_MINUTES', 5);
        $expiresAt = date('Y-m-d H:i:s', time() + ($expiryMinutes * 60));

        if (!$user) {
            // Auto-create prospective customer account
            $userId = 'usr-cust-' . substr(bin2hex(random_bytes(4)), 0, 8);
            $name = explode('@', $email)[0];
            $name = ucwords(str_replace(['.', '_', '-'], ' ', $name));
            $phone = '+971500000000';
            $refCode = 'CUAE-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

            $insertStmt = $pdo->prepare("
                INSERT INTO users (id, name, email, phone, role, referral_code, otp_code_hash, otp_expires_at, failed_attempts)
                VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, 0)
            ");
            $insertStmt->execute([$userId, $name, $email, $phone, $refCode, $otpHash, $expiresAt]);
        } else {
            $updateStmt = $pdo->prepare("
                UPDATE users SET otp_code_hash = ?, otp_expires_at = ?, failed_attempts = 0
                WHERE id = ?
            ");
            $updateStmt->execute([$otpHash, $expiresAt, $user['id']]);
        }

        // Send Email & Log
        $subject = "Your Clean UAE Login Code: $otp";
        $message = "Hello,\n\nYour Clean UAE (تنظيف الفخامة) one-time login verification code is:\n\n   $otp\n\nThis code will expire in $expiryMinutes minutes.\n\nThank you,\nClean UAE Operations Desk";
        $headers = "From: noreply@cleanuae.ae\r\nReply-To: support@cleanuae.ae\r\nX-Mailer: PHP/" . phpversion();

        @mail($email, $subject, $message, $headers);

        $logDir = __DIR__ . '/../../uploads/logs';
        if (!is_dir($logDir)) @mkdir($logDir, 0750, true);
        @file_put_contents("$logDir/otp_emails.log", "[" . date('Y-m-d H:i:s') . "] IP: $clientIp | OTP for $email: $otp\n", FILE_APPEND);

        Security::auditLog($user['name'] ?? $email, $user['id'] ?? null, "Requested email OTP code from IP $clientIp");

        $responseData = [
            'email' => $email,
            'expires_in_minutes' => $expiryMinutes,
            'message' => 'Verification code sent to your email.'
        ];

        // Include dev_otp in development mode for seamless local testing
        if (Env::get('APP_ENV', 'development') === 'development') {
            $responseData['dev_otp'] = $otp;
        }

        ApiResponse::send($responseData, 200, 'Verification code sent successfully.');
        break;

    // 2. Verify Email OTP & Issue Session Token
    case 'verify_email_otp':
        if ($method !== 'POST') {
            ApiResponse::error('POST method required', 405);
        }

        // IP Rate Limiting: Max 10 verification attempts per 5 minutes
        $rateCheck = Security::checkRateLimit("otp_verify:$clientIp", 10, 300);
        if (!$rateCheck['allowed']) {
            ApiResponse::error("Too many OTP verification attempts. Try again in {$rateCheck['retry_after']} seconds.", 429);
        }

        $email = strtolower(trim($input['email'] ?? ''));
        $otp = trim($input['otp'] ?? '');

        if (empty($email) || empty($otp)) {
            ApiResponse::error('Email and 6-digit verification code are required.', 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            ApiResponse::error('User not found. Please request a new code.', 404);
        }

        // Check if locked
        if (!empty($user['locked_until']) && strtotime($user['locked_until']) > time()) {
            ApiResponse::error('Account is temporarily locked. Please try again later.', 429);
        }

        // Verify Expiry
        if (empty($user['otp_expires_at']) || strtotime($user['otp_expires_at']) < time()) {
            ApiResponse::error('Verification code has expired. Please request a new code.', 400);
        }

        // Verify Hash
        $providedHash = Security::hashToken($otp);
        if ($user['otp_code_hash'] !== $providedHash) {
            $attempts = (int)$user['failed_attempts'] + 1;
            $lockSql = $attempts >= 5 ? ", locked_until = '" . date('Y-m-d H:i:s', time() + 900) . "'" : "";
            $pdo->prepare("UPDATE users SET failed_attempts = ?$lockSql WHERE id = ?")->execute([$attempts, $user['id']]);

            Security::auditLog($user['name'], $user['id'], "Failed OTP verification attempt from IP $clientIp");
            ApiResponse::error('Invalid verification code. Please check your email and try again.', 400);
        }

        // OTP Verified Successfully: Issue new secure auth session token
        $token = Security::generateToken(32);
        $updateStmt = $pdo->prepare("
            UPDATE users SET
                auth_token = ?,
                otp_code_hash = NULL,
                otp_expires_at = NULL,
                failed_attempts = 0,
                locked_until = NULL
            WHERE id = ?
        ");
        $updateStmt->execute([$token, $user['id']]);

        // Fetch user permissions
        $permStmt = $pdo->prepare("
            SELECT p.id FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        ");
        $permStmt->execute([$user['role']]);
        $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

        Security::auditLog($user['name'], $user['id'], "Successful login via Email OTP from IP $clientIp");

        ApiResponse::send([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'role' => $user['role'],
                'staff_role' => $user['staff_role'],
                'referral_code' => $user['referral_code'],
                'referral_balance' => (float)$user['referral_balance'],
                'permissions' => $permissions
            ]
        ], 200, 'Login successful via Email OTP.');
        break;

    // 3. Password Login
    case 'login':
        if ($method !== 'POST') {
            ApiResponse::error('POST method required', 405);
        }

        // IP Rate Limiting: Max 10 password login attempts per 5 minutes
        $rateCheck = Security::checkRateLimit("login:$clientIp", 10, 300);
        if (!$rateCheck['allowed']) {
            ApiResponse::error("Too many login attempts from your IP. Please try again in {$rateCheck['retry_after']} seconds.", 429);
        }

        $email = strtolower(trim($input['email'] ?? ''));
        $password = (string)($input['password'] ?? '');

        if (empty($email) || empty($password)) {
            ApiResponse::error('Email and password are required.', 422);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND active_status = 1 LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Check locked
        if ($user && !empty($user['locked_until']) && strtotime($user['locked_until']) > time()) {
            $remaining = ceil((strtotime($user['locked_until']) - time()) / 60);
            ApiResponse::error("Account temporarily locked. Try again in $remaining minutes.", 429);
        }

        if (!$user || empty($user['password_hash']) || !Security::verifyPassword($password, $user['password_hash'])) {
            if ($user) {
                $attempts = (int)$user['failed_attempts'] + 1;
                $lockSql = $attempts >= 5 ? ", locked_until = '" . date('Y-m-d H:i:s', time() + 900) . "'" : "";
                $pdo->prepare("UPDATE users SET failed_attempts = ?$lockSql WHERE id = ?")->execute([$attempts, $user['id']]);
            }
            Security::auditLog($email, $user['id'] ?? null, "Failed password login attempt from IP $clientIp");
            ApiResponse::error('Invalid email or password.', 401);
        }

        // Issue auth token & reset failed attempts
        $token = Security::generateToken(32);
        $pdo->prepare("UPDATE users SET auth_token = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?")->execute([$token, $user['id']]);

        // Permissions
        $permStmt = $pdo->prepare("
            SELECT p.id FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        ");
        $permStmt->execute([$user['role']]);
        $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

        Security::auditLog($user['name'], $user['id'], "Successful password login from IP $clientIp");

        ApiResponse::send([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'role' => $user['role'],
                'staff_role' => $user['staff_role'],
                'referral_code' => $user['referral_code'],
                'referral_balance' => (float)$user['referral_balance'],
                'permissions' => $permissions
            ]
        ], 200, 'Login successful.');
        break;

    // 4. Customer Registration
    case 'register':
        if ($method !== 'POST') {
            ApiResponse::error('POST method required', 405);
        }

        $name = Security::sanitize($input['name'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $phone = Security::sanitize($input['phone'] ?? '');
        $password = (string)($input['password'] ?? '');

        if (empty($name) || empty($email) || empty($phone) || strlen($password) < 6) {
            ApiResponse::error('Please provide name, valid email, phone, and password (min 6 characters).', 422);
        }

        // Check duplicate email
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $checkStmt->execute([$email]);
        if ($checkStmt->fetch()) {
            ApiResponse::error('An account with this email address already exists.', 409);
        }

        $userId = 'usr-cust-' . substr(bin2hex(random_bytes(4)), 0, 8);
        $passwordHash = Security::hashPassword($password);
        $refCode = 'CUAE-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $token = Security::generateToken(32);

        $insertStmt = $pdo->prepare("
            INSERT INTO users (id, name, email, phone, password_hash, auth_token, role, referral_code, referral_balance)
            VALUES (?, ?, ?, ?, ?, ?, 'customer', ?, 0.00)
        ");
        $insertStmt->execute([$userId, $name, $email, $phone, $passwordHash, $token, $refCode]);

        Security::auditLog($name, $userId, "New customer registered from IP $clientIp");

        ApiResponse::send([
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => 'customer',
                'referral_code' => $refCode,
                'referral_balance' => 0.00,
                'permissions' => []
            ]
        ], 201, 'Registration successful. Welcome to Clean UAE!');
        break;

    // 5. Current Authenticated User (Me)
    case 'me':
        $user = Auth::requireAuth();
        ApiResponse::send($user, 200, 'Authenticated user profile.');
        break;

    // 6. Logout
    case 'logout':
        $token = Auth::getTokenFromHeaders();
        if ($token) {
            $pdo->prepare("UPDATE users SET auth_token = NULL WHERE auth_token = ?")->execute([$token]);
        }
        $u = Auth::user();
        if ($u) {
            Security::auditLog($u['name'], $u['id'], "Logged out from IP $clientIp");
        }
        ApiResponse::send(null, 200, 'Logged out successfully.');
        break;

    default:
        ApiResponse::error('Invalid auth action specified.', 400);
        break;
}
