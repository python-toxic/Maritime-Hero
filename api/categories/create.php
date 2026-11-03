<?php
/**
 * POST /api/categories/create.php
 * Body: { name: string, type?: 'articles'|'faqs' }
 * Creates a category if it doesn't exist and returns the category object.
 */

include_once '../config/database.php';
session_start();

$database = new Database();
$db = $database->getConnection();

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$name = isset($payload['name']) ? trim($payload['name']) : '';
$type = isset($payload['type']) ? trim($payload['type']) : 'articles';

if ($name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Category name is required']);
    exit;
}

try {
    // Check for existing category with same name + type
    $stmt = $db->prepare("SELECT id, name, type, slug, created_at FROM categories WHERE name = :name AND type = :type LIMIT 1");
    $stmt->execute([':name' => $name, ':type' => $type]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        echo json_encode(['success' => true, 'data' => $existing]);
        exit;
    }

    // Generate slug
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

    $ins = $db->prepare("INSERT INTO categories (name, type, slug, created_at) VALUES (:name, :type, :slug, NOW())");
    $ins->execute([':name' => $name, ':type' => $type, ':slug' => $slug]);
    $id = $db->lastInsertId();

    $stmt2 = $db->prepare("SELECT id, name, type, slug, created_at FROM categories WHERE id = :id LIMIT 1");
    $stmt2->execute([':id' => $id]);
    $row = $stmt2->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $row]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

?>
