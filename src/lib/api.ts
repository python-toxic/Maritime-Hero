// src/lib/api.ts - API Client for SOS Insights Hub
// Centralized API communication

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
      credentials: 'include', // Include cookies for auth
    });

    const raw = await response.text();
    let data: ApiResponse<T> & { error?: string; id?: number };
    try {
      data = raw ? JSON.parse(raw) : { success: false };
    } catch {
      throw new Error(
        response.ok
          ? 'Invalid response from server'
          : `Server error (${response.status}): ${raw.slice(0, 120) || response.statusText}`
      );
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Network request failed');
  }
}

// Auth endpoints - handled by PHP backend only
// No auth API calls from React frontend

// Articles endpoints
export const articlesApi = {
  list: (page = 1, limit = 20, category?: string, status = 'published') =>
    fetchApi(
      `/articles?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}&status=${status}`
    ),

  get: (id: string | number) => {
    const idStr = String(id).trim();
    const isNumeric = idStr !== '' && !isNaN(Number(idStr));
    const path = isNumeric
      ? `/articles/${idStr}`
      : `/articles/slug/${encodeURIComponent(idStr)}`;
    return fetchApi(path);
  },

  getBySlug: (slug: string) => fetchApi(`/articles/slug/${encodeURIComponent(slug)}`),

  search: (query: string, status = 'published', category?: string) =>
    fetchApi(`/articles/search?q=${encodeURIComponent(query)}&status=${status}${category ? `&category=${category}` : ''}`),

  create: (article: any) =>
    fetchApi('/articles/', {
      method: 'POST',
      body: JSON.stringify(article),
    }),

  update: (id: number, article: any) =>
    fetchApi(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    }),

  delete: (id: number) =>
    fetchApi(`/articles/${id}`, {
      method: 'DELETE',
    }),

  schedule: (id: number, scheduledAt: string) =>
    fetchApi(`/articles/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    }),

  publish: (id: number) =>
    fetchApi(`/articles/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  unschedule: (id: number) =>
    fetchApi(`/articles/${id}/unschedule`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

// FAQs endpoints
export const usersApi = {
  // Trailing slash avoids Apache POST→GET redirect on Hostinger
  list: async () => fetchApi('/users/'),
  create: async (data: any) =>
    fetchApi('/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: async (id: number, data: any) =>
    fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: async (id: number) =>
    fetchApi(`/users/${id}`, {
      method: 'DELETE',
    }),
};

export const faqsApi = {
  list: (page = 1, limit = 20, category?: string, status = 'published') =>
    fetchApi(
      `/faqs/?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}&status=${status}`
    ),

  get: (id: number) => fetchApi(`/faqs/${id}`),

  search: (query: string, status = 'published', category?: string) =>
    fetchApi(`/faqs/search?q=${encodeURIComponent(query)}&status=${status}${category ? `&category=${category}` : ''}`),

  create: (faq: any) =>
    fetchApi('/faqs/', {
      method: 'POST',
      body: JSON.stringify(faq),
    }),

  update: (id: number, faq: any) =>
    fetchApi(`/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faq),
    }),

  delete: (id: number) =>
    fetchApi(`/faqs/${id}`, {
      method: 'DELETE',
    }),
};

// Categories endpoints
export const categoriesApi = {
  list: (type?: 'articles' | 'faqs') =>
    fetchApi(`/categories${type ? `?type=${type}` : ''}`),

  create: (category: any) =>
    fetchApi('/categories/', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  update: (id: number, category: any) =>
    fetchApi(`/categories/update.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    }),

  delete: (id: number) =>
    fetchApi(`/categories/delete.php?id=${id}`, {
      method: 'DELETE',
    }),
};

// Images endpoints
export const imagesApi = {
  upload: async (file: File, articleId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (articleId) {
      formData.append('article_id', articleId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/images/upload/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const raw = await response.text();
    let data: { success?: boolean; url?: string; error?: string; message?: string; data?: { url?: string } };
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(
        response.ok
          ? 'Invalid upload response from server'
          : `Upload failed (${response.status})`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || `Upload failed (${response.status})`);
    }

    const url = data.url || data.data?.url;
    if (!url) {
      throw new Error('Upload succeeded but no image URL was returned');
    }

    return { ...data, url };
  },

  delete: (id: number) =>
    fetchApi(`/images/${id}`, {
      method: 'DELETE',
    }),
};

// PDFs endpoints
export const pdfsApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/pdfs/upload.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const raw = await response.text();
    let data: { success?: boolean; url?: string; pdf_file_path?: string; error?: string; message?: string };
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(
        response.ok
          ? 'Invalid upload response from server'
          : `Upload failed (${response.status})`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || `Upload failed (${response.status})`);
    }

    const url = data.pdf_file_path || data.url;
    if (!url) {
      throw new Error('Upload succeeded but no PDF URL was returned');
    }

    return { ...data, url };
  },
};

export default fetchApi;