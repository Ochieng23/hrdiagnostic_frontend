const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api/v1' : '');

function getApiUrl() {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return API_URL;
}

async function request(path, options) {
  const res = await fetch(`${getApiUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.error?.message ||
      json?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json?.data;
}

class ApiClient {
  async createSession(orgName) {
    return request('/sessions', {
      method: 'POST',
      body: JSON.stringify({ orgName: orgName || '' }),
    });
  }

  async getSession(shareId) {
    return request(`/sessions/${shareId}`);
  }

  async updateSession(shareId, patch) {
    return request(`/sessions/${shareId}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  }

  async finalizeSession(shareId) {
    return request(`/sessions/${shareId}/finalize`, {
      method: 'POST',
    });
  }

  async deleteSession(shareId) {
    await request(`/sessions/${shareId}`, { method: 'DELETE' });
  }

  // returns { data: session[], pagination: { total, page, limit, pages } }
  async listSessions({ page = 1, limit = 50, status } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    const res = await fetch(`${getApiUrl()}/sessions?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to list sessions');
    return json; // { success, data, pagination }
  }
}

export const api = new ApiClient();
