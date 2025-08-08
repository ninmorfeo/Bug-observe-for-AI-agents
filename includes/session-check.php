<?php
declare(strict_types=1);
session_start();

/**
 * Check if admin is authenticated
 * Include this file at the top of all admin-only endpoints
 */
function checkAdminSession(): void {
  // Check if authenticated
  if (empty($_SESSION['admin_authenticated'])) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Unauthorized. Please login first.']);
    exit;
  }
  
  // Check session timeout (30 minutes of inactivity)
  $inactive = time() - ($_SESSION['last_activity'] ?? 0);
  if ($inactive > 1800) {
    session_destroy();
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Session expired. Please login again.']);
    exit;
  }
  
  // Update last activity
  $_SESSION['last_activity'] = time();
}

// Run the check
checkAdminSession();