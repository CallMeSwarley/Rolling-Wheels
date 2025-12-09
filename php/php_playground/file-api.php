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
$rawInput = file_get_contents('php://input');

// Prevent PHP code injection in raw input
if (stripos($rawInput, '<?php') !== false || stripos($rawInput, '<?=') !== false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid content']);
    exit;
}

$input = json_decode($rawInput, true);
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

// --- ADMIN AUTH CHECK --- uncomment when auth system is ready
// For demo: you can replace this with your real auth system
// if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
//     http_response_code(403);
//     echo json_encode(['error' => 'Access denied']);
//     exit;
// }

function insertSlot($filePath, $newSlot, $minDurationMinutes = 120)
{
    // Load existing JSON data
    $jsonData = file_get_contents($filePath);
    $slots = json_decode($jsonData, true);

    if (!$slots) {
        $slots = [];
    }

    // Filter slots for the same date
    $daySlots = array_filter($slots, fn($slot) => $slot['date'] === $newSlot['date']);

    // Convert times to timestamps for comparison
    $newStart = strtotime($newSlot['open']);
    $newEnd = strtotime($newSlot['close']);

    // Check minimum duration
    if (($newEnd - $newStart) / 60 < $minDurationMinutes) {
        return "Error: Slot duration is less than $minDurationMinutes minutes.";
    }

    // Sort day slots by start time
    usort($daySlots, fn($a, $b) => strtotime($a['open']) - strtotime($b['open']));

    // Check for overlaps and gaps
    $prevEnd = null;
    foreach ($daySlots as $slot) {
        $slotStart = strtotime($slot['open']);
        $slotEnd = strtotime($slot['close']);

        // Overlap check
        if ($newStart < $slotEnd && $newEnd > $slotStart) {
            return "Error: Slot overlaps with existing slot from {$slot['open']} to {$slot['close']}.";
        }

        // Gap check: If prevEnd exists, new slot should start exactly at prevEnd
        if ($prevEnd !== null && $newStart !== $prevEnd) {
            return "Error: Slot must start immediately after previous slot at " . date('H:i', $prevEnd) . ".";
        }

        $prevEnd = $slotEnd;
    }

    // Insert in correct chronological order
    $slots[] = $newSlot;
    usort($slots, fn($a, $b) => strtotime($a['date'] . ' ' . $a['open']) - strtotime($b['date'] . ' ' . $b['open']));

    // Save updated JSON
    file_put_contents($filePath, json_encode($slots, JSON_PRETTY_PRINT));

    # should return new slot list
    return $slots;
}

// write actions, require admin auth (in future we need a "Platzwart" role for that)
if ($action === 'add_slot') {
    $newSlot = $input['newSlot'] ?? null;
    
    // Print slot data to error log
    error_log("New slot data: " . print_r($newSlot, true));
    
    // Validate that newSlot exists and is an array
    if (!$newSlot || !is_array($newSlot)) {
        echo json_encode(['success' => false, 'error' => 'Missing or invalid newSlot data']);
        exit;
    }

    // Validate required fields
    if (!isset($newSlot['date']) || !isset($newSlot['open']) || !isset($newSlot['close'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields (date, open, close)']);
        exit;
    }

    // Validate time format (HH:MM)
    if (
        !preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $newSlot['open']) ||
        !preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $newSlot['close'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Time must be in HH:MM format']);
        exit;
    }

    // Validate date format (YYYY-MM-DD)
    if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/', $newSlot['date'])) {
        echo json_encode(['success' => false, 'error' => 'Date must be in YYYY-MM-DD format']);
        exit;
    }

    // Validate platzwart if provided (must be alphanumeric/safe string)
    if (isset($newSlot['platzwart']) && !preg_match('/^[a-zA-Z0-9_\- ]+$/', $newSlot['platzwart'])) {
        echo json_encode(['success' => false, 'error' => 'Platzwart contains invalid characters']);
        exit;
    }

    // All validations passed, insert the slot
    $new_slots = insertSlot($calendarfilePath, $newSlot);
    if (is_array($new_slots) && count($new_slots) > 0) {
        echo json_encode(['success' => true, 'slots' => $new_slots]);
    } else {
        echo json_encode(['success' => false, 'error' => $new_slots]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>