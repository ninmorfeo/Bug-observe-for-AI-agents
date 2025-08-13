<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

// Configuration
$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$adminConfigPath = $dataDir . DIRECTORY_SEPARATOR . 'admin.json';

// Load current admin configuration
$adminConfig = [];
if (file_exists($adminConfigPath)) {
  $adminConfig = json_decode(file_get_contents($adminConfigPath), true) ?: [];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = $input['currentPassword'] ?? '';
$newPassword = $input['newPassword'] ?? '';
$confirmPassword = $input['confirmPassword'] ?? '';

// Validate input
if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
  http_response_code(400);
  echo json_encode(['error' => 'Tutti i campi sono obbligatori']);
  exit;
}

// Check if new passwords match
if ($newPassword !== $confirmPassword) {
  http_response_code(400);
  echo json_encode(['error' => 'Le nuove password non coincidono']);
  exit;
}

// Validate password strength
if (strlen($newPassword) < 8) {
  http_response_code(400);
  echo json_encode(['error' => 'La password deve essere di almeno 8 caratteri']);
  exit;
}

// Verify current password
$currentPasswordValid = false;
if (!empty($adminConfig['passwordHash'])) {
  $currentPasswordValid = password_verify($currentPassword, $adminConfig['passwordHash']);
} else if (!empty($adminConfig['tempPassword'])) {
  // Handle case where admin still uses temp password
  $currentPasswordValid = ($currentPassword === $adminConfig['tempPassword']);
}

if (!$currentPasswordValid) {
  http_response_code(401);
  echo json_encode(['error' => 'Password attuale non corretta']);
  exit;
}

// Check if new password is same as current
if ($currentPassword === $newPassword) {
  http_response_code(400);
  echo json_encode(['error' => 'La nuova password deve essere diversa da quella attuale']);
  exit;
}

// Update password
$adminConfig['username'] = $adminConfig['username'] ?? 'admin';
$adminConfig['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
$adminConfig['passwordChangedAt'] = date('Y-m-d H:i:s');
unset($adminConfig['tempPassword']); // Remove temp password if exists

// Save configuration
if (file_put_contents($adminConfigPath, json_encode($adminConfig, JSON_PRETTY_PRINT))) {
  echo json_encode([
    'success' => true,
    'message' => 'Password cambiata con successo'
  ]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Errore nel salvataggio della nuova password']);
}