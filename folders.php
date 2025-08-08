<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

// Explore a base directory and return a filtered tree of folders and log-like files

$base = dirname(__DIR__); // default: project root
if (isset($_GET['base'])) {
  $req = (string)$_GET['base'];
  // rudimentary traversal protection
  if (strpos($req, '..') === false) {
    $base = $req;
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
        'path' => $abs
      ];
    }
  }
  return $node;
}

$tree = scanDirTree($base);
echo json_encode($tree, JSON_UNESCAPED_SLASHES);


