<?php
require_once __DIR__ . '/bootstrap.php';
header('Content-Type: application/json');

// --- READ JSON INPUT ---
$rawInput = file_get_contents('php://input');

if (stripos($rawInput, '<?php') !== false || stripos($rawInput, '<?=') !== false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid content']);
    exit;
}

$input = json_decode($rawInput, true);
$action = $input['action'] ?? '';

$calendarFilePath = __DIR__ . '/calendar_data.json';
$monthFilePath    = __DIR__ . '/month.json';
$eintrittFilePath = __DIR__ . '/../../rolling-wheels.net/data/pages/eintritt.xml';

// Fixed enums
define('APPOINTMENT_TYPES', ['session', 'event', 'workshop', 'other']);
define('ALLOWED_ROLES',     ['admin', 'platzwart', 'dev']);

error_log("Received action: " . $action);
// =====================================================================
// READ-ONLY ACTIONS (no auth required)
// =====================================================================
if ($action === 'read_calendar') {
    if (file_exists($calendarFilePath)) {
        $appointments = json_decode(file_get_contents($calendarFilePath), true) ?: [];
        $publicAppointments = sanitizeAppointmentsForPublic($appointments);
        echo json_encode(['success' => true, 'appointments' => $publicAppointments]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found']);
    }
    exit;
}

// if ($action === 'read_months') {
//     if (file_exists($monthFilePath)) {
//         $months = json_decode(file_get_contents($monthFilePath), true) ?: [];
//         echo json_encode(['success' => true, 'months' => $months]);
//     } else {
//         echo json_encode(['success' => false, 'error' => 'Months file not found']);
//     }
//     exit;
// }

if ($action === 'read_eintritt') {
    if (file_exists($eintrittFilePath)) {
        $content = file_get_contents($eintrittFilePath);
        echo json_encode(['success' => true, 'content' => $content]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found']);
    }
    exit;
}

// =====================================================================
// AUTH CHECK for all wradmin read actions
// =====================================================================
if ($action === 'read_calendar_admin') {
    if (empty($_SESSION['loggedin'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated', 'loggedin' => $_SESSION['loggedin']]);
        exit;
    }
    if (!in_array('admin', $_SESSION['roles'] ?? [])) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied: admin only.']);
        exit;
    }
    if (file_exists($calendarFilePath)) {
        $appointments = json_decode(file_get_contents($calendarFilePath), true) ?: [];
        echo json_encode(['success' => true, 'appointments' => $appointments]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File not found']);
    }
    exit;
}

// =====================================================================
// AUTH CHECK for all write actions
// =====================================================================
if (empty($_SESSION['loggedin'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated', 'loggedin' => $_SESSION['loggedin']]);
    exit;
}
if (!array_intersect($_SESSION['roles'], ALLOWED_ROLES)) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied: you do not have the required role.']);
    exit;
}

$userRoles = $_SESSION['roles'] ?? [];
$username  = $_SESSION['username'] ?? 'unknown';
$isAdmin   = in_array('admin', $userRoles);

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================
function loadJSON($path) {
    if (!file_exists($path)) return [];
    return json_decode(file_get_contents($path), true) ?: [];
}

function saveJSONToHandle($fp, $data) {
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
}

function validateTimeFormat($time) {
    return (bool) preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $time);
}

function validateDateFormat($date) {
    return (bool) preg_match('/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/', $date);
}

function validateHttpUrl($url) {
    if (!is_string($url) || trim($url) === '') return false;
    if (!filter_var($url, FILTER_VALIDATE_URL)) return false;
    $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?? '');
    return in_array($scheme, ['http', 'https'], true);
}

function isFutureDateTime($date, $time) {
    $ts = strtotime($date . ' ' . $time);
    if ($ts === false) return false;
    return $ts > time();
}

function getMonthConfig($monthFilePath, $monthNum) {
    $months = loadJSON($monthFilePath);
    foreach ($months as $m) {
        if ((int)$m['month'] === (int)$monthNum) return $m;
    }
    return null;
}

function sortAppointments(&$appointments) {
    usort($appointments, function ($a, $b) {
        return strtotime($a['date'] . ' ' . $a['start']) - strtotime($b['date'] . ' ' . $b['start']);
    });
}

function sanitizeAppointmentsForPublic($appointments) {
    $public = [];
    foreach ($appointments as $appt) {
        $clean = $appt;
        unset($clean['responsible']);

        if (($clean['type'] ?? '') === 'session') {
            unset($clean['url']);
        }

        if (($appt['type'] ?? '') === 'session' && !empty($appt['showUsername']) && !empty($appt['responsible'])) {
            $clean['displayName'] = $appt['responsible'];
        }

        if (!isset($clean['displayName'])) {
            unset($clean['displayName']);
        }

        $public[] = $clean;
    }
    return $public;
}

function appointmentsForResponse($appointments, $isAdmin) {
    if ($isAdmin) return $appointments;
    return sanitizeAppointmentsForPublic($appointments);
}

/**
 * Validates and inserts a new appointment (concurrency-safe via flock).
 * Returns array of all appointments on success, or ['error' => ..., 'appointments' => ...] on failure.
 */
function insertAppointment($calendarFilePath, $monthFilePath, $newAppt) {
    $fp = fopen($calendarFilePath, 'c+');
    if (!$fp) return ['error' => 'Cannot open calendar file.', 'appointments' => []];

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['error' => 'Cannot lock file.', 'appointments' => []];
    }

    $content      = stream_get_contents($fp);
    $appointments = json_decode($content, true) ?: [];

    $newStartTs = strtotime($newAppt['date'] . ' ' . $newAppt['start']);
    $newEndTs   = strtotime($newAppt['date'] . ' ' . $newAppt['end']);

    if ($newStartTs >= $newEndTs) {
        flock($fp, LOCK_UN); fclose($fp);
        return ['error' => 'Start time must be before end time.', 'appointments' => $appointments];
    }

    if ($newAppt['type'] === 'session') {
        // Sessions must not overlap existing events/workshops on the same day.
        foreach ($appointments as $a) {
            if ($a['date'] !== $newAppt['date']) continue;
            if (!in_array($a['type'], ['event', 'workshop'])) continue;

            $aStartTs = strtotime($newAppt['date'] . ' ' . $a['start']);
            $aEndTs   = strtotime($newAppt['date'] . ' ' . $a['end']);

            // Strict overlap: touching borders is allowed (before/after), crossing is not.
            if ($newStartTs < $aEndTs && $newEndTs > $aStartTs) {
                flock($fp, LOCK_UN); fclose($fp);
                return [
                    'error' => "Session conflicts with existing {$a['type']} ({$a['start']}-{$a['end']}). It must be fully before or after.",
                    'appointments' => $appointments
                ];
            }
        }

        // --- Minimum duration: 2 hours ---
        if (($newEndTs - $newStartTs) / 60 < 120) {
            flock($fp, LOCK_UN); fclose($fp);
            return ['error' => 'Session duration must be at least 2 hours.', 'appointments' => $appointments];
        }

        // --- Month config must exist ---
        $cfg = getMonthConfig($monthFilePath, $newAppt['month']);
        if (!$cfg || !isset($cfg['corehours_start']) || !isset($cfg['corehours_end'])) {
            flock($fp, LOCK_UN); fclose($fp);
            return ['error' => 'No configuration for month ' . $newAppt['month'] . '. Set up month config before adding sessions.', 'appointments' => $appointments];
        }

        // --- Core hours check: at least 2 hours of the session must overlap with core hours ---
        // $coreStartTs  = strtotime($newAppt['date'] . ' ' . $cfg['corehours_start']);
        // $coreEndTs    = strtotime($newAppt['date'] . ' ' . $cfg['corehours_end']);
        // $overlapStart = max($newStartTs, $coreStartTs);
        // $overlapEnd   = min($newEndTs, $coreEndTs);
        // $overlapMins  = ($overlapEnd - $overlapStart) / 60;
        // if ($overlapMins < 120) {
        //     flock($fp, LOCK_UN); fclose($fp);
        //     return ['error' => "At least 2 hours of the session must be within core hours ({$cfg['corehours_start']} - {$cfg['corehours_end']}).", 'appointments' => $appointments];
        // }

        // --- Filter same-day sessions ---
        $daySessions = array_values(array_filter($appointments, fn($a) =>
            $a['date'] === $newAppt['date'] && $a['type'] === 'session'
        ));
        usort($daySessions, fn($a, $b) => strtotime($a['start']) - strtotime($b['start']));

        $minGapMins = (int)($cfg['min_gap_mins'] ?? 0);

        if (!empty($daySessions)) {
            // --- Containment check ---
            foreach ($daySessions as $s) {
                $sStartTs = strtotime($newAppt['date'] . ' ' . $s['start']);
                $sEndTs   = strtotime($newAppt['date'] . ' ' . $s['end']);
                if (($newStartTs <= $sStartTs && $newEndTs >= $sEndTs)
                    || ($sStartTs <= $newStartTs && $sEndTs >= $newEndTs)) {
                    flock($fp, LOCK_UN); fclose($fp);
                    return ['error' => "Session cannot fully contain or be fully contained by existing session ({$s['start']}-{$s['end']}).", 'appointments' => $appointments];
                }
            }

            // Build merged ranges to detect enclosure
            $mergedRanges = [];
            foreach ($daySessions as $s) {
                $sStartTs = strtotime($newAppt['date'] . ' ' . $s['start']);
                $sEndTs   = strtotime($newAppt['date'] . ' ' . $s['end']);
                if (empty($mergedRanges)) {
                    $mergedRanges[] = ['start' => $sStartTs, 'end' => $sEndTs];
                    continue;
                }
                $last = &$mergedRanges[count($mergedRanges) - 1];
                if ($sStartTs <= $last['end']) {
                    $last['end'] = max($last['end'], $sEndTs);
                } else {
                    $mergedRanges[] = ['start' => $sStartTs, 'end' => $sEndTs];
                }
            }
            foreach ($mergedRanges as $range) {
                if ($newStartTs >= $range['start'] && $newEndTs <= $range['end']) {
                    flock($fp, LOCK_UN); fclose($fp);
                    return ['error' => 'Session is already covered by existing sessions (' . date('H:i', $range['start']) . '-' . date('H:i', $range['end']) . ').', 'appointments' => $appointments];
                }
            }

            // --- Gap rule ---
            if ($minGapMins === 0) {
                // No gaps allowed: new session must be adjacent/overlapping with existing block
                $firstStartTs = strtotime($daySessions[0]['date'] . ' ' . $daySessions[0]['start']);
                $lastEndTs    = strtotime(end($daySessions)['date'] . ' ' . end($daySessions)['end']);

                if ($newEndTs < $firstStartTs) {
                    flock($fp, LOCK_UN); fclose($fp);
                    return ['error' => 'No gap allowed (min_gap_mins=0): session must end no earlier than ' . date('H:i', $firstStartTs) . '.', 'appointments' => $appointments];
                }
                if ($newStartTs > $lastEndTs) {
                    flock($fp, LOCK_UN); fclose($fp);
                    return ['error' => 'No gap allowed (min_gap_mins=0): session must start no later than ' . date('H:i', $lastEndTs) . '.', 'appointments' => $appointments];
                }
                $prevEndTs = null;
                foreach ($daySessions as $s) {
                    $sStartTs = strtotime($newAppt['date'] . ' ' . $s['start']);
                    $sEndTs   = strtotime($newAppt['date'] . ' ' . $s['end']);
                    if ($prevEndTs !== null && $newStartTs > $prevEndTs && $newStartTs < $sStartTs) {
                        flock($fp, LOCK_UN); fclose($fp);
                        return ['error' => 'No gap allowed (min_gap_mins=0): there is a gap before ' . date('H:i', $sStartTs) . '.', 'appointments' => $appointments];
                    }
                    $prevEndTs = max($prevEndTs ?? 0, $sEndTs);
                }
            } else {
                // Gaps are allowed but must be >= minGapMins.
                // Check against merged ranges so that overlapping/adjacent existing sessions
                // are treated as one block — avoiding false "small gap" errors against sessions
                // that are part of the same contiguous block as the new session's neighbour.
                foreach ($mergedRanges as $range) {
                    // Gap: new ends before this range starts
                    if ($newEndTs <= $range['start']) {
                        $gapMins = ($range['start'] - $newEndTs) / 60;
                        if ($gapMins > 0 && $gapMins < $minGapMins) {
                            flock($fp, LOCK_UN); fclose($fp);
                            return ['error' => "Gap of {$gapMins} min is too small. Minimum gap is {$minGapMins} min.", 'appointments' => $appointments];
                        }
                    }
                    // Gap: new starts after this range ends
                    if ($newStartTs >= $range['end']) {
                        $gapMins = ($newStartTs - $range['end']) / 60;
                        if ($gapMins > 0 && $gapMins < $minGapMins) {
                            flock($fp, LOCK_UN); fclose($fp);
                            return ['error' => "Gap of {$gapMins} min is too small. Minimum gap is {$minGapMins} min.", 'appointments' => $appointments];
                        }
                    }
                }
            }
        }
    }
    // Non-session types: no gap/corehours restrictions

    $appointments[] = $newAppt;
    sortAppointments($appointments);
    saveJSONToHandle($fp, $appointments);
    flock($fp, LOCK_UN);
    fclose($fp);

    return $appointments;
}

// =====================================================================
// WRITE ACTIONS
// =====================================================================

// --- add_appointment ---
if ($action === 'add_appointment') {
    $appt = $input['appointment'] ?? null;

    if (!$appt || !is_array($appt)) {
        echo json_encode(['success' => false, 'error' => 'Missing appointment data']);
        exit;
    }

    $appt['responsible'] = $username;

    foreach (['date', 'start', 'end', 'type'] as $field) {
        if (empty($appt[$field])) {
            echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
            exit;
        }
    }

    // Require a name for event and other appointment types
    if ($appt['type'] === 'event' || $appt['type'] === 'other') {
        $appt['name'] = trim($appt['name'] ?? '');
        if ($appt['name'] === '') {
            echo json_encode(['success' => false, 'error' => 'Name/Titel is required for event and other appointment types']);
            exit;
        }
        if (strlen($appt['name']) > 100) {
            echo json_encode(['success' => false, 'error' => 'Name must be 100 characters or less']);
            exit;
        }
    } else {
        unset($appt['name']);
    }

    if (in_array($appt['type'], ['event', 'other', 'workshop'], true)) {
        $appt['url'] = trim($appt['url'] ?? '');
        if (!validateHttpUrl($appt['url'])) {
            echo json_encode(['success' => false, 'error' => 'Valid URL (http/https) is required for event, workshop and other appointment types']);
            exit;
        }
        if (strlen($appt['url']) > 500) {
            echo json_encode(['success' => false, 'error' => 'URL must be 500 characters or less']);
            exit;
        }
    } else {
        unset($appt['url']);
    }

    if (!in_array($appt['type'], APPOINTMENT_TYPES)) {
        echo json_encode(['success' => false, 'error' => 'Invalid type. Allowed: ' . implode(', ', APPOINTMENT_TYPES)]);
        exit;
    }

    if (!validateTimeFormat($appt['start']) || !validateTimeFormat($appt['end'])) {
        echo json_encode(['success' => false, 'error' => 'Times must be in HH:MM format']);
        exit;
    }

    if (!validateDateFormat($appt['date'])) {
        echo json_encode(['success' => false, 'error' => 'Date must be in YYYY-MM-DD format']);
        exit;
    }

    if (!isFutureDateTime($appt['date'], $appt['start'])) {
        echo json_encode(['success' => false, 'error' => 'Appointments must be in the future']);
        exit;
    }

    $appt['month'] = (int) date('n', strtotime($appt['date']));

    if ($appt['type'] === 'session') {
        $appt['showUsername'] = !empty($appt['showUsername']);
    } else {
        unset($appt['showUsername']);
    }

    error_log("add_appointment: " . print_r($appt, true));

    $result = insertAppointment($calendarFilePath, $monthFilePath, $appt);

    if (is_array($result) && isset($result['error'])) {
        echo json_encode([
            'success' => false,
            'error' => $result['error'],
            'appointments' => appointmentsForResponse($result['appointments'], $isAdmin)
        ]);
    } else {
        echo json_encode(['success' => true, 'appointments' => appointmentsForResponse($result, $isAdmin)]);
    }
    exit;
}

// --- delete_appointment (admin only) ---
if ($action === 'delete_appointment') {
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can delete appointments']);
        exit;
    }

    $index = $input['index'] ?? null;
    if (!is_int($index) && !is_numeric($index)) {
        echo json_encode(['success' => false, 'error' => 'Missing or invalid index']);
        exit;
    }
    $index = (int) $index;

    $fp = fopen($calendarFilePath, 'c+');
    if (!$fp) { echo json_encode(['success' => false, 'error' => 'Cannot open file']); exit; }
    if (!flock($fp, LOCK_EX)) { fclose($fp); echo json_encode(['success' => false, 'error' => 'Cannot lock file']); exit; }

    $appointments = json_decode(stream_get_contents($fp), true) ?: [];

    if ($index < 0 || $index >= count($appointments)) {
        flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(['success' => false, 'error' => 'Index out of range']);
        exit;
    }

    array_splice($appointments, $index, 1);
    saveJSONToHandle($fp, $appointments);
    flock($fp, LOCK_UN);
    fclose($fp);

    echo json_encode(['success' => true, 'appointments' => $appointments]);
    exit;
}

// --- edit_appointment (admin only) ---
if ($action === 'edit_appointment') {
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can edit appointments']);
        exit;
    }

    $index   = $input['index'] ?? null;
    $updated = $input['appointment'] ?? null;

    if ((!is_int($index) && !is_numeric($index)) || !$updated || !is_array($updated)) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields (index, appointment)']);
        exit;
    }
    $index = (int) $index;

    foreach (['date', 'start', 'end', 'type'] as $field) {
        if (empty($updated[$field])) {
            echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
            exit;
        }
    }

    if (!in_array($updated['type'], APPOINTMENT_TYPES)) {
        echo json_encode(['success' => false, 'error' => 'Invalid type']);
        exit;
    }
    if (!validateTimeFormat($updated['start']) || !validateTimeFormat($updated['end'])) {
        echo json_encode(['success' => false, 'error' => 'Times must be in HH:MM format']);
        exit;
    }
    if (!validateDateFormat($updated['date'])) {
        echo json_encode(['success' => false, 'error' => 'Date must be in YYYY-MM-DD format']);
        exit;
    }

    if (!isFutureDateTime($updated['date'], $updated['start'])) {
        echo json_encode(['success' => false, 'error' => 'Appointments must be in the future']);
        exit;
    }

    $fp = fopen($calendarFilePath, 'c+');
    if (!$fp) { echo json_encode(['success' => false, 'error' => 'Cannot open file']); exit; }
    if (!flock($fp, LOCK_EX)) { fclose($fp); echo json_encode(['success' => false, 'error' => 'Cannot lock file']); exit; }

    $appointments = json_decode(stream_get_contents($fp), true) ?: [];

    if ($index < 0 || $index >= count($appointments)) {
        flock($fp, LOCK_UN); fclose($fp);
        echo json_encode(['success' => false, 'error' => 'Index out of range']);
        exit;
    }

    // Preserve the original responsible person
    $updated['responsible'] = $appointments[$index]['responsible'] ?? $username;
    $updated['month']       = (int) date('n', strtotime($updated['date']));

    // Validate name for event and other types
    if ($updated['type'] === 'event' || $updated['type'] === 'other') {
        $updated['name'] = trim($updated['name'] ?? '');
        if ($updated['name'] === '') {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(['success' => false, 'error' => 'Name/Titel is required for event and other appointment types']);
            exit;
        }
        if (strlen($updated['name']) > 100) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(['success' => false, 'error' => 'Name must be 100 characters or less']);
            exit;
        }
    } else {
        unset($updated['name']);
    }

    if (in_array($updated['type'], ['event', 'other', 'workshop'], true)) {
        $updated['url'] = trim($updated['url'] ?? '');
        if (!validateHttpUrl($updated['url'])) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(['success' => false, 'error' => 'Valid URL (http/https) is required for event, workshop and other appointment types']);
            exit;
        }
        if (strlen($updated['url']) > 500) {
            flock($fp, LOCK_UN); fclose($fp);
            echo json_encode(['success' => false, 'error' => 'URL must be 500 characters or less']);
            exit;
        }
    } else {
        unset($updated['url']);
    }

    if ($updated['type'] === 'session') {
        $updated['showUsername'] = !empty($appointments[$index]['showUsername']);
    } else {
        unset($updated['showUsername']);
    }

    $appointments[$index] = $updated;
    sortAppointments($appointments);
    saveJSONToHandle($fp, $appointments);
    flock($fp, LOCK_UN);
    fclose($fp);

    echo json_encode(['success' => true, 'appointments' => $appointments]);
    exit;
}

// --- update_month (admin only) ---
// if ($action === 'update_month') {
//     if (!$isAdmin) {
//         http_response_code(403);
//         echo json_encode(['success' => false, 'error' => 'Only admins can update month configuration']);
//         exit;
//     }

//     $monthData = $input['month'] ?? null;
//     if (!$monthData || !is_array($monthData) || !isset($monthData['month'])) {
//         echo json_encode(['success' => false, 'error' => 'Missing month data']);
//         exit;
//     }

//     $monthNum = (int) $monthData['month'];

//     if ($monthNum === 0) {
//         echo json_encode(['success' => false, 'error' => 'Month 0 is reserved and cannot be edited']);
//         exit;
//     }
//     if ($monthNum < 1 || $monthNum > 12) {
//         echo json_encode(['success' => false, 'error' => 'Invalid month number (1-12)']);
//         exit;
//     }

//     // Block edit if sessions already exist for this month in the current year
//     $appointments = loadJSON($calendarFilePath);
//     $currentYear = (int) date('Y');
//     foreach ($appointments as $a) {
//         $apptYear = isset($a['date']) ? (int) date('Y', strtotime($a['date'])) : 0;
//         if ($a['type'] === 'session' && (int)$a['month'] === $monthNum && $apptYear === $currentYear) {
//             echo json_encode(['success' => false, 'error' => "Cannot edit month $monthNum: sessions already exist for this month."]);
//             exit;
//         }
//     }

//     if (!validateTimeFormat($monthData['corehours_start'] ?? '')
//         || !validateTimeFormat($monthData['corehours_end'] ?? '')) {
//         echo json_encode(['success' => false, 'error' => 'Core hours must be in HH:MM format']);
//         exit;
//     }
//     if (!is_numeric($monthData['min_gap_mins']) || (int)$monthData['min_gap_mins'] < 0) {
//         echo json_encode(['success' => false, 'error' => 'min_gap_mins must be a non-negative integer']);
//         exit;
//     }

//     $fp = fopen($monthFilePath, 'c+');
//     if (!$fp) { echo json_encode(['success' => false, 'error' => 'Cannot open months file']); exit; }
//     if (!flock($fp, LOCK_EX)) { fclose($fp); echo json_encode(['success' => false, 'error' => 'Cannot lock file']); exit; }

//     $months = json_decode(stream_get_contents($fp), true) ?: [];
//     $found  = false;
//     foreach ($months as &$m) {
//         if ((int)$m['month'] === $monthNum) {
//             $m['min_gap_mins']    = (int) $monthData['min_gap_mins'];
//             $m['corehours_start'] = $monthData['corehours_start'];
//             $m['corehours_end']   = $monthData['corehours_end'];
//             $found = true;
//             break;
//         }
//     }
//     unset($m);

//     if (!$found) {
//         flock($fp, LOCK_UN); fclose($fp);
//         echo json_encode(['success' => false, 'error' => 'Month not found in config']);
//         exit;
//     }

//     saveJSONToHandle($fp, $months);
//     flock($fp, LOCK_UN);
//     fclose($fp);

//     echo json_encode(['success' => true, 'months' => $months]);
//     exit;
// }

echo json_encode(['success' => false, 'error' => 'Invalid action']);
?>
