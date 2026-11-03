<?php
/**
 * POST /api/faqs/create.php
 * Creates a new faq.
 */

include_once '../config/database.php';
session_start();

$database = new Database();
$db = $database->getConnection();

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Resolve category string to category_id
$category_name = isset($payload['category']) ? $payload['category'] : 'General';
$stmt_cat = $db->prepare("SELECT id FROM categories WHERE name = :name LIMIT 1");
$stmt_cat->execute([':name' => $category_name]);
$cat_row = $stmt_cat->fetch(PDO::FETCH_ASSOC);
if ($cat_row) {
    $category_id = $cat_row['id'];
} else {
    $cat_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $category_name)));
    $stmt_cat_ins = $db->prepare("INSERT INTO categories (name, type, slug, created_at) VALUES (:name, 'faqs', :slug, NOW())");
    $stmt_cat_ins->execute([':name' => $category_name, ':slug' => $cat_slug]);
    $category_id = $db->lastInsertId();
}

$status = isset($payload['status']) ? $payload['status'] : 'draft';
$author_id = isset($payload['author_id']) ? $payload['author_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);
$order = isset($payload['order']) ? $payload['order'] : 0;

try {
    $stmt = $db->prepare(
        "INSERT INTO faqs (question, answer, category_id, status, `order`, author_id, created_at, updated_at)
         VALUES (:question, :answer, :category_id, :status, :order, :author_id, NOW(), NOW())"
    );

    $stmt->bindParam(':question',    $payload['question']);
    $stmt->bindParam(':answer',      $payload['answer']);
    $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
    $stmt->bindParam(':status',      $status);
    $stmt->bindParam(':order',       $order, PDO::PARAM_INT);
    $stmt->bindParam(':author_id',   $author_id, PDO::PARAM_INT);

    $stmt->execute();
    $newId = $db->lastInsertId();

    echo json_encode(['success' => true, 'id' => $newId, 'data' => array_merge($payload, ['id' => $newId])]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
