<?php
/**
 * GET /api/articles/index.php
 * Optional query params: page, limit, status, category
 * Returns a paginated list of all articles.
 */

include_once '../config/database.php';
include_once '../config/session.php';

$database = new Database();
$db = $database->getConnection();

$page  = isset($_GET['page'])  ? (int)$_GET['page']  : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
$offset = ($page - 1) * $limit;

// Start with a base query
$whereClauses = [];
$params = [];

if (isset($_GET['status']) && $_GET['status'] !== 'all') {
    $whereClauses[] = "status = :status";
    $params[':status'] = $_GET['status'];
}

if (isset($_GET['category'])) {
    // Resolve provided category name to the category_id stored on articles
    $catName = $_GET['category'];
    $catIdQuery = $db->prepare("SELECT id FROM categories WHERE name = :name LIMIT 1");
    $catIdQuery->execute([':name' => $catName]);
    $catRow = $catIdQuery->fetch(PDO::FETCH_ASSOC);
    if ($catRow) {
        $whereClauses[] = "a.category_id = :category_id";
        $params[':category_id'] = $catRow['id'];
    } else {
        // No matching category — return empty set instead of causing SQL errors
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
}

$whereSql = '';
if (count($whereClauses) > 0) {
    $whereSql = 'WHERE ' . implode(' AND ', $whereClauses);
}

try {
    $query = "SELECT a.*, c.name AS category_name
              FROM articles a
              LEFT JOIN categories c ON a.category_id = c.id
              $whereSql
              ORDER BY a.updated_at DESC
              LIMIT :limit OFFSET :offset";
    $stmt  = $db->prepare($query);

    $stmt->bindValue(':limit',  $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();

    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($articles as &$article) {
        if (!empty($article['category_name'])) {
            $article['category'] = $article['category_name'];
        }
    }
    echo json_encode(['success' => true, 'data' => $articles]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
