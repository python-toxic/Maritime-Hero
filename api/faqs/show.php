<?php
/**
 * GET /api/faqs/show.php?id={id}
 * Returns a single faq by its numeric ID.
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

try {
    $stmt = $db->prepare('SELECT * FROM faqs WHERE id = :id LIMIT 1');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $faq = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($faq) {
        if (isset($faq['category_id'])) {
            $catStmt = $db->prepare("SELECT name FROM categories WHERE id = :id LIMIT 1");
            $catStmt->execute([':id' => $faq['category_id']]);
            $catRow = $catStmt->fetch(PDO::FETCH_ASSOC);
            $faq['category'] = $catRow ? $catRow['name'] : 'General';
        }
        echo json_encode(['success' => true, 'data' => $faq]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'FAQ not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
