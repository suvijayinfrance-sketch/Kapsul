const BASE = import.meta.env.VITE_API_BASE ?? '';

async function apiFetch(url) {
  try {
    const res = await fetch(`${BASE}${url}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchKPIs() {
  return apiFetch('/api/admin/analytics/kpis');
}

export async function fetchHeatmap() {
  return apiFetch('/api/admin/analytics/heatmap');
}

export async function fetchTopDocuments() {
  return apiFetch('/api/admin/analytics/top-documents');
}
