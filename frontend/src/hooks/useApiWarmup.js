import { useEffect } from 'react';

/**
 * React hook to ensure the Render.com-hosted API is awake when the front-end loads.
 * It pings the API once. If the ping fails (often because the dyno is asleep),
 * it silently loads the API base URL in a hidden iframe to wake it up, then
 * re-pings after a short delay.
 *
 * @param {string} baseUrl – Base URL of the backend (e.g. https://samvidhaan-saral-api.onrender.com)
 * @param {number} retryDelayMs – How long to wait before re-checking, default 10 000 ms.
 */
export default function useApiWarmup(baseUrl, retryDelayMs = 10000) {
  useEffect(() => {
    if (!baseUrl) return;

    const ping = () => fetch(baseUrl, { method: 'GET', mode: 'no-cors' });

    const wakeUp = async () => {
      try {
        await ping(); // Success => API already awake
      } catch (_) {
        // Likely asleep – create hidden iframe to wake the dyno
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = baseUrl;
        document.body.appendChild(iframe);

        // Re-check after delay, then remove iframe regardless
        const timer = setTimeout(async () => {
          try {
            await ping();
          } finally {
            document.body.removeChild(iframe);
          }
        }, retryDelayMs);

        return () => clearTimeout(timer);
      }
    };

    const cleanup = wakeUp();
    // eslint-disable-next-line consistent-return
    return cleanup;
  }, [baseUrl, retryDelayMs]);
}