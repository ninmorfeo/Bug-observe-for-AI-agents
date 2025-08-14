<?php
declare(strict_types=1);

// Simple standalone endpoint that returns aggregated log contents based on config.json

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Rate limiting
require_once __DIR__ . '/includes/rate-limiter.php';
require_once __DIR__ . '/includes/brute-force-protection.php';

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

// Clear any file system cache before reading config
if (function_exists('clearstatcache')) {
  clearstatcache(true, $configPath);
}
if (function_exists('opcache_invalidate')) {
  opcache_invalidate($configPath);
}

// ALWAYS load fresh config from file, never cache
$config = [
  'apiEnabled' => false,
  'apiKey' => '',
  'maxAttempts' => 10,
  'blockDuration' => 300,
  'files' => []
];

// Load configuration
if (is_file($configPath)) {
  $json = file_get_contents($configPath);
  $cfg = json_decode($json, true);
  if (is_array($cfg)) {
    $config = array_merge($config, $cfg);
  }
}

// Initialize brute force protection with config values
$bruteForce = new BruteForceProtection(
  $config['maxAttempts'] ?? 10,
  $config['blockDuration'] ?? 300
);

$clientIp = $_SERVER['REMOTE_ADDR'];

// Check if IP is blocked
if ($bruteForce->isBlocked($clientIp)) {
  $remainingTime = $bruteForce->getRemainingBlockTime($clientIp);
  http_response_code(403);
  echo json_encode([
    'error' => 'Too many failed attempts. IP blocked.',
    'retry_after' => $remainingTime
  ]);
  exit;
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
  // Record failed attempt
  $bruteForce->recordFailedAttempt($clientIp);
  
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

// Reset attempts on successful authentication
$bruteForce->resetAttempts($clientIp);

// Clean old files periodically (1% chance)
if (rand(1, 100) === 1) {
  $bruteForce->cleanOldFiles();
}

// Helpers
function isAllowedExtension(string $path): bool {
  $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
  $filename = strtolower(basename($path));
  
  // Check extensions
  $allowedExtensions = [
    'log', 'txt', 'out', 'err', 'evt', 'evtx', 'access', 'error', 'trc', 'ldf', 
    'binlog', 'audit', 'trace', 'debug', 'json', 'xml', 'csv'
  ];
  
  // Check specific filenames (without extension)
  $allowedFilenames = [
    'access_log', 'error_log', 'ssl_access_log', 'ssl_error_log', 'php_errorlog',
    'php_errors', 'syslog', 'messages', 'kern.log', 'auth.log', 'mail.log',
    'cron.log', 'daemon.log', 'user.log', 'lastlog', 'wtmp', 'btmp', 'utmp',
    'secure', 'maillog', 'httpd_access_log', 'httpd_error_log', 'catalina.out',
    'gc.log', 'application.log', 'system.log', 'install.log', 'boot.log',
    'dmesg', 'xferlog', 'sulog', 'faillog'
  ];
  
  return in_array($ext, $allowedExtensions, true) || in_array($filename, $allowedFilenames, true);
}

function normalizePath(string $path, string $root): string {
  // avoid traversal; resolve to realpath when possible
  $full = $path;
  
  // Handle relative paths that start with /
  if (strpos($path, '/') === 0 && !preg_match('/^[a-zA-Z]:\\\\/', $path)) {
    // This is a relative path from web root, convert to absolute
    $webRoot = dirname(__DIR__);
    $full = $webRoot . $path;
  } elseif (!preg_match('/^([a-zA-Z]:\\\\|\\\\\\\\|\/)?.*/', $full)) {
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
    continue; // Skip invalid files silently
  }
  $abs = normalizePath($path, DIRECTORY_SEPARATOR === '/' ? '/' : substr(__DIR__, 0, 2));
  // ensure file resides under server root or accessible path and exists
  if (!is_file($abs) || !is_readable($abs)) {
    continue; // Skip unreadable files silently
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
  
  // Track if content was truncated
  $truncated = false;
  
  // Apply character limit if specified
  if ($charLimit > 0 && strlen((string)$content) > $charLimit) {
    $content = substr((string)$content, -$charLimit);
    $truncated = true;
    // Try to find a line break to avoid cutting in the middle of a line
    $nlPos = strpos($content, "\n");
    if ($nlPos !== false && $nlPos < 100) {
      $content = substr($content, $nlPos + 1);
    }
  }
  
  $result = [
    'path' => $path,
    'size' => strlen((string)$content),
    'content_log' => $content
  ];
  
  // Only add truncated field if content was actually truncated
  if ($truncated) {
    $result['truncated'] = true;
  }
  
  $results[] = $result;
  if ($deleteAfter) {
    @unlink($abs);
  }
}

// Return only the results array with clean output
if (isset($_GET['pretty'])) {
  echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_IGNORE);
} else {
  echo json_encode($results, JSON_INVALID_UTF8_IGNORE);
}


