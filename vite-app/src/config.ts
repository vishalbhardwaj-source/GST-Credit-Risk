/**
 * Dynamic API Base URL resolver:
 * - If VITE_API_BASE_URL is explicitly set, use that.
 * - If running locally on localhost, use local FastAPI port 8000.
 * - In Vercel cloud deployment, if relative /api is unavailable or on a separate backend,
 *   fall back cleanly to the deployed Render backend service.
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000';
  }
  // Production Cloud API endpoint hosted on Render:
  return 'https://gst-credit-risk-api.onrender.com';
};
