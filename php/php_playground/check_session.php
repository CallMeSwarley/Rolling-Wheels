<?php
// ------------------------
// Secure session setup (must match login.php)
// ------------------------
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
           || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure',   $isHttps ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path',     '/');

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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
header('Content-Type: application/json');

if (!empty($_SESSION['loggedin'])) {
    echo json_encode([
        "loggedin" => true,
        "username" => $_SESSION['username'],
        "roles" => $_SESSION['roles'] ?? []
    ]);
} else {
    http_response_code(401);
    echo json_encode(["loggedin" => false]);
}