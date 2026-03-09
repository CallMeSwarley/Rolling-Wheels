<?php
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
           || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure',   $isHttps ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path',     '/');
session_start();

// CORS — allow dev (localhost:3000) and production domain
$allowedOrigins = [
    'http://localhost:3000',
    'https://rolling-wheels.net',
    'https://www.rolling-wheels.net',
    'https://rumprobiert.rolling-wheels.net',
    'http://rumprobiert.rolling-wheels.net',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Unset all session variables
$_SESSION = [];

// Destroy the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Return JSON response
header('Content-Type: application/json');
echo json_encode(["success" => true]);
exit;
?>