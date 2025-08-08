<?php
declare(strict_types=1);

// Simple standalone endpoint that returns aggregated log contents based on config.json

header('Content-Type: application/json; charset=utf-8');

// Rate limiting
require_once __DIR__ . '/includes/rate-limiter.php';
$rateLimiter = new RateLimiter(60, 60); // 60 requests per minute
$clientId = $_SERVER['REMOTE_ADDR'] . ':' . ($_GET['api_key'] ?? '');

if (!$rateLimiter->checkLimit($clientId)) {
  http_response_code(429);
  echo json_encode(['error' => 'Too many requests. Please try again later.']);
  exit;
}

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

// Load config
$config = [
  'apiEnabled' => false,
  'apiKey' => '',
  'files' => []
];
if (is_file($configPath)) {
  $json = file_get_contents($configPath);
  $cfg = json_decode($json, true);
  if (is_array($cfg)) {
    $config = array_merge($config, $cfg);
  }
}

// Auth with hash verification
$apiKey = $_GET['api_key'] ?? '';
if (empty($config['apiEnabled']) || !$config['apiEnabled']) {
  http_response_code(403);
  echo json_encode(['error' => 'API disabled']);
  exit;
}

// Check against hash if available, fallback to plain comparison for backward compatibility
$authorized = false;
if (!empty($config['apiKeyHash'])) {
  // Use hash verification
  $authorized = password_verify($apiKey, $config['apiKeyHash']);
} else if (!empty($config['apiKey'])) {
  // Fallback to plain text for existing installations
  $authorized = ($apiKey === $config['apiKey']);
}

if (!$authorized) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

// Helpers
function isAllowedExtension(string $path): bool {
  $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
  return in_array($ext, ['log', 'txt', 'err'], true);
}

function normalizePath(string $path, string $root): string {
  // avoid traversal; resolve to realpath when possible
  $full = $path;
  if (!preg_match('/^([a-zA-Z]:\\\\|\\\\\\\\|\/)?.*/', $full)) {
    $full = $root . DIRECTORY_SEPARATOR . $path;
  }
  $full = str_replace(['..', '\\'], ['', DIRECTORY_SEPARATOR], $full);
  return $full;
}

$results = [];

foreach ($config['files'] as $entry) {
  if (!is_array($entry)) continue;
  $path = (string)($entry['path'] ?? '');
  $deleteAfter = (bool)($entry['deleteAfterRead'] ?? false);
  $hide = !empty($entry['hide']);
  $fromDate = trim((string)($entry['fromDate'] ?? ''));
  $fromTime = trim((string)($entry['fromTime'] ?? ''));
  $forceDate = !empty($entry['forceDate']);
  $charLimit = (int)($entry['charLimit'] ?? 0);
  
  // Skip completely if hidden
  if ($hide) continue;
  
  if ($path === '' || !isAllowedExtension($path)) {
    $results[] = [
      'path' => $path,
      'ok' => false,
      'error' => 'Invalid or forbidden file extension'
    ];
    continue;
  }
  $abs = normalizePath($path, DIRECTORY_SEPARATOR === '/' ? '/' : substr(__DIR__, 0, 2));
  // ensure file resides under server root or accessible path and exists
  if (!is_file($abs) || !is_readable($abs)) {
    $results[] = [
      'path' => $path,
      'ok' => false,
      'error' => 'File not found or unreadable'
    ];
    continue;
  }
  $content = @file_get_contents($abs);
  // Se è impostata una data/ora, filtra le righe che hanno timestamp >= (data/ora)
  if ($content !== false && ($fromDate || $fromTime)) {
    $dtStr = $fromDate . ' ' . ($fromTime ?: '00:00:00');
    $tsMin = strtotime($dtStr . ' UTC');
    if ($tsMin && ($forceDate || isset($_GET['from']))) {
      $filtered = [];
      $lines = preg_split("/\r?\n/", (string)$content);
      foreach ($lines as $line) {
        if ($line === '') continue;
        if (preg_match('/\[(\d{2}-[A-Za-z]{3}-\d{4}) (\d{2}:\d{2}:\d{2}) UTC\]/', $line, $m)) {
          $lts = strtotime($m[1] . ' ' . $m[2] . ' UTC');
          if ($lts !== false && $lts >= $tsMin) $filtered[] = $line;
        } else if (!$forceDate) {
          // mantieni righe senza timestamp se non forzato
          $filtered[] = $line;
        }
      }
      $content = implode("\n", $filtered);
    }
  }
  
  // Apply character limit if specified
  if ($charLimit > 0 && strlen((string)$content) > $charLimit) {
    $content = substr((string)$content, -$charLimit);
    // Try to find a line break to avoid cutting in the middle of a line
    $nlPos = strpos($content, "\n");
    if ($nlPos !== false && $nlPos < 100) {
      $content = substr($content, $nlPos + 1);
    }
  }
  
  $results[] = [
    'path' => $path,
    'ok' => true,
    'size' => strlen((string)$content),
    'content_log' => $content
  ];
  if ($deleteAfter) {
    @unlink($abs);
  }
}

$payload = ['timestamp' => time(), 'count' => count($results), 'items' => $results];

if (isset($_GET['pretty'])) {
  echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
  echo json_encode($payload);
}


