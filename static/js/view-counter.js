const PLACEHOLDER_BASES = new Set([
  'https://your-backend-domain.com',
  'http://your-backend-domain.com',
  'https://example.com',
  'http://example.com',
  'null'
]);

const scriptElement = document.currentScript || document.getElementById('view-counter-script');

function normalizeBase(base) {
  if (typeof base !== 'string') {
    return '';
  }
  return base.trim().replace(/\/+$/, '');
}

function collectConfiguredBases() {
  const bases = [];

  const addBase = (value) => {
    if (typeof value !== 'string') {
      return;
    }
    const trimmed = value.trim();
    if (!trimmed || PLACEHOLDER_BASES.has(trimmed)) {
      return;
    }
    bases.push(normalizeBase(trimmed));
  };

  if (scriptElement && scriptElement.dataset) {
    addBase(scriptElement.dataset.apiBase);
  }

  if (typeof window !== 'undefined') {
    addBase(window.OSSPREY_VIEW_COUNTER_API_BASE);

    if (window.location && window.location.origin) {
      addBase(window.location.origin);
    }
  }

  const metaBase = document
    .querySelector('meta[name="ossprey-view-counter-api-base"]')
    ?.getAttribute('content');
  addBase(metaBase);

  const uniqueBases = Array.from(new Set(bases.filter((base) => base !== '')));
  uniqueBases.push('');
  return uniqueBases;
}

const API_BASES = collectConfiguredBases();

function joinUrl(base, path) {
  if (!base) {
    return path;
  }

  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function fetchWithFallback(path, options) {
  let lastError = null;

  for (const base of API_BASES) {
    const url = joinUrl(base, path);

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        lastError = new Error(`Request to ${url} failed with status ${response.status}`);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('All view counter API requests failed.');
}

function updateViewCountElement(value) {
  const element = document.getElementById('view-count');
  if (!element) {
    return;
  }
  element.textContent = value;
}

async function recordView() {
  try {
    await fetchWithFallback('/api/record_view', {
      method: 'POST',
      mode: 'cors'
    });
  } catch (err) {
    console.error('record_view endpoint failed', err);
  }
}

async function parseCountResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();

    if (typeof data === 'number') {
      return data;
    }

    if (data && typeof data.count === 'number') {
      return data.count;
    }

    if (data && typeof data.view_count === 'number') {
      return data.view_count;
    }

    const numericValue = Object.values(data).find((value) => typeof value === 'number');
    if (typeof numericValue === 'number') {
      return numericValue;
    }
  }

  const text = await response.text();
  const parsed = parseInt(text, 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  throw new Error('Unable to parse view count from response.');
}

async function fetchViewCount() {
  try {
    const response = await fetchWithFallback('/api/view_count', {
      method: 'GET',
      mode: 'cors'
    });
    const count = await parseCountResponse(response);
    updateViewCountElement(count.toLocaleString());
  } catch (err) {
    console.error('view_count endpoint failed', err);
    updateViewCountElement('N/A');
  }
}

async function initializeViewCounter() {
  const element = document.getElementById('view-count');
  if (!element) {
    return;
  }

  updateViewCountElement('...');
  await recordView();
  await fetchViewCount();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeViewCounter();
});
