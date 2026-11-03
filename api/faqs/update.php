<?php
/**
 * PUT /api/faqs/update.php?id={id}
 * Updates an existing faq.
 */

include_once '../config/database.php';
session_start();

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id || !ctype_digit($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid FAQ ID']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$set = [];
$params = [];

// Handle category string to category_id mapping
if (isset($payload['category'])) {
    $category_name = $payload['category'];
    $stmt_cat = $db->prepare("SELECT id FROM categories WHERE name = :name LIMIT 1");
    $stmt_cat->execute([':name' => $category_name]);
    $cat_row = $stmt_cat->fetch(PDO::FETCH_ASSOC);
    if ($cat_row) {
        $payload['category_id'] = $cat_row['id'];
    } else {
        $cat_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $category_name)));
        $stmt_cat_ins = $db->prepare("INSERT INTO categories (name, type, slug, created_at) VALUES (:name, 'faqs', :slug, NOW())");
        $stmt_cat_ins->execute([':name' => $category_name, ':slug' => $cat_slug]);
        $payload['category_id'] = $db->lastInsertId();
    }
    unset($payload['category']);
}

foreach ($payload as $col => $val) {
    // Only allow updating columns that exist in the database (simple list)
    $allowed = ['question', 'answer', 'category_id', 'status', 'order', 'author_id', 'approved_by', 'approved_at', 'submitted_at'];
    if (in_array($col, $allowed)) {
        // Enclose `order` in backticks since it's a reserved word in MySQL
        $col_name = $col === 'order' ? '`order`' : "`$col`";
        $set[] = "$col_name = :$col";
        $params[":$col"] = $val;
    }
}

if (empty($set)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
    exit;
}

$set[] = "`updated_at` = NOW()";

$sql = "UPDATE faqs SET " . implode(', ', $set) . " WHERE id = :id";
$params[':id'] = $id;

try {
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'FAQ updated', 'data' => $payload]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
