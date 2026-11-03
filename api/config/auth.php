<?php
/**
 * Shared auth helpers for API endpoints.
 */

function require_login(): void
{
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit;
    }
}

function require_roles(array $roles): void
{
    require_login();
    $role = strtolower($_SESSION['role'] ?? '');
    if (!in_array($role, $roles, true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
}

function can_schedule_or_publish(): void
{
    require_roles(['admin', 'manager']);
}
