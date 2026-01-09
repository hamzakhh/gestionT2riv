// ==============================|| CHUNK ERROR HANDLER ||============================== //

/**
 * Handles chunk loading errors by automatically retrying or reloading the page
 * This is useful when the app is updated and old chunks are no longer available
 */

let retryCount = 0;
const MAX_RETRIES = 3;

export function handleChunkError(error) {
  const isChunkError = 
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError') ||
    error?.name === 'ChunkLoadError';

  if (isChunkError && retryCount < MAX_RETRIES) {
    retryCount++;
    console.warn(`Chunk loading error detected. Retry attempt ${retryCount}/${MAX_RETRIES}`);
    
    // Clear the cache and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true; // Error handled
  }
  
  if (isChunkError && retryCount >= MAX_RETRIES) {
    console.error('Max retries reached for chunk loading. User intervention required.');
    retryCount = 0; // Reset for next session
  }
  
  return false; // Error not handled
}

// Listen for unhandled chunk errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (handleChunkError(event.error || event)) {
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (handleChunkError(event.reason)) {
      event.preventDefault();
    }
  });
}
