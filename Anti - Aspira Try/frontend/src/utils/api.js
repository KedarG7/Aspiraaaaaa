const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  const envFallbackUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  const configuredBaseUrl = envUrl || envFallbackUrl || 'http://localhost:5000';
  const trimmedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');

  if (trimmedBaseUrl.endsWith('/api')) {
    return trimmedBaseUrl;
  }

  return `${trimmedBaseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

const getHeaders = () => {
  const token = localStorage.getItem('aspira_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Return structured errors if validation errors exist
    if (data.errors) {
      throw { validationErrors: data.errors, message: data.message || 'Validation failed' };
    }
    throw { message: data.message || 'Something went wrong' };
  }
  return data;
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  postForm: async (endpoint, formData) => {
    // Do not set Content-Type so the browser sets the multipart boundary
    const token = localStorage.getItem('aspira_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  // fetch a binary resource (PDF) with auth headers
  getBlob: async (endpoint) => {
    const token = localStorage.getItem('aspira_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) return response.blob();

    // try to parse json error body
    try {
      const data = await response.json();
      throw { message: data.message || 'Failed to fetch resource' };
    } catch (err) {
      throw { message: 'Failed to fetch resource' };
    }
  },
};
