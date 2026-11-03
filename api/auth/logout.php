<?php
/**
 * Logout API Endpoint
 * Handles user logout and session destruction.
 */
include_once '../config/database.php';

include_once '../config/session.php';

// Destroy session data
session_unset();
session_destroy();

// Optionally, clear the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

echo json_encode(["success" => true, "message" => "Logged out successfully."]);
