<?php
/**
 * Clean UAE (تنظيف الفخامة) — PDO Database Connection Singleton
 * Uses .env configuration with secure connection options & exception masking
 */

require_once __DIR__ . '/env.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host    = Env::get('DB_HOST', '127.0.0.1');
            $port    = Env::get('DB_PORT', '3306');
            $db      = Env::get('DB_NAME', 'cleanuae_db');
            $user    = Env::get('DB_USER', 'root');
            $pass    = Env::get('DB_PASS', '');
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Log internally without exposing credentials to caller
                $logDir = __DIR__ . '/../../uploads/logs';
                if (!is_dir($logDir)) {
                    @mkdir($logDir, 0750, true);
                }
                @file_put_contents(
                    "$logDir/db_errors.log",
                    "[" . date('Y-m-d H:i:s') . "] Connection failed: " . $e->getMessage() . "\n",
                    FILE_APPEND
                );

                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                
                $isDebug = filter_var(Env::get('APP_DEBUG', false), FILTER_VALIDATE_BOOLEAN);
                echo json_encode([
                    'status' => 500,
                    'success' => false,
                    'message' => $isDebug 
                        ? 'Database connection failed: ' . $e->getMessage() 
                        : 'Database service is temporarily unavailable. Please try again later.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
        return self::$instance;
    }
}
