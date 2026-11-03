<?php
/**
 * POST /api/articles/{id}/schedule
 * Schedule an approved article for future publication.
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

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload || empty($payload['scheduled_at'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'scheduled_at is required']);
    exit;
}

$scheduledAt = trim($payload['scheduled_at']);

$scheduledMysql = normalize_scheduled_at($scheduledAt);
if (!$scheduledMysql) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid scheduled_at datetime']);
    exit;
}

$tz = new DateTimeZone(APP_TIMEZONE);
$scheduledDt = DateTime::createFromFormat('Y-m-d H:i:s', $scheduledMysql, $tz);
if (!$scheduledDt) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid scheduled_at datetime']);
    exit;
}

$now = app_now();
if ($scheduledDt <= $now) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Scheduled time must be in the future']);
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

    $status = $article['status'];
    if (!in_array($status, ['approved', 'scheduled'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Only approved articles can be scheduled']);
        exit;
    }

    $nowIst = app_now_mysql();

    $update = $db->prepare(
        'UPDATE articles SET status = :status, scheduled_at = :scheduled_at, updated_at = :updated_at WHERE id = :id'
    );
    $update->execute([
        ':status' => 'scheduled',
        ':scheduled_at' => $scheduledMysql,
        ':updated_at' => $nowIst,
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
        ':decision' => 'scheduled',
        ':notes' => 'Scheduled for ' . $scheduledMysql,
        ':created_at' => $nowIst,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Article scheduled',
        'data' => [
            'id' => (int) $id,
            'status' => 'scheduled',
            'scheduled_at' => $scheduledMysql,
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
