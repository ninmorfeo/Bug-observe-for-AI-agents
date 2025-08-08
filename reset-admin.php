<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Reset admin password to default
$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$adminConfigPath = $dataDir . DIRECTORY_SEPARATOR . 'admin.json';

// Delete admin.json to reset to defaults
if (file_exists($adminConfigPath)) {
  if (@unlink($adminConfigPath)) {
    // Also clean up any failed attempts
    $failedAttemptsDir = $dataDir . DIRECTORY_SEPARATOR . 'failed_attempts';
    if (is_dir($failedAttemptsDir)) {
      $files = glob($failedAttemptsDir . DIRECTORY_SEPARATOR . '*.json');
      foreach ($files as $file) {
        @unlink($file);
      }
    }
    
    // Clear rate limit files
    $rateLimitDir = $dataDir . DIRECTORY_SEPARATOR . 'rate_limit';
    if (is_dir($rateLimitDir)) {
      $files = glob($rateLimitDir . DIRECTORY_SEPARATOR . '*.txt');
      foreach ($files as $file) {
        @unlink($file);
      }
    }
    
    echo json_encode([
      'success' => true,
      'message' => 'Admin password reset to default'
    ]);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to reset admin password']);
  }
} else {
  // Already at default
  echo json_encode([
    'success' => true,
    'message' => 'Admin password already at default'
  ]);
}