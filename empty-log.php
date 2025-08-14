<?php
declare(strict_types=1);

// Check admin session first
require_once __DIR__ . '/includes/session-check.php';

header('Content-Type: application/json; charset=utf-8');

// Rate limiting
require_once __DIR__ . '/includes/rate-limiter.php';

$rateLimiter = new RateLimiter(30, 60); // 30 requests per minute for log operations
$clientId = $_SERVER['REMOTE_ADDR'] . ':admin';

if (!$rateLimiter->checkLimit($clientId)) {
  http_response_code(429);
  echo json_encode(['error' => 'Too many requests. Please try again later.']);
  exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Admin session is already verified by session-check.php
// No need to check API key since this is an admin-only operation

// Get request data
$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data) || empty($data['path'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing log path']);
  exit;
}

$logPath = $data['path'];

// Validate path (basic security check)
if (strpos($logPath, '..') !== false) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid log path - traversal attempt']);
  exit;
}

// Validate file type
$ext = strtolower(pathinfo($logPath, PATHINFO_EXTENSION));
$filename = strtolower(basename($logPath));

$allowedExtensions = [
  'log', 'txt', 'out', 'err', 'evt', 'evtx', 'access', 'error', 'trc', 'ldf', 
  'binlog', 'audit', 'trace', 'debug', 'json', 'xml', 'csv'
];

$allowedFilenames = [
  'access_log', 'error_log', 'ssl_access_log', 'ssl_error_log', 'php_errorlog',
  'php_errors', 'syslog', 'messages', 'kern.log', 'auth.log', 'mail.log',
  'cron.log', 'daemon.log', 'user.log', 'lastlog', 'wtmp', 'btmp', 'utmp',
  'secure', 'maillog', 'httpd_access_log', 'httpd_error_log', 'catalina.out',
  'gc.log', 'application.log', 'system.log', 'install.log', 'boot.log',
  'dmesg', 'xferlog', 'sulog', 'faillog'
];

if (!in_array($ext, $allowedExtensions, true) && !in_array($filename, $allowedFilenames, true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid log file type']);
  exit;
}

// Normalize path - handle relative paths from web root
$absPath = $logPath;
if (strpos($logPath, '/') === 0 && !preg_match('/^[a-zA-Z]:\\\\/', $logPath)) {
  // This is a relative path from web root, convert to absolute
  $webRoot = dirname(__DIR__);
  $absPath = $webRoot . $logPath;
}

// Check if file exists
if (!file_exists($absPath)) {
  http_response_code(404);
  echo json_encode(['error' => 'Log file not found at: ' . $logPath]);
  exit;
}

// Note: Skip is_writable() check as it might fail even when PHP can write
// We'll try to open the file directly and handle the error

// Empty the log file by truncating it (use @ to suppress errors like the main endpoint)
$handle = @fopen($absPath, 'w');
if ($handle === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Cannot open file for writing (check permissions or .htaccess)']);
  exit;
}

@fclose($handle);

echo json_encode(['success' => true, 'message' => 'Log file emptied successfully']);