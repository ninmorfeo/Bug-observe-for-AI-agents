<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

$defaults = [
  'apiEnabled' => false,
  'apiKey' => 'dbg_' . bin2hex(random_bytes(4)) . '_' . time(),
  'files' => []
];

if (!file_exists($configPath)) {
  file_put_contents($configPath, json_encode($defaults, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
  echo json_encode($defaults, JSON_UNESCAPED_SLASHES);
  exit;
}

$json = file_get_contents($configPath) ?: '';
$cfg = json_decode($json, true);
if (!is_array($cfg)) {
  echo json_encode($defaults, JSON_UNESCAPED_SLASHES);
  exit;
}

// ensure shape
$cfg = array_merge($defaults, $cfg);

// If we have a hash but no plain key, show a masked version
if (!empty($cfg['apiKeyHash']) && empty($cfg['apiKey'])) {
  // Get the last generated key from session if available
  if (!empty($_SESSION['last_api_key'])) {
    $cfg['apiKey'] = $_SESSION['last_api_key'];
    $cfg['apiKeyVisible'] = true; // Flag that we have the real key
  } else {
    // Show masked placeholder but keep the masked key for display
    // Store the original masked key (first 10 chars) if available
    if (!empty($cfg['apiKey'])) {
      $cfg['maskedKey'] = $cfg['apiKey']; // This is like "dbg_9m..."
    }
    $cfg['apiKey'] = '••••••••• (chiave salvata ma nascosta per sicurezza)';
    $cfg['apiKeyVisible'] = false; // Flag that key is hidden
  }
}

echo json_encode($cfg, JSON_UNESCAPED_SLASHES);


