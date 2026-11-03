<?php
/**
 * Cron: automatically publish scheduled newsletters.
 *
 * scheduled_at is stored in IST. MySQL NOW() is UTC on Hostinger,
 * so we compare and write timestamps using PHP Asia/Kolkata instead.
 *
 * Requires api/config/datetime.php on the server (upload both files together).
 *
 * CLI (recommended on Hostinger):
 *   php /home/USER/public_html/api/cron/publish_scheduled.php
 *
 * HTTP (alternative):
 *   GET /api/cron/publish_scheduled.php?key=YOUR_CRON_SECRET
 */

$isCli = php_sapi_name() === 'cli';

function cron_log_line(string $line): void
{
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    @file_put_contents($logDir . '/publish_scheduled.log', $line . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function cron_fail(string $message, int $exitCode = 1): void
{
    global $isCli;
    $line = '[' . date('Y-m-d H:i:s') . '] FATAL: ' . $message;
    error_log('publish_scheduled: ' . $message);
    cron_log_line($line);
    if (!$isCli) {
        header('Content-Type: text/plain; charset=utf-8');
    }
    echo $message . PHP_EOL;
    exit($exitCode);
}

register_shutdown_function(function () use ($isCli) {
    $err = error_get_last();
    if (!$err || !in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    $msg = $err['message'] . ' in ' . basename($err['file']) . ':' . $err['line'];
    cron_log_line('[' . date('Y-m-d H:i:s') . '] FATAL: ' . $msg);
    if ($isCli) {
        echo 'FATAL: ' . $msg . PHP_EOL;
    }
});

if (!$isCli) {
    require_once __DIR__ . '/../config/cron.php';
    $key = $_GET['key'] ?? '';
    if ($key === '' || !hash_equals(CRON_SECRET, $key)) {
        http_response_code(403);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Forbidden';
        exit;
    }
}

$datetimeFile = __DIR__ . '/../config/datetime.php';
if (!is_file($datetimeFile)) {
    cron_fail(
        'Missing api/config/datetime.php. Upload datetime.php to api/config/ on the server, then re-run cron.'
    );
}

require_once __DIR__ . '/../config/database.php';
require_once $datetimeFile;

function cron_log(string $message): void
{
    $line = '[' . app_now_mysql() . ' IST] ' . $message;
    error_log('publish_scheduled: ' . $message);
    cron_log_line($line);
}

$database = new Database();
$db = $database->getConnection();

$nowIst = app_now_mysql();
$published = 0;
$failed = 0;

try {
    $select = $db->prepare(
        "SELECT id, title, approved_by, scheduled_at
         FROM articles
         WHERE status = 'scheduled'
           AND scheduled_at IS NOT NULL
           AND scheduled_at <= :now_ist
         ORDER BY scheduled_at ASC"
    );
    $select->execute([':now_ist' => $nowIst]);
    $articles = $select->fetchAll();

    cron_log('Check at ' . $nowIst . ' IST - found ' . count($articles) . ' due article(s)');

    $update = $db->prepare(
        "UPDATE articles
         SET status = 'published', published_at = :published_at, updated_at = :updated_at
         WHERE id = :id AND status = 'scheduled'"
    );

    $history = $db->prepare(
        "INSERT INTO review_history (content_type, content_id, reviewer_id, decision, notes, created_at)
         VALUES ('article', :content_id, :reviewer_id, 'published', :notes, :created_at)"
    );

    foreach ($articles as $article) {
        $id = (int) $article['id'];
        $publishTime = app_now_mysql();

        try {
            $db->beginTransaction();

            $update->execute([
                ':published_at' => $publishTime,
                ':updated_at' => $publishTime,
                ':id' => $id,
            ]);

            if ($update->rowCount() === 0) {
                $db->rollBack();
                continue;
            }

            $reviewerId = !empty($article['approved_by']) ? (int) $article['approved_by'] : 1;

            $history->execute([
                ':content_id' => $id,
                ':reviewer_id' => $reviewerId,
                ':notes' => 'Published automatically at scheduled time',
                ':created_at' => $publishTime,
            ]);

            $db->commit();
            $published++;
            cron_log(
                'Published article id=' . $id
                . ' title="' . $article['title'] . '"'
                . ' (scheduled_at=' . ($article['scheduled_at'] ?? 'null') . ')'
            );
        } catch (Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            $failed++;
            cron_log('ERROR article id=' . $id . ': ' . $e->getMessage());
        }
    }
} catch (PDOException $e) {
    cron_log('FATAL: ' . $e->getMessage());
    if (!$isCli) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
    }
    echo 'Cron failed. Check logs.' . PHP_EOL;
    exit(1);
}

$output = 'Published ' . $published . ' articles. (checked at ' . $nowIst . ' IST)';
if ($failed > 0) {
    $output .= ' Failed ' . $failed . '.';
}

cron_log('Run complete. ' . $output);

if (!$isCli) {
    header('Content-Type: text/plain; charset=utf-8');
}
echo $output . PHP_EOL;

exit($failed > 0 ? 1 : 0);
