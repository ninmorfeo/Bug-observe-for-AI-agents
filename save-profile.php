<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$nickname = trim($input['nickname'] ?? '');
$email = trim($input['email'] ?? '');

// Email is required
if (empty($email)) {
  http_response_code(400);
  echo json_encode(['error' => 'Email obbligatoria']);
  exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['error' => 'Email non valida']);
  exit;
}

// Configuration
$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$adminConfigPath = $dataDir . DIRECTORY_SEPARATOR . 'admin.json';

// Load current admin configuration
$adminConfig = [];
if (file_exists($adminConfigPath)) {
  $adminConfig = json_decode(file_get_contents($adminConfigPath), true) ?: [];
}

// Update profile data
$adminConfig['nickname'] = $nickname;
$adminConfig['email'] = $email;
$adminConfig['profileUpdatedAt'] = date('Y-m-d H:i:s');

// Save configuration
if (file_put_contents($adminConfigPath, json_encode($adminConfig, JSON_PRETTY_PRINT))) {
  // Update session
  $_SESSION['admin_nickname'] = $nickname;
  $_SESSION['admin_email'] = $email;
  
  echo json_encode([
    'success' => true,
    'message' => 'Profilo aggiornato con successo',
    'data' => [
      'nickname' => $nickname,
      'email' => $email
    ]
  ]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Errore nel salvataggio del profilo']);
}