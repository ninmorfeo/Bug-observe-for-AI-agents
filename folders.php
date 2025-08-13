<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

// Explore a base directory and return a filtered tree of folders and log-like files

// Secure base directory handling
$allowedBase = realpath(dirname(__DIR__)); // default: project root
$base = $allowedBase;

// Function to normalize paths for cross-platform compatibility
function normalizePathForOutput(string $path): string {
  global $allowedBase;
  
  // Convert Windows path separators to forward slashes for consistency
  $normalized = str_replace('\\', '/', $path);
  $normalizedBase = str_replace('\\', '/', $allowedBase);
  
  // If path starts with the base, make it relative to web root
  if (strpos($normalized, $normalizedBase) === 0) {
    $relativePath = substr($normalized, strlen($normalizedBase));
    return '/' . ltrim($relativePath, '/');
  }
  
  return $normalized;
}

if (isset($_GET['base'])) {
  $requested = realpath($_GET['base']);
  // Only allow if the requested path is within the allowed base
  if ($requested !== false && strpos($requested, $allowedBase) === 0) {
    $base = $requested;
  }
}

function isAllowed(string $file): bool {
  $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
  return in_array($ext, ['log','txt','err'], true);
}

function scanDirTree(string $dir, int $depth = 0, int $maxDepth = 4): array {
  $node = [
    'type' => 'dir',
    'name' => basename($dir) ?: $dir,
    'path' => $dir,
    'children' => []
  ];
  if ($depth > $maxDepth) return $node;
  $items = @scandir($dir) ?: [];
  foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    $abs = $dir . DIRECTORY_SEPARATOR . $item;
    if (is_dir($abs)) {
      $node['children'][] = scanDirTree($abs, $depth + 1, $maxDepth);
    } else if (is_file($abs) && isAllowed($abs)) {
      $node['children'][] = [
        'type' => 'file',
        'name' => $item,
        'path' => normalizePathForOutput($abs)
      ];
    }
  }
  return $node;
}

$tree = scanDirTree($base);
echo json_encode($tree, JSON_UNESCAPED_SLASHES);


