<?php
/**
 * POST /api/articles/{id}/publish
 * Publish an approved or scheduled article immediately.
 */

include_once '../config/database.php';
include_once '../config/session.php';
include_once '../config/auth.php';
include_once '../config/datetime.php';

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

    if (!in_array($article['status'], ['approved', 'scheduled'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Only approved or scheduled articles can be published']);
        exit;
    }

    $publishTime = app_now_mysql();

    $update = $db->prepare(
        'UPDATE articles SET status = :status, published_at = :published_at, updated_at = :updated_at WHERE id = :id'
    );
    $update->execute([
        ':status' => 'published',
        ':published_at' => $publishTime,
        ':updated_at' => $publishTime,
        ':id' => $id,
    ]);

    $reviewerId = (int) $_SESSION['user_id'];
    $history = $db->prepare(
        'INSERT INTO review_history (content_type, content_id, reviewer_id, decision, notes, created_at)
         VALUES (:content_type, :content_id, :reviewer_id, :decision, :notes, :created_at)'
    );
    $history->execute([
        ':content_type' => 'article',
        ':content_id' => $id,
        ':reviewer_id' => $reviewerId,
        ':decision' => 'published',
        ':notes' => 'Published immediately',
        ':created_at' => $publishTime,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Article published',
        'data' => [
            'id' => (int) $id,
            'status' => 'published',
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
