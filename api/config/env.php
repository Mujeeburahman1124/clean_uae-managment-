<?php
/**
 * Clean UAE (تنظيف الفخامة) — Environment Loader Helper
 * Safely loads key-value pairs from .env into $_ENV and getenv()
 */

class Env {
    private static bool $loaded = false;

    public static function load(string $path = __DIR__ . '/../../.env'): void {
        if (self::$loaded) return;

        if (!file_exists($path)) {
            // Check if .env.example exists as a fallback
            $examplePath = __DIR__ . '/../../.env.example';
            if (file_exists($examplePath)) {
                $path = $examplePath;
            } else {
                return;
            }
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            // Skip comments and empty lines
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }

            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $val = trim($parts[1]);

                // Remove surrounding quotes if present
                if (
                    (str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                    (str_starts_with($val, "'") && str_ends_with($val, "'"))
                ) {
                    $val = substr($val, 1, -1);
                }

                $_ENV[$key] = $val;
                putenv("$key=$val");
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, $default = null) {
        self::load();
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
}
