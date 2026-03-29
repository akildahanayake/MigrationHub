import { apiFetch } from './apiClient';

export type PersistedAppState = Record<string, any>;

export async function fetchAppState(): Promise<PersistedAppState | null> {
  try {
    const response = await apiFetch('/state.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (!payload?.success) {
      return null;
    }

    return payload.data && typeof payload.data === 'object' ? payload.data : null;
  } catch (error) {
    console.warn('Could not load server state:', error);
    return null;
  }
}

export async function saveAppState(data: PersistedAppState): Promise<boolean> {
  try {
    const response = await apiFetch('/state.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return !!payload?.success;
  } catch (error) {
    console.warn('Could not save server state:', error);
    return false;
  }
}
