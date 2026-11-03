<?php
/**
 * PUT /api/users/{id}
 * Updates user role, status, password, or secret code (admin only).
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

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $userStmt = $db->prepare(
        "SELECT u.id, u.email, u.status, r.name AS role
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
        echo json_encode(['success' => false, 'error' => 'Admin accounts cannot be modified from this interface']);
        exit;
    }

    $set = [];
    $params = [':id' => $id];

    if (isset($payload['role'])) {
        $role = strtolower(trim($payload['role']));
        if (!in_array($role, ['manager', 'employee'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Role must be manager or employee']);
            exit;
        }

        $roleStmt = $db->prepare('SELECT id FROM roles WHERE name = :name LIMIT 1');
        $roleStmt->execute([':name' => $role]);
        $roleRow = $roleStmt->fetch(PDO::FETCH_ASSOC);
        if (!$roleRow) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid role']);
            exit;
        }

        $set[] = 'role_id = :role_id';
        $params[':role_id'] = $roleRow['id'];
        $existing['role'] = $role;
    }

    if (isset($payload['status'])) {
        $status = $payload['status'];
        if (!in_array($status, ['active', 'inactive'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            exit;
        }
        $set[] = 'status = :status';
        $params[':status'] = $status;
        $existing['status'] = $status;
    }

    if (!empty($payload['password'])) {
        if (strlen($payload['password']) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
            exit;
        }
        $set[] = 'password_hash = :password_hash';
        $params[':password_hash'] = password_hash($payload['password'], PASSWORD_DEFAULT);
    }

    if (isset($payload['secret_code']) && trim($payload['secret_code']) !== '') {
        $set[] = 'secret_code = :secret_code';
        $params[':secret_code'] = trim($payload['secret_code']);
    }

    if (empty($set)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
        exit;
    }

    $set[] = 'updated_at = NOW()';
    $sql = 'UPDATE users SET ' . implode(', ', $set) . ' WHERE id = :id';

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'User updated',
        'data' => $existing,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
