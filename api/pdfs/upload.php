<?php
/**
 * POST /api/pdfs/upload/
 * Saves a PDF to /uploads/pdfs/ and returns its public URL.
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
$maxBytes = 20 * 1024 * 1024; // 20 MB

if ($file['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large (max 20MB)']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

if ($mime !== 'application/pdf') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Only PDF files are allowed']);
    exit;
}

// Verify PDF signature
$content = file_get_contents($file['tmp_name'], false, null, 0, 4);
if ($content !== '%PDF') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid PDF file signature']);
    exit;
}

$uploadDir = realpath(__DIR__ . '/../../uploads/pdfs');
if (!$uploadDir) {
    $target = __DIR__ . '/../../uploads/pdfs';
    if (!is_dir($target) && !mkdir($target, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Upload directory is not writable']);
        exit;
    }
    $uploadDir = realpath($target);
}

$filename = 'pdf_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.pdf';
$destination = $uploadDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
    exit;
}

$publicUrl = '/uploads/pdfs/' . $filename;

echo json_encode([
    'success' => true,
    'url' => $publicUrl,
    'pdf_file_path' => $publicUrl
]);
