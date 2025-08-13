<?php
declare(strict_types=1);

// Check admin session first
require_once __DIR__ . '/includes/session-check.php';

header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

// Load config to get a valid API key
$config = [
  'apiEnabled' => false,
  'apiKey' => '',
  'apiKeyHash' => '',
  'files' => []
];

if (is_file($configPath)) {
  $json = file_get_contents($configPath);
  $cfg = json_decode($json, true);
  if (is_array($cfg)) {
    $config = array_merge($config, $cfg);
  }
}

// Check if API is enabled
if (!$config['apiEnabled']) {
  echo json_encode(['error' => 'API is disabled']);
  exit;
}

// We need to generate a temporary valid API key or use a special test mode
// Since we have the hash but not the original key, we'll make a direct call
// to index.php internally with a special bypass for admin testing

// Read the index.php logic directly (simulate the endpoint)
$results = [];

foreach ($config['files'] as $entry) {
  if (!is_array($entry)) continue;
  $path = (string)($entry['path'] ?? '');
  $hide = !empty($entry['hide']);
  $charLimit = (int)($entry['charLimit'] ?? 0);
  
  // Skip completely if hidden
  if ($hide) continue;
  
  if ($path === '') continue;
  
  // Check extension
  $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
  if (!in_array($ext, ['log', 'txt', 'err'], true)) continue;
  
  // Normalize path
  $abs = $path;
  if (strpos($path, '/') === 0 && !preg_match('/^[a-zA-Z]:\\\\/', $path)) {
    // This is a relative path from web root, convert to absolute
    $webRoot = dirname(__DIR__);
    $abs = $webRoot . $path;
  }
  
  // Check if file exists and is readable
  if (!is_file($abs) || !is_readable($abs)) continue;
  
  // Read file content
  $content = @file_get_contents($abs);
  if ($content === false) continue;
  
  $originalSize = strlen($content);
  $truncated = false;
  
  // Apply character limit if specified
  if ($charLimit > 0 && strlen($content) > $charLimit) {
    $content = substr($content, -$charLimit);
    $truncated = true;
    // Try to find a line break to avoid cutting in the middle of a line
    $nlPos = strpos($content, "\n");
    if ($nlPos !== false && $nlPos < 100) {
      $content = substr($content, $nlPos + 1);
    }
  }
  
  $result = [
    'path' => $path,
    'size' => strlen($content),
    'content_log' => $content
  ];
  
  // Only add truncated field if content was actually truncated
  if ($truncated) {
    $result['truncated'] = true;
  }
  
  $results[] = $result;
}

// Return simplified test results matching the real endpoint
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_IGNORE);