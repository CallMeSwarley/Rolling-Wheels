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
$allowed_roles = ['dev', 'platzwart', 'admin'];
if (empty($_SESSION['loggedin'])) {
    http_response_code(401);
    echo json_encode(["error" => "Not authenticated"]);
    exit;
}
if (!array_intersect($_SESSION['roles'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(["error" => "Access denied: you do not have permission to write the calendar."]);
    exit;
}
// if (!isset($_COOKIE['session'])) {
//     http_response_code(401);
//     echo json_encode(["error" => "Not authenticated"]);
//     exit;
// }
// if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
//     http_response_code(403);
//     echo json_encode(['error' => 'Access denied']);
//     exit;
// }
// $token = $_COOKIE['session'];

function insertSlot_non_concurrency_safe($filePath, $newSlot, $minDurationMinutes = 120)
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

    // Check for containment by single slot
    foreach ($daySlots as $slot) {
        $slotStart = strtotime($slot['open']);
        $slotEnd = strtotime($slot['close']);

        // Full containment check
        if (($newStart <= $slotStart && $newEnd >= $slotEnd) || ($slotStart <= $newStart && $slotEnd >= $newEnd)) {
            return "Error: Slot cannot fully contain or be fully contained by existing slot from {$slot['open']} to {$slot['close']}.";
        }
    }

    // Check if new slot is enclosed by multiple overlapping/adjacent slots
    if (!empty($daySlots)) {
        // Build merged ranges from existing slots
        $mergedRanges = [];
        foreach ($daySlots as $slot) {
            $slotStart = strtotime($slot['open']);
            $slotEnd = strtotime($slot['close']);

            if (empty($mergedRanges)) {
                $mergedRanges[] = ['start' => $slotStart, 'end' => $slotEnd];
                continue;
            }

            $lastRange = &$mergedRanges[count($mergedRanges) - 1];

            // If adjacent or overlapping, merge
            if ($slotStart <= $lastRange['end']) {
                $lastRange['end'] = max($lastRange['end'], $slotEnd);
            } else {
                // New separate range
                $mergedRanges[] = ['start' => $slotStart, 'end' => $slotEnd];
            }
        }

        // Check if new slot is fully enclosed by any merged range
        foreach ($mergedRanges as $range) {
            if ($newStart >= $range['start'] && $newEnd <= $range['end']) {
                return "Error: Slot is fully enclosed by existing overlapping/adjacent slots from " . date('H:i', $range['start']) . " to " . date('H:i', $range['end']) . ".";
            }
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

function insertSlot($filePath, $newSlot, $minDurationMinutes = 120)
{
    $fp = fopen($filePath, 'c+'); // open for read/write
    if (!$fp)
        return "Error: Cannot open file.";

    // Acquire exclusive lock for safe read-modify-write
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return "Error: Cannot lock file.";
    }

    // Read existing slots from file pointer
    $content = stream_get_contents($fp);
    $slots = json_decode($content, true) ?: [];

    $newStart = strtotime($newSlot['open']);
    $newEnd = strtotime($newSlot['close']);

    // Check minimum duration
    if (($newEnd - $newStart) / 60 < $minDurationMinutes) {
        // Return current slots even on error
        flock($fp, LOCK_UN);
        fclose($fp);
        return ["error" => "Slot duration is less than $minDurationMinutes minutes.", "slots" => $slots];
    }

    // Slots on the same day
    $daySlots = array_filter($slots, fn($slot) => $slot['date'] === $newSlot['date']);
    usort($daySlots, fn($a, $b) => strtotime($a['open']) - strtotime($b['open']));

    // Containment check
    foreach ($daySlots as $slot) {
        $slotStart = strtotime($slot['open']);
        $slotEnd = strtotime($slot['close']);
        if (($newStart <= $slotStart && $newEnd >= $slotEnd) || ($slotStart <= $newStart && $slotEnd >= $newEnd)) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return ["error" => "Slot cannot fully contain or be fully contained by existing slot from {$slot['open']} to {$slot['close']}.", "slots" => $slots];
        }
    }

    // Check merged overlapping ranges
    if (!empty($daySlots)) {
        $mergedRanges = [];
        foreach ($daySlots as $slot) {
            $slotStart = strtotime($slot['open']);
            $slotEnd = strtotime($slot['close']);
            if (empty($mergedRanges)) {
                $mergedRanges[] = ['start' => $slotStart, 'end' => $slotEnd];
                continue;
            }
            $lastRange = &$mergedRanges[count($mergedRanges) - 1];
            if ($slotStart <= $lastRange['end']) {
                $lastRange['end'] = max($lastRange['end'], $slotEnd);
            } else {
                $mergedRanges[] = ['start' => $slotStart, 'end' => $slotEnd];
            }
        }
        foreach ($mergedRanges as $range) {
            if ($newStart >= $range['start'] && $newEnd <= $range['end']) {
                flock($fp, LOCK_UN);
                fclose($fp);
                return ["error" => "Slot is fully enclosed by existing overlapping/adjacent slots from " . date('H:i', $range['start']) . " to " . date('H:i', $range['end']) . ".", "slots" => $slots];
            }
        }
    }

    // Back-to-back / gaps check
    if (!empty($daySlots)) {
        // Check if inserting before first slot
        $firstSlotStart = strtotime($daySlots[0]['open']);
        if ($newEnd < $firstSlotStart) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return ["error" => "New slot must end immediately before first slot at " . date('H:i', $firstSlotStart) . ".", "slots" => $slots];
        }
        
        // Find correct position to insert
        $prevEnd = null;
        foreach ($daySlots as $slot) {
            $slotStart = strtotime($slot['open']);
            $slotEnd = strtotime($slot['close']);

            if ($prevEnd !== null && $newStart > $prevEnd && $newStart < $slotStart) {
                flock($fp, LOCK_UN);
                fclose($fp);
                return ["error" => "Slot must start immediately after previous slot at " . date('H:i', $prevEnd) . ".", "slots" => $slots];
            }

            $prevEnd = max($prevEnd ?? 0, $slotEnd); // allow partial overlap extending prevEnd
        }

        // Check if inserting after last slot
        $lastSlotEnd = strtotime(end($daySlots)['close']);
        if ($newStart > $lastSlotEnd) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return ["error" => "New slot must start immediately after last slot at " . date('H:i', $lastSlotEnd) . ".", "slots" => $slots];
        }
    }

    // Insert new slot and sort
    $slots[] = $newSlot;
    usort($slots, fn($a, $b) => strtotime($a['date'] . ' ' . $a['open']) - strtotime($b['date'] . ' ' . $b['open']));

    // Save updated JSON
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($slots, JSON_PRETTY_PRINT));

    // Release lock
    flock($fp, LOCK_UN);
    fclose($fp);

    return $slots;
}


// write actions, require admin auth (in future we need a "Platzwart" role for that)
if ($action === 'add_slot') {
    $newSlot = $input['newSlot'] ?? null;
    $newSlot['platzwart'] = $_SESSION['username'] ?? 'unknown';

    error_log("New slot data: " . print_r($newSlot, true));

    // Validate newSlot exists and is an array
    if (!$newSlot || !is_array($newSlot)) {
        echo json_encode(['success' => false, 'error' => 'Missing or invalid newSlot data']);
        exit;
    }

    // Validate required fields
    foreach (['date', 'open', 'close'] as $field) {
        if (!isset($newSlot[$field])) {
            echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
            exit;
        }
    }

    // Validate time format HH:MM
    foreach (['open', 'close'] as $timeField) {
        if (!preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $newSlot[$timeField])) {
            echo json_encode(['success' => false, 'error' => "Time must be in HH:MM format for $timeField"]);
            exit;
        }
    }

    // Validate date format YYYY-MM-DD
    if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/', $newSlot['date'])) {
        echo json_encode(['success' => false, 'error' => 'Date must be in YYYY-MM-DD format']);
        exit;
    }

    // Validate opening time before closing time
    $openTime = strtotime($newSlot['open']);
    $closeTime = strtotime($newSlot['close']);
    if ($openTime >= $closeTime) {
        echo json_encode(['success' => false, 'error' => 'Opening time must be before closing time']);
        exit;
    }

    // Insert the slot using concurrency-safe function
    $result = insertSlot($calendarfilePath, $newSlot);

    if (is_array($result) && isset($result['error'])) {
        // Insert failed, return error + current slots
        echo json_encode(['success' => false, 'error' => $result['error'], 'slots' => $result['slots']]);
    } else {
        // Insert succeeded
        echo json_encode(['success' => true, 'slots' => $result]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>