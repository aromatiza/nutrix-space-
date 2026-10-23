/* Nutrix V12: mobile API routing. Backend remains remote; never ship API keys here. */
(() => {
  const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  if (!native) return;
  // Replace only with YOUR production HTTPS backend URL, e.g. https://api.example.com.
  const API_ORIGIN = 'https://YOUR-API-DOMAIN.example';
  if (API_ORIGIN.includes('YOUR-API-DOMAIN')) {
    console.warn('Nutrix mobile: configure HTTPS API endpoint in public/mobile-api.js before building.');
    return;
  }
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
    if (typeof url === 'string' && /^\/api\//.test(url)) return originalFetch(API_ORIGIN + url, init);
    return originalFetch(input, init);
  };
})();
