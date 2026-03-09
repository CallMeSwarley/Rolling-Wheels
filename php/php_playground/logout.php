<?php
// --- CORS: support dev (localhost:3000) and production domains ---
$allowedOrigins = [
    'http://localhost:3000',
    'https://rolling-wheels.net',
    'https://www.rolling-wheels.net',
    'http://rumprobiert.rolling-wheels.net',
    'https://rumprobiert.rolling-wheels.net',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request without starting a session
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
           || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure',   $isHttps ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path',     '/');
session_start();
// Capture user info before clearing session for debugging
$username = $_SESSION['username'] ?? null;
$roles    = $_SESSION['roles'] ?? [];
$was_logged_in = $_SESSION['loggedin'];

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
echo json_encode(["success" => true, "username" => $username, "roles" => $roles, "was_logged_in" => $was_logged_in]);
exit;
?>