<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

// CSRF Protection (currently disabled for compatibility)
$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? '';

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

// Clear any opcode cache before processing
if (function_exists('opcache_invalidate')) {
  opcache_invalidate($configPath);
}
if (function_exists('apcu_delete')) {
  apcu_delete($configPath);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
  exit;
}

// Load existing config to preserve hashed keys and other internal data
$existingConfig = [];
if (file_exists($configPath)) {
  $existingConfig = json_decode(file_get_contents($configPath), true) ?: [];
}

// sanitize whitelist
$cfg = [
  'apiEnabled' => (bool)($data['apiEnabled'] ?? false),
  'apiKey' => (string)($data['apiKey'] ?? ''),
  'apiKeyHash' => '',
  'maxAttempts' => (int)($data['maxAttempts'] ?? 10),
  'blockDuration' => (int)($data['blockDuration'] ?? 300),
  'sessionTimeout' => (int)($data['sessionTimeout'] ?? 30),
  'files' => [],
  'lastUpdated' => time()
];

// Validate brute force protection settings
if ($cfg['maxAttempts'] < 3) $cfg['maxAttempts'] = 3;
if ($cfg['maxAttempts'] > 100) $cfg['maxAttempts'] = 100;
if ($cfg['blockDuration'] < 60) $cfg['blockDuration'] = 60;
if ($cfg['blockDuration'] > 86400) $cfg['blockDuration'] = 86400;
if ($cfg['sessionTimeout'] < 5) $cfg['sessionTimeout'] = 5;
if ($cfg['sessionTimeout'] > 1440) $cfg['sessionTimeout'] = 1440;

// Hash API key if it's new or changed
if (!empty($cfg['apiKey'])) {
  $existingKey = $existingConfig['apiKey'] ?? '';
  $existingHash = $existingConfig['apiKeyHash'] ?? '';
  
  // If key is different from stored masked version, it's a new key
  if ($cfg['apiKey'] !== $existingKey) {
    $cfg['apiKeyHash'] = password_hash($cfg['apiKey'], PASSWORD_DEFAULT);
    $cfg['apiKey'] = substr($cfg['apiKey'], 0, 6) . '...'; // Mask for display
  } else {
    // Keep existing hash and masked key if key hasn't changed
    $cfg['apiKeyHash'] = $existingHash;
    $cfg['apiKey'] = $existingKey; // Keep the existing masked key
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
    
    $fileEntry = [
      'path' => $path, 
      'deleteAfterRead' => $del, 
      'hide' => $hide,
      'fromDate' => $fromDate,
      'fromTime' => $fromTime,
      'forceDate' => $forceDate,
      'charLimit' => $charLimit
    ];
    $cfg['files'][] = $fileEntry;
  }
}

// Force file write by deleting first
@unlink($configPath);
$writeResult = file_put_contents($configPath, json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
// Change file permissions to ensure it's writable
@chmod($configPath, 0644);

// Clear cache after writing
if (function_exists('opcache_invalidate')) {
  opcache_invalidate($configPath);
}
if (function_exists('clearstatcache')) {
  clearstatcache(true, $configPath);
}

echo json_encode(['ok' => true]);


