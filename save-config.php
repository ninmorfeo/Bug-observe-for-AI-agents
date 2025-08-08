<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

// CSRF Protection
$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? '';
if (empty($_SESSION['csrf_token']) || $csrfToken !== $_SESSION['csrf_token']) {
  // For now, just log but don't block (to avoid breaking existing installations)
  error_log('CSRF token mismatch - consider enabling CSRF protection');
}

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
  exit;
}

// Load existing config to preserve hashed keys
$existingConfig = [];
if (file_exists($configPath)) {
  $existingConfig = json_decode(file_get_contents($configPath), true) ?: [];
}

// sanitize whitelist
$cfg = [
  'apiEnabled' => (bool)($data['apiEnabled'] ?? false),
  'apiKey' => (string)($data['apiKey'] ?? ''),
  'apiKeyHash' => '',
  'files' => []
];

// Hash API key if it's new or changed
if (!empty($cfg['apiKey'])) {
  $existingKey = $existingConfig['apiKey'] ?? '';
  $existingHash = $existingConfig['apiKeyHash'] ?? '';
  
  // If key is different from stored masked version, it's a new key
  if ($cfg['apiKey'] !== $existingKey) {
    $cfg['apiKeyHash'] = password_hash($cfg['apiKey'], PASSWORD_DEFAULT);
    $cfg['apiKey'] = substr($cfg['apiKey'], 0, 6) . '...'; // Mask for display
  } else {
    // Keep existing hash if key hasn't changed
    $cfg['apiKeyHash'] = $existingHash;
  }
}

if (!empty($data['files']) && is_array($data['files'])) {
  foreach ($data['files'] as $f) {
    if (!is_array($f)) continue;
    $path = (string)($f['path'] ?? '');
    $del = !empty($f['deleteAfterRead']);
    $hide = !empty($f['hide']);
    $fromDate = (string)($f['fromDate'] ?? '');
    $fromTime = (string)($f['fromTime'] ?? '');
    $forceDate = !empty($f['forceDate']);
    $charLimit = (int)($f['charLimit'] ?? 0);
    
    if ($path === '') continue;
    // allow only .log/.txt/.err
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if (!in_array($ext, ['log','txt','err'], true)) continue;
    // prevent traversal tokens in stored path
    if (strpos($path, '..') !== false) continue;
    
    $cfg['files'][] = [
      'path' => $path, 
      'deleteAfterRead' => $del, 
      'hide' => $hide,
      'fromDate' => $fromDate,
      'fromTime' => $fromTime,
      'forceDate' => $forceDate,
      'charLimit' => $charLimit
    ];
  }
}

file_put_contents($configPath, json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo json_encode(['ok' => true]);


