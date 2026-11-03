<?php
/**
 * POST /api/articles/create.php
 * Creates a new article.
 */

include_once '../config/database.php';
session_start();

$database = new Database();
$db = $database->getConnection();

$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Generate slug if not provided
$slug = isset($payload['slug']) ? $payload['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $payload['title'])));

// Resolve category string to category_id
$category_name = isset($payload['category']) ? $payload['category'] : 'General';
$stmt_cat = $db->prepare("SELECT id FROM categories WHERE name = :name LIMIT 1");
$stmt_cat->execute([':name' => $category_name]);
$cat_row = $stmt_cat->fetch(PDO::FETCH_ASSOC);
if ($cat_row) {
    $category_id = $cat_row['id'];
} else {
    $cat_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $category_name)));
    $stmt_cat_ins = $db->prepare("INSERT INTO categories (name, type, slug, created_at) VALUES (:name, 'articles', :slug, NOW())");
    $stmt_cat_ins->execute([':name' => $category_name, ':slug' => $cat_slug]);
    $category_id = $db->lastInsertId();
}

$status = isset($payload['status']) ? $payload['status'] : 'draft';
$author_id = isset($payload['author_id']) ? $payload['author_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);
$featured_image_url = isset($payload['featured_image_url']) ? $payload['featured_image_url'] : (isset($payload['coverImage']) ? $payload['coverImage'] : '');
$submitted_at = isset($payload['submitted_at']) ? $payload['submitted_at'] : null;
$content_source = isset($payload['content_source']) ? $payload['content_source'] : 'cms';
$pdf_file_path = isset($payload['pdf_file_path']) ? $payload['pdf_file_path'] : null;

try {
    $query = "INSERT INTO articles (slug, title, excerpt, category_id, featured_image_url,
         author_id, body, status, content_source, pdf_file_path, created_at, updated_at";
    
    $values = "VALUES (:slug, :title, :excerpt, :category_id, :featured_image_url,
                 :author_id, :body, :status, :content_source, :pdf_file_path, NOW(), NOW()";
                 
    if ($submitted_at) {
        $query .= ", submitted_at";
        $values .= ", :submitted_at";
    }
    
    $query .= ") " . $values . ")";
    
    $stmt = $db->prepare($query);

    $stmt->bindParam(':slug',               $slug);
    $stmt->bindParam(':title',              $payload['title']);
    $stmt->bindParam(':excerpt',            $payload['excerpt']);
    $stmt->bindParam(':category_id',        $category_id, PDO::PARAM_INT);
    $stmt->bindParam(':featured_image_url', $featured_image_url);
    $stmt->bindParam(':author_id',          $author_id, PDO::PARAM_INT);
    $stmt->bindParam(':body',               $payload['body']);
    $stmt->bindParam(':status',             $status);
    $stmt->bindParam(':content_source',     $content_source);
    $stmt->bindParam(':pdf_file_path',      $pdf_file_path);
    
    if ($submitted_at) {
        $stmt->bindParam(':submitted_at', $submitted_at);
    }

    $stmt->execute();
    $newId = $db->lastInsertId();

    echo json_encode(['success' => true, 'id' => $newId, 'data' => array_merge($payload, ['id' => $newId])]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
