<?php
/**
 * Clean UAE (تنظيف الفخامة) — Authentication & RBAC Middleware
 * Validates session tokens from Authorization Bearer or X-Session-Token header.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/env.php';

class Auth {
    private static ?array $currentUser = null;

    public static function getTokenFromHeaders(): ?string {
        $headers = [];
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        }
        if (empty($headers)) {
            foreach ($_SERVER as $name => $value) {
                if (str_starts_with($name, 'HTTP_')) {
                    $headerName = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                    $headers[$headerName] = $value;
                }
            }
        }

        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }

        return $headers['X-Session-Token'] ?? $headers['x-session-token'] ?? $_SERVER['HTTP_X_SESSION_TOKEN'] ?? null;
    }

    public static function user(): ?array {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        $token = self::getTokenFromHeaders();
        if (!$token || strlen($token) < 16) {
            return null;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, name, email, phone, role, staff_role, referral_code, referral_balance, active_status 
            FROM users 
            WHERE auth_token = ? AND active_status = 1 
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if ($user) {
            // Fetch permissions for user's role
            $permStmt = $pdo->prepare("
                SELECT p.id FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ?
            ");
            $permStmt->execute([$user['role']]);
            $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

            self::$currentUser = $user;
            return $user;
        }

        return null;
    }

    public static function check(): bool {
        return self::user() !== null;
    }

    public static function id(): ?string {
        $u = self::user();
        return $u['id'] ?? null;
    }

    public static function role(): ?string {
        $u = self::user();
        return $u['role'] ?? null;
    }

    public static function hasRole(array|string $roles): bool {
        $u = self::user();
        if (!$u) return false;
        if ($u['role'] === 'owner') return true;
        $allowed = is_array($roles) ? $roles : [$roles];
        return in_array($u['role'], $allowed, true);
    }

    public static function hasPermission(string $permission): bool {
        $u = self::user();
        if (!$u) return false;
        if ($u['role'] === 'owner') return true;
        return in_array($permission, $u['permissions'] ?? [], true);
    }

    public static function requireAuth(): array {
        $user = self::user();
        if (!$user) {
            ApiResponse::error('Unauthorized. Authentication token required or session expired.', 401);
        }
        return $user;
    }

    public static function requireRole(array|string $roles): array {
        $user = self::requireAuth();
        $allowed = is_array($roles) ? $roles : [$roles];

        // Owner has superadmin override
        if ($user['role'] === 'owner') {
            return $user;
        }

        if (!in_array($user['role'], $allowed, true)) {
            ApiResponse::error('Forbidden. Insufficient permissions for role: ' . $user['role'], 403);
        }

        return $user;
    }

    public static function requirePermission(string $permission): array {
        $user = self::requireAuth();

        if ($user['role'] === 'owner' || in_array($permission, $user['permissions'] ?? [], true)) {
            return $user;
        }

        ApiResponse::error('Forbidden. Missing permission: ' . $permission, 403);
    }
}
