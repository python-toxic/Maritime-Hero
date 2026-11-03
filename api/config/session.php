<?php
/**
 * Shared session bootstrap.
 * Sets cookie path to "/" so the session is sent to all /api/* endpoints.
 */

if (session_status() === PHP_SESSION_NONE) {
    $isSecure =
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    session_set_cookie_params([
        'lifetime' => 3600,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => $isSecure,
    ]);

    session_start();
}
