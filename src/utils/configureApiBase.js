const DEFAULT_API_BASE_URL =
  'https://system-backend.school-system.knoxverse.com/api';

const configuredApiBase = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

console.log('[EduSync] API Base URL:', configuredApiBase);

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      const backendUrl = `${configuredApiBase}${input.slice(4)}`;

      console.log('[EduSync] API request:', backendUrl);

      return originalFetch(backendUrl, init);
    }

    return originalFetch(input, init);
  };
}
