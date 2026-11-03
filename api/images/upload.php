<?php
/**
 * POST /api/images/upload/
 * Saves an image to /uploads/ and returns its public URL.
 */

include_once '../config/database.php';
include_once '../config/session.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $code = isset($_FILES['file']) ? $_FILES['file']['error'] : 'missing';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded', 'code' => $code]);
    exit;
}

$file = $_FILES['file'];
$maxBytes = 5 * 1024 * 1024;

if ($file['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large (max 5MB)']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

if (!isset($allowed[$mime])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Only JPG, PNG, WEBP, and GIF images are allowed']);
    exit;
}

$uploadDir = realpath(__DIR__ . '/../../uploads');
if (!$uploadDir) {
    $target = __DIR__ . '/../../uploads';
    if (!is_dir($target) && !mkdir($target, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Upload directory is not writable']);
        exit;
    }
    $uploadDir = realpath($target);
}

$ext = $allowed[$mime];
$filename = 'img_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$destination = $uploadDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
    exit;
}

$publicUrl = '/uploads/' . $filename;
$articleId = isset($_POST['article_id']) && ctype_digit((string) $_POST['article_id'])
    ? (int) $_POST['article_id']
    : null;

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->prepare(
        "INSERT INTO uploads (filename, original_name, mime_type, size, path, article_id, created_at)
         VALUES (:filename, :original_name, :mime_type, :size, :path, :article_id, NOW())"
    );
    $stmt->bindValue(':filename', $filename);
    $stmt->bindValue(':original_name', $file['name']);
    $stmt->bindValue(':mime_type', $mime);
    $stmt->bindValue(':size', (int) $file['size'], PDO::PARAM_INT);
    $stmt->bindValue(':path', $publicUrl);
    $stmt->bindValue(':article_id', $articleId, $articleId ? PDO::PARAM_INT : PDO::PARAM_NULL);
    $stmt->execute();
    $uploadId = (int) $db->lastInsertId();
} catch (PDOException $e) {
    // File is saved even if uploads table insert fails
    $uploadId = null;
}

echo json_encode([
    'success' => true,
    'url' => $publicUrl,
    'data' => [
        'id' => $uploadId,
        'url' => $publicUrl,
        'path' => $publicUrl,
        'filename' => $filename,
        'original_name' => $file['name'],
        'mime_type' => $mime,
        'size' => (int) $file['size'],
    ],
]);
