<?php
/**
 * PUT /api/categories/update.php?id=1
 * Body: { name: string, type?: 'articles'|'faqs' }
 * Renames a category. Auth: Admin/Manager role required.
 */

include_once '../config/database.php';
include_once '../config/session.php';
include_once '../config/auth.php';
can_schedule_or_publish(); // requires admin/manager

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid category ID']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

$name = isset($payload['name']) ? trim($payload['name']) : '';
$type = isset($payload['type']) ? trim($payload['type']) : null;

if ($name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Category name is required']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    // Check if category exists
    $stmt = $db->prepare("SELECT id, name, type FROM categories WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Category not found']);
        exit;
    }

    // Use existing type if not supplied in payload
    $finalType = $type ?? $existing['type'];

    // Check for duplicate name+type (excluding current record)
    $dupCheck = $db->prepare(
        "SELECT id FROM categories WHERE name = :name AND type = :type AND id != :id LIMIT 1"
    );
    $dupCheck->execute([':name' => $name, ':type' => $finalType, ':id' => $id]);
    if ($dupCheck->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'A category with that name already exists']);
        exit;
    }

    // Generate updated slug
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

    $upd = $db->prepare(
        "UPDATE categories SET name = :name, type = :type, slug = :slug WHERE id = :id"
    );
    $upd->execute([':name' => $name, ':type' => $finalType, ':slug' => $slug, ':id' => $id]);

    // Return the updated record
    $fetch = $db->prepare("SELECT id, name, type, slug, created_at FROM categories WHERE id = :id LIMIT 1");
    $fetch->execute([':id' => $id]);
    $row = $fetch->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'message' => 'Category updated successfully', 'data' => $row]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
