<?php
/**
 * DELETE /api/users/{id}
 * Soft-deletes a user by setting status to inactive (admin only).
 * Admin accounts and the current session user cannot be deleted.
 */

include_once '../config/database.php';
include_once '../config/session.php';

if (!isset($_SESSION['user_id']) || strtolower($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$id = isset($_GET['id']) ? $_GET['id'] : null;
if (!$id || !ctype_digit($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
    exit;
}

if ((int) $id === (int) $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'You cannot delete your own account']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $userStmt = $db->prepare(
        "SELECT u.id, r.name AS role
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = :id LIMIT 1"
    );
    $userStmt->execute([':id' => $id]);
    $existing = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    if ($existing['role'] === 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Admin accounts cannot be deleted']);
        exit;
    }

    $stmt = $db->prepare("UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'User deactivated']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
