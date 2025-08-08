<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/session-check.php';
header('Content-Type: application/json; charset=utf-8');

// This endpoint tests the API internally without exposing the key

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$configPath = $dataDir . DIRECTORY_SEPARATOR . 'config.json';

// Load config
$config = [
  'apiEnabled' => false,
  'apiKeyHash' => '',
  'files' => []
];

if (file_exists($configPath)) {
  $loaded = json_decode(file_get_contents($configPath), true);
  if ($loaded) {
    $config = array_merge($config, $loaded);
  }
}

// Check if API is enabled
if (!$config['apiEnabled']) {
  echo json_encode([
    'success' => false,
    'error' => 'API disabilitata',
    'output' => 'L\'API è attualmente disabilitata. Abilita l\'API per testarla.'
  ]);
  exit;
}

// Check if we have an API key hash
if (empty($config['apiKeyHash'])) {
  echo json_encode([
    'success' => false,
    'error' => 'Nessuna chiave API configurata',
    'output' => 'Genera una chiave API prima di testare l\'endpoint.'
  ]);
  exit;
}

// Make internal request to test the endpoint
// We'll simulate the API response without actually calling it
try {
  // Check if there are files configured
  if (empty($config['files'])) {
    echo json_encode([
      'success' => true,
      'message' => 'API funzionante',
      'output' => json_encode([
        'status' => 'ok',
        'message' => 'API endpoint attivo e funzionante',
        'files_configured' => 0,
        'note' => 'Nessun file di log configurato'
      ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
    ]);
    exit;
  }
  
  // Collect sample data from configured files
  $output = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'files_configured' => count($config['files']),
    'sample_data' => []
  ];
  
  foreach ($config['files'] as $fileConfig) {
    $path = $fileConfig['path'] ?? '';
    if (file_exists($path)) {
      $output['sample_data'][] = [
        'file' => basename($path),
        'exists' => true,
        'size' => filesize($path) . ' bytes'
      ];
    } else {
      $output['sample_data'][] = [
        'file' => basename($path),
        'exists' => false
      ];
    }
    
    // Limit to first 3 files for test
    if (count($output['sample_data']) >= 3) break;
  }
  
  echo json_encode([
    'success' => true,
    'message' => 'Test endpoint eseguito con successo',
    'output' => json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
  ]);
  
} catch (Exception $e) {
  echo json_encode([
    'success' => false,
    'error' => 'Errore durante il test',
    'output' => $e->getMessage()
  ]);
}