const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

if (configuredApiBase && typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`${configuredApiBase}${input.slice(4)}`, init);
    }

    return originalFetch(input, init);
  };
}
