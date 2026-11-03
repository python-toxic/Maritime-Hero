<?php
/**
 * DELETE /api/categories/delete.php?id=1
 * Deletes a category only if it is not linked to any articles or FAQs.
 * Auth: Admin/Manager role required.
 */

include_once '../config/database.php';
include_once '../config/session.php';
include_once '../config/auth.php';
can_schedule_or_publish(); // requires admin/manager

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid category ID']);
    exit;
}

try {
    // Check if category exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Category not found']);
        exit;
    }

    // PRODUCTION GUARDRAIL: Check for linked articles
    $stmtArt = $db->prepare("SELECT COUNT(*) AS cnt FROM articles WHERE category_id = :id");
    $stmtArt->execute([':id' => $id]);
    $articleCount = (int) $stmtArt->fetch(PDO::FETCH_ASSOC)['cnt'];

    // PRODUCTION GUARDRAIL: Check for linked FAQs
    $stmtFaq = $db->prepare("SELECT COUNT(*) AS cnt FROM faqs WHERE category_id = :id");
    $stmtFaq->execute([':id' => $id]);
    $faqCount = (int) $stmtFaq->fetch(PDO::FETCH_ASSOC)['cnt'];

    if ($articleCount > 0 || $faqCount > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cannot delete category: It is currently linked to existing content.']);
        exit;
    }

    // Safe to delete
    $del = $db->prepare("DELETE FROM categories WHERE id = :id");
    $del->execute([':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'Category deleted successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>