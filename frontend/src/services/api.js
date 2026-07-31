const API_BASE_URL = "http://localhost:5000";

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}/${imagePath}`;
};

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);
  
  // Handle empty responses
  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
