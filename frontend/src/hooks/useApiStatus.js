import { useState, useEffect } from 'react';

/**
 * Hook that keeps track of backend availability.
 * Returns one of: 'checking' | 'online' | 'offline'.
 * It pings the base URL once immediately and then at a given interval.
 *
 * @param {string} baseUrl Backend base URL (e.g., https://api.example.com)
 * @param {number} pollIntervalMs How often to re-check, default 30 s.
 */
export default function useApiStatus(baseUrl, pollIntervalMs = 30000) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!baseUrl) return undefined;
    let cancelled = false;

    const ping = async () => {
      try {
        await fetch(baseUrl, { method: 'GET', mode: 'no-cors' });
        if (!cancelled) setStatus('online');
      } catch (_) {
        if (!cancelled) setStatus('offline');
      }
    };

    // Initial check
    ping();

    // Periodic polling
    const id = setInterval(ping, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [baseUrl, pollIntervalMs]);

  return status;
}