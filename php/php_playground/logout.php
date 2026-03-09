<?php
require_once __DIR__ . '/bootstrap.php';

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