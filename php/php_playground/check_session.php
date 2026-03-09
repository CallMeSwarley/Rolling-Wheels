<?php
session_start();
header('Content-Type: application/json');

if (!empty($_SESSION['loggedin'])) {
    echo json_encode([
        "loggedin" => true,
        "test" => $_SESSION['loggedin'],
        "username" => $_SESSION['username'],
        "roles" => $_SESSION['roles'] ?? []
    ]);
} else {
    http_response_code(401);
    echo json_encode(["loggedin" => false]);
}