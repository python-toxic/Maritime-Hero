<?php
/**
 * GET /api/faqs/index.php
 * Optional query params: page, limit, status, category
 * Returns a paginated list of all faqs.
 */

include_once '../config/database.php';
session_start();

$database = new Database();
$db = $database->getConnection();

$page  = isset($_GET['page'])  ? (int)$_GET['page']  : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
$offset = ($page - 1) * $limit;

// Fetch categories for mapping
$catStmt = $db->query("SELECT id, name FROM categories");
$categories = [];
while ($row = $catStmt->fetch(PDO::FETCH_ASSOC)) {
    $categories[$row['id']] = $row['name'];
}

$whereClauses = [];
$params = [];

if (isset($_GET['status']) && $_GET['status'] !== 'all') {
    $whereClauses[] = "status = :status";
    $params[':status'] = $_GET['status'];
}

if (isset($_GET['category'])) {
    // We should lookup the category ID
    $catIdQuery = $db->prepare("SELECT id FROM categories WHERE name = :name LIMIT 1");
    $catIdQuery->execute([':name' => $_GET['category']]);
    $catRow = $catIdQuery->fetch(PDO::FETCH_ASSOC);
    if ($catRow) {
        $whereClauses[] = "category_id = :category_id";
        $params[':category_id'] = $catRow['id'];
    } else {
        // If category doesn't exist, return empty
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
}

$whereSql = '';
if (count($whereClauses) > 0) {
    $whereSql = 'WHERE ' . implode(' AND ', $whereClauses);
}

try {
    $query = "SELECT * FROM faqs $whereSql ORDER BY `order` ASC, updated_at DESC LIMIT :limit OFFSET :offset";
    $stmt  = $db->prepare($query);
    
    $stmt->bindValue(':limit',  $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();

    $faqs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Attach category name
    foreach ($faqs as &$faq) {
        if (isset($faq['category_id']) && isset($categories[$faq['category_id']])) {
            $faq['category'] = $categories[$faq['category_id']];
        } else {
            $faq['category'] = 'General';
        }
    }
    
    echo json_encode(['success' => true, 'data' => $faqs]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
