<?php
/**
 * POST /api/users/
 * Creates a new manager or employee user (admin only).
 */

include_once '../config/database.php';
include_once '../config/session.php';

if (!isset($_SESSION['user_id']) || strtolower($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$email = isset($payload['email']) ? filter_var(trim($payload['email']), FILTER_VALIDATE_EMAIL) : false;
$password = isset($payload['password']) ? $payload['password'] : '';
$secret_code = isset($payload['secret_code']) ? trim($payload['secret_code']) : '';
$role = isset($payload['role']) ? strtolower(trim($payload['role'])) : '';
$status = isset($payload['status']) ? $payload['status'] : 'active';

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid email address is required']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
    exit;
}

if ($secret_code === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Secret code is required']);
    exit;
}

if (!in_array($role, ['manager', 'employee'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Role must be manager or employee']);
    exit;
}

if (!in_array($status, ['active', 'inactive'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid status']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $dupStmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $dupStmt->execute([':email' => $email]);
    if ($dupStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'A user with this email already exists']);
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

    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $created_by = $_SESSION['user_id'];

    $stmt = $db->prepare(
        "INSERT INTO users (email, password_hash, secret_code, role_id, status, created_by, created_at, updated_at)
         VALUES (:email, :password_hash, :secret_code, :role_id, :status, :created_by, NOW(), NOW())"
    );

    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password_hash', $password_hash);
    $stmt->bindParam(':secret_code', $secret_code);
    $stmt->bindValue(':role_id', $roleRow['id'], PDO::PARAM_INT);
    $stmt->bindParam(':status', $status);
    $stmt->bindValue(':created_by', $created_by, PDO::PARAM_INT);
    $stmt->execute();

    $newId = $db->lastInsertId();

    echo json_encode([
        'success' => true,
        'id' => $newId,
        'data' => [
            'id' => (int) $newId,
            'email' => $email,
            'role' => $role,
            'status' => $status,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
