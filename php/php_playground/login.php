<?php
// ------------------------
// Secure session setup
// ------------------------
ini_set('session.cookie_httponly', 1);  // Prevent JS access to cookie
// ini_set('session.cookie_secure', 1); // Uncomment once HTTPS is active
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
        $username = (string)$u->username;
        $hash     = (string)$u->password;

        if ($inputUser === $username && password_verify($inputPass, $hash)) {

            // Collect roles
            $roles = [];
            foreach ($u->role as $r) {
                $roles[] = (string)$r;
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
