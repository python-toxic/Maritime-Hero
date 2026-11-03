<?php
include 'api/config/database.php';
$db = (new Database())->getConnection();
if (!$db) { echo "Failed to connect"; exit; }
$stmt = $db->query("DESCRIBE articles");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt = $db->query("DESCRIBE categories");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt = $db->query("DESCRIBE faqs");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
