<?php
session_start();

// --- CORS HEADERS ---
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

// --- READ JSON INPUT ---
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$calendarfilePath = __DIR__ . '/calendar_data.json';
$eintrittfilePath = __DIR__ . '/../../rolling-wheels.net/data/pages/eintritt.xml';

// Log received action
error_log("Received action: " . $action);

// Read-only actions, does not require admin auth
if ($action === 'read_calendar') {
    if (file_exists($calendarfilePath)) {
        $content = file_get_contents($calendarfilePath);
        echo json_encode(['success' => true, 'content' => $content]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found']);
    }
    exit;
} elseif ($action === 'read_eintritt') {
    if (file_exists($eintrittfilePath)) {
        $content = file_get_contents($eintrittfilePath);
        echo json_encode(['success' => true, 'content' => $content]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found']);
    }
    exit;
}

// --- ADMIN AUTH CHECK ---
// For demo: you can replace this with your real auth system
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

// write actions, require admin auth (in future we need a "Platzwart" role for that)
if ($action === 'write_calendar') {
    $newContent = $input['content'] ?? '';
    // Prevent PHP code injection attempts
    if (stripos($newContent, '<?php') !== false || stripos($newContent, '<?=') !== false) {
        echo json_encode(['success' => false, 'error' => 'Invalid content']);
        exit;
    }

    // Validate JSON structure
    $data = json_decode($newContent, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON format']);
        exit;
    }

    // Validate structure: must have openingHours array
    if (!isset($data['openingHours']) || !is_array($data['openingHours'])) {
        echo json_encode(['success' => false, 'error' => 'Missing or invalid openingHours array']);
        exit;
    }

    // Validate each opening hour entry
    foreach ($data['openingHours'] as $index => $hour) {
        if (!isset($hour['open']) || !isset($hour['close']) || !isset($hour['date'])) {
            echo json_encode(['success' => false, 'error' => "Invalid entry at index $index: missing required fields (open, close, date)"]);
            exit;
        }

        // Validate time format (HH:MM)
        if (
            !preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $hour['open']) ||
            !preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $hour['close'])
        ) {
            echo json_encode(['success' => false, 'error' => "Invalid entry at index $index: time must be in HH:MM format"]);
            exit;
        }

        // Validate date format (dd-mm-yyyy)
        if (!preg_match('/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/', $hour['date'])) {
            echo json_encode(['success' => false, 'error' => "Invalid entry at index $index: date must be in dd-mm-yyyy format"]);
            exit;
        }
    }

    // All validations passed, write the file
    if (file_put_contents($calendarfilePath, $newContent) !== false) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Could not write file']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>