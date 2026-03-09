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

// Handle OPTIONS preflight without starting a session
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// Start session only for real requests (not preflight)
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
           || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443;
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure',   $isHttps ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path',     '/');
session_start();

// ------------------------
// Initialize variables
// ------------------------
$error = '';
$login_successful = false;

// ------------------------
// Handle POST request
// ------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Support JSON input (for React) or form input
    $input = json_decode(file_get_contents('php://input'), true);
    $inputUser = $input['username'] ?? $_POST['username'] ?? '';
    $inputPass = $input['password'] ?? $_POST['password'] ?? '';

    // Load users XML
    $xmlFile = __DIR__ . '/user.xml';
    if (!file_exists($xmlFile)) {
        http_response_code(500);
        echo json_encode(["error" => "User XML file not found."]);
        exit;
    }

    $xml = simplexml_load_file($xmlFile);

    // Loop through users
    foreach ($xml->user as $u) {
        $username = (string) $u->username;
        $hash = (string) $u->password;

        if ($inputUser === $username && password_verify($inputPass, $hash)) {

            // Collect roles
            $roles = [];
            foreach ($u->role as $r) {
                $roles[] = (string) $r;
            }

            // Regenerate session ID & store session data
            session_regenerate_id(true);
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;
            $_SESSION['roles'] = $roles;

            $login_successful = true;
            break;
        }
    }

    // ------------------------
    // Respond based on request type
    // ------------------------
    header('Content-Type: application/json');

    if ($login_successful) {
        echo json_encode([
            "success" => true,
            "username" => $_SESSION['username'],
            "roles" => $_SESSION['roles']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid username or password."]);
    }
    exit;
}

// Only accept POST requests
http_response_code(405);
header('Content-Type: application/json');
echo json_encode(["error" => "Method not allowed. Only POST requests are accepted."]);
exit;
