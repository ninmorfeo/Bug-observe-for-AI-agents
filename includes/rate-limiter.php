<?php
declare(strict_types=1);

/**
 * Simple file-based rate limiter
 */
class RateLimiter {
  private $cacheDir;
  private $maxRequests;
  private $windowSeconds;
  
  public function __construct(int $maxRequests = 60, int $windowSeconds = 60) {
    $this->cacheDir = dirname(__DIR__) . '/data/rate_limit/';
    $this->maxRequests = $maxRequests;
    $this->windowSeconds = $windowSeconds;
    
    if (!is_dir($this->cacheDir)) {
      @mkdir($this->cacheDir, 0755, true);
    }
  }
  
  public function checkLimit(string $identifier): bool {
    $file = $this->cacheDir . md5($identifier) . '.txt';
    $now = time();
    
    // Clean old entries
    $this->cleanOldFiles();
    
    if (file_exists($file)) {
      $data = json_decode(file_get_contents($file), true);
      
      // Reset if window expired
      if ($now - $data['first_request'] > $this->windowSeconds) {
        $data = ['first_request' => $now, 'count' => 1];
      } else {
        $data['count']++;
      }
    } else {
      $data = ['first_request' => $now, 'count' => 1];
    }
    
    file_put_contents($file, json_encode($data));
    
    return $data['count'] <= $this->maxRequests;
  }
  
  private function cleanOldFiles(): void {
    $files = glob($this->cacheDir . '*.txt');
    $now = time();
    
    foreach ($files as $file) {
      if (filemtime($file) < $now - $this->windowSeconds * 2) {
        @unlink($file);
      }
    }
  }
}