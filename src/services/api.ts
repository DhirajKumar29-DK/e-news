const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let rawEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!rawEndpoint.startsWith('/v1/')) {
    rawEndpoint = `/v1${rawEndpoint}`;
  }
  const baseUrl = API_BASE_URL.replace(/\/v1\/?$/, '');
  const url = `${baseUrl}${rawEndpoint}`;

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
      throw new Error(data.message || data.error || `HTTP error! Status: ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    throw err;
  }
}
