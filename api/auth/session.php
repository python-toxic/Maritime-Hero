<?php
/**
 * Session Check API Endpoint
 * Verifies if the user is currently authenticated and handles session timeouts.
 */
include_once '../config/database.php';
include_once '../config/session.php';

$database = new Database();
// DB connection isn't strictly needed just to check session, 
// but useful if we want to re-validate user status.

$timeout_duration = 3600; // 1 hour timeout

if (isset($_SESSION['user_id']) && isset($_SESSION['last_activity'])) {
    
    // Check for session timeout
    $time_elapsed = time() - $_SESSION['last_activity'];
    if ($time_elapsed > $timeout_duration) {
        // Session expired
        session_unset();
        session_destroy();
        echo json_encode(["authenticated" => false, "error" => "Session expired."]);
        exit;
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();

    echo json_encode([
        "authenticated" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "email" => $_SESSION['email'],
            "role" => $_SESSION['role']
        ]
    ]);
} else {
    // Not authenticated
    echo json_encode(["authenticated" => false]);
}
