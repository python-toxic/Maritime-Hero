<?php
/**
 * GET /api/categories/index.php
 * Optional query param: type (e.g., 'articles' or 'faqs')
 * Returns a list of categories (id, name, type, slug, created_at)
 */

include_once '../config/database.php';
// no session required for listing

$database = new Database();
$db = $database->getConnection();

$type = isset($_GET['type']) ? trim($_GET['type']) : null;

try {
    if ($type) {
        $stmt = $db->prepare("SELECT id, name, type, slug, created_at FROM categories WHERE type = :type ORDER BY name ASC");
        $stmt->execute([':type' => $type]);
    } else {
        $stmt = $db->query("SELECT id, name, type, slug, created_at FROM categories ORDER BY name ASC");
    }

    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $categories]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

?>
