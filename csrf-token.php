<?php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');

// Generate or retrieve CSRF token
if (empty($_SESSION['csrf_token'])) {
  $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

echo json_encode([
  'token' => $_SESSION['csrf_token']
]);