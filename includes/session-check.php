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
  
  // Load config for session timeout
  $dataDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
  $configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';
  $sessionTimeout = 30; // default 30 minutes
  
  if (file_exists($configPath)) {
    $config = json_decode(file_get_contents($configPath), true);
    if (isset($config['sessionTimeout'])) {
      $sessionTimeout = (int)$config['sessionTimeout'];
    }
  }
  
  // Check session timeout based on config
  $inactive = time() - ($_SESSION['last_activity'] ?? 0);
  $timeoutSeconds = $sessionTimeout * 60;
  
  if ($inactive > $timeoutSeconds) {
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