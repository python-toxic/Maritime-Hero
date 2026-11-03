<?php
/**
 * Login API Endpoint
 * Handles user authentication and session creation.
 */
include_once '../config/database.php';
include_once '../config/session.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(empty($data->email) || empty($data->password) || empty($data->role)) {
    echo json_encode(["success" => false, "error" => "Email, password, and role are required."]);
    exit;
}

$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$password = $data->password;
$role = filter_var($data->role, FILTER_SANITIZE_STRING);

try {
    // Check if user exists and has the requested role
    $query = "SELECT u.id, u.email, u.password_hash, u.status, r.name as role_name 
              FROM users u 
              JOIN roles r ON u.role_id = r.id 
              WHERE u.email = :email LIMIT 0,1";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch();
        
        // Verify role
        if (strtolower($row['role_name']) !== strtolower($role)) {
            echo json_encode(["success" => false, "error" => "Invalid role for this user."]);
            exit;
        }

        // Verify status
        if ($row['status'] !== 'active') {
            echo json_encode(["success" => false, "error" => "Account is not active."]);
            exit;
        }

        // Verify password
        if(password_verify($password, $row['password_hash'])) {
            // Start secure session
            session_regenerate_id(true); // Prevent session fixation
            
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['role'] = $row['role_name'];
            $_SESSION['last_activity'] = time();

            // Log action (wrapped in try-catch to prevent crash if table is missing or column mismatch)
            try {
                $logQuery = "INSERT INTO admin_log (action, user_id, description) VALUES ('login', :uid, 'User logged in successfully')
                             ON DUPLICATE KEY UPDATE id=id";
                $logStmt = $db->prepare($logQuery);
                $logStmt->bindParam(":uid", $row['id']);
                $logStmt->execute();
            } catch (Exception $e) {
                // Ignore logging failure (e.g., if column is actor_id instead of user_id)
            }

            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $row['id'],
                    "email" => $row['email'],
                    "role" => $row['role_name']
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "error" => "Invalid credentials."]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Invalid credentials."]);
    }
} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => "An error occurred during authentication."]);
}
