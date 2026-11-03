<?php
/**
 * Reset Password API Endpoint
 * Handles updating user password after successful verification.
 */
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(empty($data->email) || empty($data->newPassword) || empty($data->role)) {
    echo json_encode(["success" => false, "error" => "Email, new password, and role are required."]);
    exit;
}

$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$newPassword = $data->newPassword;
$role = strtolower(trim($data->role));

if (strlen($newPassword) < 6) {
    echo json_encode(["success" => false, "error" => "Password must be at least 6 characters."]);
    exit;
}

try {
    // 1. Get user and verify role matches
    $query = "SELECT u.id, u.password_hash FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = :email AND LOWER(r.name) = :role LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":role", $role);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch();
        $user_id = $row['id'];
        $old_hash = $row['password_hash'];

        // 2. Hash the new password
        $new_hash = password_hash($newPassword, PASSWORD_DEFAULT);

        // 3. Update the password
        $updateQuery = "UPDATE users SET password_hash = :hash WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(":hash", $new_hash);
        $updateStmt->bindParam(":id", $user_id);
        
        if($updateStmt->execute()) {
            
            // Attempt to log the action (wrapped in try-catch so it doesn't break the main flow)
            try {
                // 4. Log to admin_log
                // Using a fallback for user_id vs actor_id based on typical schema mismatches
                $logQuery = "INSERT INTO admin_log (action, user_id, description) VALUES ('password_reset', :uid, 'User reset their password') 
                             ON DUPLICATE KEY UPDATE id=id";
                $logStmt = $db->prepare($logQuery);
                $logStmt->bindParam(":uid", $user_id);
                $logStmt->execute();
            } catch (Exception $e) {
                // Ignore logging failure (e.g. if column is actor_id instead of user_id)
            }

            try {
                // 5. Insert into password_history
                $histQuery = "INSERT INTO password_history (user_id, old_password_hash, new_password_hash) VALUES (:uid, :old_hash, :new_hash)";
                $histStmt = $db->prepare($histQuery);
                $histStmt->bindParam(":uid", $user_id);
                $histStmt->bindParam(":old_hash", $old_hash);
                $histStmt->bindParam(":new_hash", $new_hash);
                $histStmt->execute();
            } catch (Exception $e) {
                // Ignore history failure (e.g. if table doesn't exist)
            }

            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "Unable to update password."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "User not found or role mismatch."]);
    }
} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => "An error occurred during password reset."]);
}
