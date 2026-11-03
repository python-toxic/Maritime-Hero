<?php
/**
 * GET /api/articles/show.php?id={id} OR GET /api/articles/show.php?slug={slug}
 * Returns a single article by its numeric ID or slug.
 */

include_once '../config/database.php';
include_once '../config/session.php';

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? $_GET['id'] : null;
$slug = isset($_GET['slug']) ? $_GET['slug'] : null;

if (!$id && !$slug) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing article ID or slug']);
    exit;
}

try {
    if ($id && ctype_digit($id)) {
        $stmt = $db->prepare(
            "SELECT a.*, c.name AS category_name
             FROM articles a
             LEFT JOIN categories c ON a.category_id = c.id
             WHERE a.id = :id LIMIT 1"
        );
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    } else if ($slug) {
        $stmt = $db->prepare(
            "SELECT a.*, c.name AS category_name
             FROM articles a
             LEFT JOIN categories c ON a.category_id = c.id
             WHERE a.slug = :slug LIMIT 1"
        );
        $stmt->bindParam(':slug', $slug);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid article ID']);
        exit;
    }

    $stmt->execute();
    $article = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($article) {
        if (!empty($article['category_name'])) {
            $article['category'] = $article['category_name'];
        }
        echo json_encode(['success' => true, 'data' => $article]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Article not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
