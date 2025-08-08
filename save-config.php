<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

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

// sanitize whitelist
$cfg = [
  'apiEnabled' => (bool)($data['apiEnabled'] ?? false),
  'apiKey' => (string)($data['apiKey'] ?? ''),
  'files' => []
];

if (!empty($data['files']) && is_array($data['files'])) {
  foreach ($data['files'] as $f) {
    if (!is_array($f)) continue;
    $path = (string)($f['path'] ?? '');
    $del = !empty($f['deleteAfterRead']);
    $hide = !empty($f['hide']);
    if ($path === '') continue;
    // allow only .log/.txt/.err
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if (!in_array($ext, ['log','txt','err'], true)) continue;
    // prevent traversal tokens in stored path
    if (strpos($path, '..') !== false) continue;
    $cfg['files'][] = ['path' => $path, 'deleteAfterRead' => $del, 'hide' => $hide];
  }
}

file_put_contents($configPath, json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo json_encode(['ok' => true]);


