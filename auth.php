<?php
declare(strict_types=1);
session_start();

require_once __DIR__ . '/includes/brute-force-protection.php';

header('Content-Type: application/json; charset=utf-8');

// Configuration
$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
@mkdir($dataDir, 0755, true);
$adminConfigPath = $dataDir . DIRECTORY_SEPARATOR . 'admin.json';

// Default admin credentials (will be hashed on first save)
$defaultAdmin = [
  'username' => 'admin',
  'passwordHash' => null,
  'tempPassword' => 'changeme123' // Temporary password for first login
];

// Load admin configuration
$adminConfig = $defaultAdmin;
if (file_exists($adminConfigPath)) {
  $loaded = json_decode(file_get_contents($adminConfigPath), true);
  if ($loaded) {
    $adminConfig = array_merge($defaultAdmin, $loaded);
  }
}

// Initialize brute force protection for admin login
$bruteForce = new BruteForceProtection(5, 900); // 5 attempts, 15 min block
$clientIp = $_SERVER['REMOTE_ADDR'];

// Check if IP is blocked
if ($bruteForce->isBlocked($clientIp)) {
  $remainingTime = $bruteForce->getRemainingBlockTime($clientIp);
  http_response_code(403);
  echo json_encode([
    'success' => false,
    'error' => 'Troppi tentativi falliti. Riprova tra ' . ceil($remainingTime / 60) . ' minuti.',
    'blocked' => true,
    'retry_after' => $remainingTime
  ]);
  exit;
}

// Handle login request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $username = $_POST['username'] ?? '';
  $password = $_POST['password'] ?? '';
  
  $authenticated = false;
  
  // Check credentials
  if ($username === $adminConfig['username']) {
    if (!empty($adminConfig['passwordHash'])) {
      // Verify against hash
      $authenticated = password_verify($password, $adminConfig['passwordHash']);
    } else {
      // First login with temp password
      if ($password === $adminConfig['tempPassword']) {
        $authenticated = true;
        // Hash the password for future use
        $adminConfig['passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
        unset($adminConfig['tempPassword']);
        file_put_contents($adminConfigPath, json_encode($adminConfig, JSON_PRETTY_PRINT));
      }
    }
  }
  
  if ($authenticated) {
    // Reset brute force attempts
    $bruteForce->resetAttempts($clientIp);
    
    // Set session
    $_SESSION['admin_authenticated'] = true;
    $_SESSION['admin_username'] = $username;
    $_SESSION['login_time'] = time();
    $_SESSION['last_activity'] = time();
    
    echo json_encode([
      'success' => true,
      'message' => 'Login effettuato con successo'
    ]);
  } else {
    // Record failed attempt
    $bruteForce->recordFailedAttempt($clientIp);
    
    // Calculate remaining attempts
    $attemptsFile = dirname(__DIR__) . '/bugobserve-ai-agents/data/failed_attempts/' . md5($clientIp) . '.json';
    $attemptsData = file_exists($attemptsFile) ? json_decode(file_get_contents($attemptsFile), true) : [];
    $attempts = $attemptsData['attempts'] ?? 0;
    $remaining = max(0, 5 - $attempts);
    
    http_response_code(401);
    echo json_encode([
      'success' => false,
      'error' => 'Credenziali non valide',
      'attempts_remaining' => $remaining
    ]);
  }
  exit;
}

// Handle logout request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  session_destroy();
  echo json_encode([
    'success' => true,
    'message' => 'Logout effettuato'
  ]);
  exit;
}

// Check session status
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $authenticated = !empty($_SESSION['admin_authenticated']);
  
  // Check session timeout (30 minutes of inactivity)
  if ($authenticated) {
    $inactive = time() - ($_SESSION['last_activity'] ?? 0);
    if ($inactive > 1800) {
      session_destroy();
      $authenticated = false;
    } else {
      $_SESSION['last_activity'] = time();
    }
  }
  
  echo json_encode([
    'authenticated' => $authenticated,
    'username' => $_SESSION['admin_username'] ?? null
  ]);
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);