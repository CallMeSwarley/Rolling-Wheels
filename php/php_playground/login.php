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
    if ($login_successful) {
        // If it's a JSON request (API)
        if (!empty($input)) {
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "username" => $_SESSION['username'],
                "roles" => $_SESSION['roles']
            ]);
            exit;
        }

        // Otherwise, redirect for normal form login
        header("Location: hello.php");
        exit;
    } else {
        $error = "Invalid username or password.";

        // JSON response for API
        if (!empty($input)) {
            header('Content-Type: application/json', true, 401);
            echo json_encode(["error" => $error]);
            exit;
        }
    }
}
?>

<!-- ------------------------
     HTML login form
     ------------------------ -->
<?php if (empty($_SERVER['HTTP_X_REQUESTED_WITH'])): ?>
<form method="POST">
    <input type="text" name="username" placeholder="Username" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <button type="submit">Login</button>
</form>

<?php if (!empty($error)): ?>
<p style="color:red;"><?php echo htmlspecialchars($error); ?></p>
<?php endif; ?>
<?php endif; ?>
