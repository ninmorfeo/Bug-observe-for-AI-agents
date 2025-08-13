<?php
declare(strict_types=1);

/**
 * Utility script to set/reset admin password
 * Run from command line: php set-admin-password.php <new_password>
 */

if (PHP_SAPI !== 'cli') {
  die("This script can only be run from command line\n");
}

if ($argc < 2) {
  echo "Usage: php set-admin-password.php <new_password>\n";
  echo "Example: php set-admin-password.php MySecurePassword123\n";
  exit(1);
}

$newPassword = $argv[1];

if (strlen($newPassword) < 8) {
  echo "Error: Password must be at least 8 characters long\n";
  exit(1);
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$adminConfigPath = $dataDir . DIRECTORY_SEPARATOR . 'admin.json';

$adminConfig = [
  'username' => 'admin',
  'passwordHash' => password_hash($newPassword, PASSWORD_DEFAULT)
];

if (file_put_contents($adminConfigPath, json_encode($adminConfig, JSON_PRETTY_PRINT))) {
  echo "Admin password successfully updated!\n";
  echo "Username: admin\n";
  echo "Password: " . str_repeat('*', strlen($newPassword)) . " (hidden)\n";
  echo "You can now login at: admin.html\n";
} else {
  echo "Error: Failed to save admin configuration\n";
  exit(1);
}