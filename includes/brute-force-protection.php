<?php
declare(strict_types=1);

/**
 * Brute force protection implementation
 */
class BruteForceProtection {
  private $dataDir;
  private $maxAttempts;
  private $blockDuration;
  
  public function __construct(int $maxAttempts = 10, int $blockDuration = 300) {
    $this->dataDir = dirname(__DIR__) . '/data/failed_attempts/';
    $this->maxAttempts = $maxAttempts;
    $this->blockDuration = $blockDuration;
    
    if (!is_dir($this->dataDir)) {
      @mkdir($this->dataDir, 0755, true);
    }
  }
  
  /**
   * Check if an IP is blocked
   */
  public function isBlocked(string $ip): bool {
    $file = $this->dataDir . md5($ip) . '.json';
    
    if (!file_exists($file)) {
      return false;
    }
    
    $data = json_decode(file_get_contents($file), true);
    if (!$data) {
      return false;
    }
    
    // Check if block period has expired
    if (isset($data['blocked_until'])) {
      if (time() < $data['blocked_until']) {
        return true;
      } else {
        // Block expired, reset attempts
        $this->resetAttempts($ip);
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Record a failed login attempt
   */
  public function recordFailedAttempt(string $ip): void {
    $file = $this->dataDir . md5($ip) . '.json';
    
    $data = [];
    if (file_exists($file)) {
      $data = json_decode(file_get_contents($file), true) ?: [];
    }
    
    // Initialize or increment attempts
    if (!isset($data['attempts'])) {
      $data['attempts'] = 1;
      $data['first_attempt'] = time();
    } else {
      $data['attempts']++;
    }
    
    $data['last_attempt'] = time();
    
    // Check if should block
    if ($data['attempts'] >= $this->maxAttempts) {
      $data['blocked_until'] = time() + $this->blockDuration;
      $data['block_reason'] = 'Too many failed API key attempts';
    }
    
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
  }
  
  /**
   * Reset attempts for an IP (successful login)
   */
  public function resetAttempts(string $ip): void {
    $file = $this->dataDir . md5($ip) . '.json';
    if (file_exists($file)) {
      @unlink($file);
    }
  }
  
  /**
   * Get remaining block time in seconds
   */
  public function getRemainingBlockTime(string $ip): int {
    $file = $this->dataDir . md5($ip) . '.json';
    
    if (!file_exists($file)) {
      return 0;
    }
    
    $data = json_decode(file_get_contents($file), true);
    if (!$data || !isset($data['blocked_until'])) {
      return 0;
    }
    
    $remaining = $data['blocked_until'] - time();
    return max(0, $remaining);
  }
  
  /**
   * Clean old attempt files
   */
  public function cleanOldFiles(): void {
    $files = glob($this->dataDir . '*.json');
    $now = time();
    
    foreach ($files as $file) {
      $data = json_decode(file_get_contents($file), true);
      if (!$data) {
        @unlink($file);
        continue;
      }
      
      // Remove files older than 24 hours with no recent activity
      if (isset($data['last_attempt']) && ($now - $data['last_attempt']) > 86400) {
        @unlink($file);
      }
    }
  }
}