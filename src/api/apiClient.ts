const RAW_CONFIGURED_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim();

function normalizeBase(base: string): string {
  return base.trim().replace(/\/+$/, '');
}

function buildPathAwareSameOriginBases(): string[] {
  if (typeof window === 'undefined') {
    return ['/api', '/backend/api'];
  }

  const seen = new Set<string>();
  const out: string[] = [];
  const pathname = window.location.pathname || '/';
  const segments = pathname.split('/').filter(Boolean);

  // Build candidate base paths from deepest to root.
  for (let i = segments.length; i >= 0; i--) {
    const prefix = i > 0 ? `/${segments.slice(0, i).join('/')}` : '';
    const apiBase = normalizeBase(`${prefix}/api`);
    const backendApiBase = normalizeBase(`${prefix}/backend/api`);

    if (!seen.has(apiBase)) {
      seen.add(apiBase);
      out.push(apiBase);
    }

    if (!seen.has(backendApiBase)) {
      seen.add(backendApiBase);
      out.push(backendApiBase);
    }
  }

  return out.length > 0 ? out : ['/api', '/backend/api'];
}

const LOCAL_DEV_DEFAULT_BASES = [
  'http://localhost:8000/api',
  'http://localhost:8000/backend/api',
];

let cachedApiBase = '';

function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function isBrowserRunningOnLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  return isLocalHostname(window.location.hostname);
}

function isLocalDevUrl(value: string): boolean {
  try {
    const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return isLocalHostname(parsed.hostname);
  } catch {
    return false;
  }
}

function buildBaseCandidates(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const runningLocal = isBrowserRunningOnLocalhost();
  const sameOriginDefaults = buildPathAwareSameOriginBases();
  const configured = normalizeBase(RAW_CONFIGURED_BASE);
  const configuredIsLocalDev = configured ? isLocalDevUrl(configured) : false;

  const candidates = configured
    ? (
        configuredIsLocalDev && !runningLocal
          ? [...sameOriginDefaults, configured, ...LOCAL_DEV_DEFAULT_BASES]
          : [configured, ...sameOriginDefaults, ...LOCAL_DEV_DEFAULT_BASES]
      )
    : (runningLocal
        ? [...LOCAL_DEV_DEFAULT_BASES, ...sameOriginDefaults]
        : [...sameOriginDefaults]);

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeBase(candidate);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }

  return out;
}

function buildApiUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function getCurrentApiBase(): string {
  if (cachedApiBase) return cachedApiBase;
  const candidates = buildBaseCandidates();
  return candidates[0] || '/api';
}

export function getCurrentBackendOrigin(): string {
  const base = getCurrentApiBase();
  try {
    return new URL(base, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const candidates = buildBaseCandidates();
  if (cachedApiBase) {
    const idx = candidates.indexOf(cachedApiBase);
    if (idx > 0) {
      candidates.splice(idx, 1);
      candidates.unshift(cachedApiBase);
    }
  }

  let first404: Response | null = null;
  let lastError: unknown = null;

  for (const base of candidates) {
    const url = buildApiUrl(base, path);
    try {
      const response = await fetch(url, init);

      if (response.status === 404) {
        if (!first404) first404 = response;
        continue;
      }

      cachedApiBase = base;
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  if (first404) {
    return first404;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('Failed to reach backend API');
}
