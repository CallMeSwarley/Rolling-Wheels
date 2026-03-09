<?php
session_start();

// --- CORS — allow dev (localhost:3000) and production domain ---
header('Access-Control-Allow-Origin: http://localhost:3000'); // comment out in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
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