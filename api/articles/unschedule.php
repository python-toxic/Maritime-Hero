<?php
/**
 * POST /api/articles/{id}/unschedule
 * Cancel a scheduled publication and return article to approved status.
 */

include_once '../config/database.php';
include_once '../config/session.php';
include_once '../config/auth.php';

can_schedule_or_publish();

$id = isset($_GET['id']) ? $_GET['id'] : null;
if (!$id || !ctype_digit($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid article ID']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->prepare('SELECT id, status FROM articles WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$article) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Article not found']);
        exit;
    }

    if ($article['status'] !== 'scheduled') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Only scheduled articles can be unscheduled']);
        exit;
    }

    $update = $db->prepare(
        'UPDATE articles SET status = :status, scheduled_at = NULL, updated_at = NOW() WHERE id = :id'
    );
    $update->execute([
        ':status' => 'approved',
        ':id' => $id,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Schedule cancelled',
        'data' => [
            'id' => (int) $id,
            'status' => 'approved',
            'scheduled_at' => null,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
