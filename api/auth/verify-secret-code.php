<?php
/**
 * Verify Secret Code API Endpoint
 * Handles verification of static secret codes per role for password reset.
 */
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(empty($data->email) || empty($data->secretCode) || empty($data->role)) {
    echo json_encode(["valid" => false, "error" => "Email, secret code, and role are required."]);
    exit;
}

$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$secretCode = trim($data->secretCode);
$role = strtolower(trim($data->role));

try {
    // Verify that user exists with that email, role, and matching secret code
    $query = "SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = :email AND LOWER(r.name) = :role AND u.secret_code = :code LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":role", $role);
    $stmt->bindParam(":code", $secretCode);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        // User and secret code match
        echo json_encode(["valid" => true]);
    } else {
        // User not found or code doesn't match
        echo json_encode(["valid" => false, "error" => "Invalid secret code or email not found."]);
    }
} catch(PDOException $e) {
    echo json_encode(["valid" => false, "error" => "An error occurred."]);
}
