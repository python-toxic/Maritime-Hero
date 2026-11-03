<?php
/**
 * DELETE /api/faqs/delete.php?id={id}
 * Removes a faq permanently.
 */

include_once '../config/database.php';
session_start();

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id || !ctype_digit($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid FAQ ID']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->prepare('DELETE FROM faqs WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'FAQ deleted']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
