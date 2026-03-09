<?php
header('Access-Control-Allow-Origin: http://localhost:3000'); // comment out in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// ------------------------
// Handle OPTIONS preflight
// ------------------------
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
ini_set('session.cookie_secure', $isHttps ? '1' : '0');
ini_set('session.cookie_samesite', value: 'Lax');
ini_set('session.cookie_path', '/');
ini_set('session.cookie_httponly', 1);  // Prevent JS access to cookie
session_start();
