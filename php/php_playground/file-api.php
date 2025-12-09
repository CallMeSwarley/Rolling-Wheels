<?php
session_start();

// --- CORS HEADERS ---
// header('Access-Control-Allow-Origin: http://localhost:3000'); // comment out in production
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
    $slots = json_decode(file_get_contents($filePath), true) ?: [];

    $newStart = strtotime($newSlot['open']);
    $newEnd = strtotime($newSlot['close']);

    // Check minimum duration
    if (($newEnd - $newStart) / 60 < $minDurationMinutes) {
        return "Error: Slot duration is less than $minDurationMinutes minutes.";
    }

    // Get all slots on the same day
    $daySlots = array_filter($slots, fn($slot) => $slot['date'] === $newSlot['date']);

    // Sort by start time
    usort($daySlots, fn($a, $b) => strtotime($a['open']) - strtotime($b['open']));

    // Check for containment
    foreach ($daySlots as $slot) {
        $slotStart = strtotime($slot['open']);
        $slotEnd = strtotime($slot['close']);

        // Full containment check
        if (($newStart <= $slotStart && $newEnd >= $slotEnd) || ($slotStart <= $newStart && $slotEnd >= $newEnd)) {
            return "Error: Slot cannot fully contain or be fully contained by existing slot from {$slot['open']} to {$slot['close']}.";
        }
    }

    // Check back-to-back / gaps
    if (!empty($daySlots)) {
        // Find correct position to insert
        $prevEnd = null;
        foreach ($daySlots as $slot) {
            $slotStart = strtotime($slot['open']);
            $slotEnd = strtotime($slot['close']);

            if ($prevEnd !== null && $newStart > $prevEnd && $newStart < $slotStart) {
                return "Error: Slot must start immediately after previous slot at " . date('H:i', $prevEnd) . ".";
            }

            $prevEnd = max($prevEnd ?? 0, $slotEnd); // allow partial overlap extending prevEnd
        }

        // Check if inserting after last slot
        $lastSlotEnd = strtotime(end($daySlots)['close']);
        if ($newStart > $lastSlotEnd) {
            return "Error: New slot must start immediately after last slot at " . date('H:i', $lastSlotEnd) . ".";
        }
    }

    // Insert the new slot
    $slots[] = $newSlot;

    // Sort all slots by date + start time
    usort($slots, fn($a, $b) => strtotime($a['date'] . ' ' . $a['open']) - strtotime($b['date'] . ' ' . $b['open']));

    // Save updated JSON
    file_put_contents($filePath, json_encode($slots, JSON_PRETTY_PRINT));

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