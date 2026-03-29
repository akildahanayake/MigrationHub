import { apiFetch, getCurrentApiBase, getCurrentBackendOrigin } from './apiClient';

export interface UploadedFileInfo {
  originalName: string;
  storedName: string;
  size: number;
  mimeType: string;
  url: string;
}

export function toBackendUrl(urlOrPath: string): string {
  if (!urlOrPath) return urlOrPath;
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://') || urlOrPath.startsWith('blob:')) {
    return urlOrPath;
  }

  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  const apiBase = getCurrentApiBase();
  const backendOrigin = getCurrentBackendOrigin();
  const apiBasePath = new URL(apiBase, window.location.origin).pathname.replace(/\/+$/, '');

  // Backward compatibility: map legacy "/api/..." file links when current API base is "/backend/api".
  if (path.startsWith('/api/') && apiBasePath.endsWith('/api') && apiBasePath !== '/api') {
    const prefix = apiBasePath.slice(0, -4);
    return `${backendOrigin}${prefix}${path}`;
  }

  return `${backendOrigin}${path}`;
}

export async function uploadFile(file: File, uploader: string): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploader', uploader);

  const response = await apiFetch('/upload.php', {
    method: 'POST',
    body: formData,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Upload failed: invalid server response');
  }

  if (!response.ok || !payload?.success || !payload?.file) {
    throw new Error(payload?.error || 'Upload failed');
  }

  return {
    ...payload.file,
    url: toBackendUrl(payload.file.url),
  };
}
