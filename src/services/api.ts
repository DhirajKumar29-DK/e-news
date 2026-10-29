import { API_BASE_URL } from '@/config/env';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    // If the path is under /reporter, strictly use reporter_token; if under /admin, strictly use admin_token
    const isReporterPath = window.location.pathname.startsWith('/reporter');
    const isAdminPath = window.location.pathname.startsWith('/admin');

    if (isReporterPath) {
      token = localStorage.getItem('reporter_token');
    } else if (isAdminPath) {
      token = localStorage.getItem('admin_token');
    } else {
      token = localStorage.getItem('admin_token') || localStorage.getItem('reporter_token');
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let rawEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!rawEndpoint.startsWith('/v1/')) {
    rawEndpoint = `/v1${rawEndpoint}`;
  }
  
  const cleanBase = API_BASE_URL.replace(/\/v1\/?$/, '');
  const url = `${cleanBase}${rawEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || `HTTP Error ${response.status}` };
    }

    if (!response.ok) {
      const errorObj: any = new Error(data.message || data.error || `HTTP error! Status: ${response.status}`);
      errorObj.status = response.status;
      errorObj.code = data.errors?.code || data.code;
      throw errorObj;
    }

    return data as T;
  } catch (err: any) {
    throw err;
  }
}
