/**
 * Dynamic API Base URL resolver:
 * - If VITE_API_BASE_URL is provided, use that.
 * - If running locally on localhost, use local FastAPI port 8000.
 * - In Vercel cloud deployment, relative URL '' routes to same-origin /api/... serverless functions.
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000';
  }
  return '';
};
