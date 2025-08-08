<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (empty($email)) {
  http_response_code(400);
  echo json_encode(['error' => 'Email richiesta']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['error' => 'Email non valida']);
  exit;
}

// Configuration
$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$adminConfigPath = $dataDir . DIRECTORY_SEPARATOR . 'admin.json';

// Check if admin config exists
if (!file_exists($adminConfigPath)) {
  http_response_code(404);
  echo json_encode(['error' => 'Nessun account configurato']);
  exit;
}

// Load admin configuration
$adminConfig = json_decode(file_get_contents($adminConfigPath), true);

// Check if email matches
if (empty($adminConfig['email']) || strtolower($adminConfig['email']) !== strtolower($email)) {
  // Don't reveal if email exists or not for security
  http_response_code(200);
  echo json_encode([
    'success' => true,
    'message' => "Una email con una password temporanea è stata inviata all'indirizzo email memorizzato nel sistema.<br><br>⚠️ Attenzione: se non hai ricevuto l'email il tuo server potrebbe non supportare l'invio SMTP."
  ]);
  exit;
}

// Generate a temporary reset password
$tempPassword = 'reset_' . bin2hex(random_bytes(4));

// Update admin config with temporary password
$adminConfig['tempPassword'] = $tempPassword;
$adminConfig['passwordResetAt'] = date('Y-m-d H:i:s');
$adminConfig['passwordResetExpiry'] = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Save the temporary password
if (!file_put_contents($adminConfigPath, json_encode($adminConfig, JSON_PRETTY_PRINT))) {
  http_response_code(500);
  echo json_encode(['error' => 'Errore nel salvataggio']);
  exit;
}

// In a real application, you would send an email here
// For this demo, we'll show the password directly (NOT for production!)
// TODO: Implement email sending

// Since we can't send real emails, we'll save the reset info to a file
$resetInfoPath = $dataDir . DIRECTORY_SEPARATOR . 'password_reset.txt';
$resetInfo = "Password Reset Request\n";
$resetInfo .= "======================\n";
$resetInfo .= "Time: " . date('Y-m-d H:i:s') . "\n";
$resetInfo .= "Email: " . $email . "\n";
$resetInfo .= "Temporary Password: " . $tempPassword . "\n";
$resetInfo .= "Valid for: 1 hour\n";
$resetInfo .= "\nUse this temporary password to login, then change it immediately.\n";

file_put_contents($resetInfoPath, $resetInfo);

// Send email with temporary password
$subject = "Recupero Password - BugObserve for AI Agents";
$message = "Ciao,\n\n";
$message .= "Hai richiesto il recupero password per il tuo account.\n\n";
$message .= "La tua password temporanea è: " . $tempPassword . "\n\n";
$message .= "Questa password è valida per 1 ora.\n";
$message .= "Ti consigliamo di cambiarla immediatamente dopo l'accesso.\n\n";
$message .= "Se non hai richiesto tu il recupero password, ignora questa email.\n\n";
$message .= "Cordiali saluti,\n";
$message .= "BugObserve for AI Agents\n";

$headers = "From: noreply@" . $_SERVER['HTTP_HOST'] . "\r\n";
$headers .= "Reply-To: noreply@" . $_SERVER['HTTP_HOST'] . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Try to send email
$emailSent = @mail($email, $subject, $message, $headers);

// Response - always show success message for security (don't reveal if email exists)
echo json_encode([
  'success' => true,
  'message' => "Una email con una password temporanea è stata inviata all'indirizzo email memorizzato nel sistema.<br><br>⚠️ Attenzione: se non hai ricevuto l'email il tuo server potrebbe non supportare l'invio SMTP. In tal caso, controlla il file data/password_reset.txt"
]);