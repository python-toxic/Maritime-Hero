<?php
/**
 * GET /api/users/
 * Returns all users (admin only). Password hashes and secret codes are excluded.
 */

include_once '../config/database.php';
include_once '../config/session.php';

if (!isset($_SESSION['user_id']) || strtolower($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query(
        "SELECT u.id, u.email, u.status, u.created_at, u.updated_at, r.name AS role
         FROM users u
         JOIN roles r ON u.role_id = r.id
         ORDER BY u.created_at DESC"
    );

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
