<?php
/**
 * Scheduling datetime helpers (India wall-clock).
 * scheduled_at and published_at are stored as naive IST datetimes.
 * Do not use MySQL NOW() for scheduling comparisons — Hostinger MySQL runs in UTC.
 */

define('APP_TIMEZONE', 'Asia/Kolkata');

if (function_exists('date_default_timezone_set')) {
    date_default_timezone_set(APP_TIMEZONE);
}

function app_now(): DateTime
{
    return new DateTime('now', new DateTimeZone(APP_TIMEZONE));
}

/** Current IST as MySQL datetime string (Y-m-d H:i:s). */
function app_now_mysql(): string
{
    return app_now()->format('Y-m-d H:i:s');
}
/**
 * Normalize client scheduled_at to MySQL naive datetime in India time.
 * - Naive "YYYY-MM-DD HH:mm:ss" / picker values: stored as-is
 * - ISO UTC (legacy clients): converted to India wall clock
 */
function normalize_scheduled_at(string $input): ?string
{
    $input = trim($input);
    $tz = new DateTimeZone(APP_TIMEZONE);

    if (preg_match('/Z$/i', $input) || preg_match('/[+-]\d{2}:?\d{2}$/', $input)) {
        try {
            $dt = new DateTime($input);
            $dt->setTimezone($tz);
            return $dt->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            return null;
        }
    }

    if (!preg_match('/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2})?/', $input, $parts)) {
        return null;
    }

    $seconds = (isset($parts[3]) && $parts[3] !== '') ? $parts[3] : ':00';
    $normalized = $parts[1] . ' ' . $parts[2] . $seconds;

    $dt = DateTime::createFromFormat('Y-m-d H:i:s', $normalized, $tz);
    return $dt ? $normalized : null;
}
